import express from 'express';
import Team from '../models/Team.js';
import User from '../models/User.js';
import { verifyToken, authorizeRole } from '../middleware/authMiddleware.js';
import upload from '../config/cloudinary.js';

const router = express.Router();

// Get all teams
router.get('/', async (req, res) => {
    try {
        const teams = await Team.find().populate('leader', 'username').populate('members', 'username').populate('pendingRequests', 'username');
        res.json(teams);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching teams', error: error.message });
    }
});

// Create a new team
router.post('/', verifyToken, upload.single('avatar'), async (req, res) => {
    try {
        const { name, description } = req.body;
        const userId = req.user.userId;

        const teamData = {
            name,
            description,
            leader: userId,
            members: [userId] // The creator is automatically a member
        };

        if (req.file) {
            teamData.avatar = req.file.path;
        }

        const newTeam = new Team(teamData);

        await newTeam.save();

        // Re-fetch the team to populate leader and members
        const populatedTeam = await Team.findById(newTeam._id).populate('leader', 'username').populate('members', 'username').populate('pendingRequests', 'username');

        res.status(201).json(populatedTeam);
    } catch (error) {
        res.status(500).json({ message: 'Error creating team', error: error.message });
    }
});

// Request to join a team
router.post('/:id/request-join', verifyToken, async (req, res) => {
    try {
        const team = await Team.findById(req.params.id);
        if (!team) {
            return res.status(404).json({ message: 'Team not found' });
        }

        const userId = req.user.userId;

        // Check if user is already a member
        if (team.members.includes(userId)) {
            return res.status(400).json({ message: 'You are already a member of this team.' });
        }

        // Check if user has already requested to join
        if (team.pendingRequests.includes(userId)) {
            return res.status(400).json({ message: 'You have already requested to join this team.' });
        }

        team.pendingRequests.push(userId);
        await team.save();

        const updatedTeam = await Team.findById(req.params.id).populate('leader', 'username').populate('members', 'username').populate('pendingRequests', 'username');
        res.json(updatedTeam);
    } catch (error) {
        res.status(500).json({ message: 'Error requesting to join team', error: error.message });
    }
});

// Approve a join request (leader only)
router.post('/:id/approve-request', verifyToken, async (req, res) => {
    try {
        const team = await Team.findById(req.params.id);
        if (!team) {
            return res.status(404).json({ message: 'Team not found' });
        }

        // Check if the current user is the team leader
        if (team.leader.toString() !== req.user.userId) {
            return res.status(403).json({ message: 'Only the team leader can approve requests.' });
        }

        const { userIdToApprove } = req.body;

        // Move user from pending to members
        team.pendingRequests.pull(userIdToApprove);
        team.members.addToSet(userIdToApprove);
        await team.save();

        await User.findByIdAndUpdate(userIdToApprove, { $addToSet: { teams: team._id } });

        const updatedTeam = await Team.findById(req.params.id).populate('leader', 'username').populate('members', 'username').populate('pendingRequests', 'username');
        res.json(updatedTeam);
    } catch (error) {
        res.status(500).json({ message: 'Error approving request', error: error.message });
    }
});

// Reject a join request (leader only)
router.post('/:id/reject-request', verifyToken, async (req, res) => {
    try {
        const team = await Team.findById(req.params.id);
        if (!team) {
            return res.status(404).json({ message: 'Team not found' });
        }

        if (team.leader.toString() !== req.user.userId) {
            return res.status(403).json({ message: 'Only the team leader can reject requests.' });
        }

        const { userIdToReject } = req.body;
        team.pendingRequests.pull(userIdToReject);
        await team.save();

        const updatedTeam = await Team.findById(req.params.id).populate('leader', 'username').populate('members', 'username').populate('pendingRequests', 'username');

        res.json(updatedTeam);
    } catch (error) {
        res.status(500).json({ message: 'Error joining team', error: error.message });
    }
});

// Delete a team (Admin only)
router.delete('/:id', verifyToken, authorizeRole(['admin']), async (req, res) => {
    try {
        const teamId = req.params.id;
        const deletedTeam = await Team.findByIdAndDelete(teamId);

        if (!deletedTeam) {
            return res.status(404).json({ message: 'Team not found' });
        }

        // Remove the team from all users who were members
        await User.updateMany(
            { teams: teamId },
            { $pull: { teams: teamId } }
        );

        res.json({ message: 'Team deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting team', error: error.message });
    }
});


export default router;