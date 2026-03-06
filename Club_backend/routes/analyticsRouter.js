import express from 'express';
import User from '../models/User.js';
import Event from '../models/Event.js';
import Team from '../models/Team.js';
import { verifyToken, authorizeRole } from '../middleware/authMiddleware.js';

const router = express.Router();

// Get basic stats (Admin only)
router.get('/stats', verifyToken, authorizeRole(['admin']), async (req, res) => {
    try {
        const userCount = await User.countDocuments();
        const eventCount = await Event.countDocuments();
        const teamCount = await Team.countDocuments();

        // Find most popular event by registrations
        const popularEvent = await Event.findOne({ approved: true })
            .sort({ registeredUsers: -1 })
            .limit(1);

        res.json({
            users: {
                total: userCount,
            },
            events: {
                total: eventCount,
                mostPopular: popularEvent ? { name: popularEvent.name, registrations: popularEvent.registeredUsers.length } : null,
            },
            teams: {
                total: teamCount,
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching analytics stats', error: error.message });
    }
});

export default router;