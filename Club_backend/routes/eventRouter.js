import express from 'express';
import Event from '../models/Event.js';
import { verifyToken, authorizeRole } from '../middleware/authMiddleware.js';
import upload from '../config/cloudinary.js';

const router = express.Router();

// Create a new event idea (any logged-in user can propose an idea)
router.post('/', verifyToken, async (req, res) => {
    try {
        const newEvent = new Event({
            ...req.body,
            organizers: [req.user.userId] // The user who creates it is an organizer
        });
        await newEvent.save();
        res.status(201).json(newEvent);
    } catch (error) {
        res.status(500).json({ message: 'Error creating event', error: error.message });
    }
});

// Get all events
router.get('/', async (req, res) => {
    try {
        // Populate organizers with their username
        const events = await Event.find().populate('organizers', 'username');
        res.json(events);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching events', error: error.message });
    }
});

// Get a specific event by ID
router.get('/:id', async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);
        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }
        res.json(event);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching event', error: error.message });
    }
});

// Vote for an event
router.post('/:id/vote', verifyToken, async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);
        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }

        const userId = req.user.userId;

        // Check if user has already voted
        if (event.votedBy.includes(userId)) {
            return res.status(400).json({ message: 'You have already voted for this event.' });
        }

        // Add user to votedBy list and increment votes
        event.votedBy.push(userId);
        event.votes += 1;

        await event.save();

        res.json(event);
    } catch (error) {
        res.status(500).json({ message: 'Error voting for event', error: error.message });
    }
});

// Approve an event (Admin only)
router.patch('/:id/approve', verifyToken, authorizeRole(['admin']), async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);
        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }

        event.approved = true;
        await event.save();

        res.json({ message: 'Event approved successfully', event });
    } catch (error) {
        res.status(500).json({ message: 'Error approving event', error: error.message });
    }
});

// Register for an event
router.post('/:id/register', verifyToken, async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);
        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }

        // Ensure the event is approved before allowing registration
        if (!event.approved) {
            return res.status(400).json({ message: 'This event is not yet approved for registration.' });
        }

        const userId = req.user.userId;

        // Check if user is already registered
        if (event.registeredUsers.includes(userId)) {
            return res.status(400).json({ message: 'You are already registered for this event.' });
        }

        event.registeredUsers.push(userId);
        await event.save();

        res.json({ message: 'Successfully registered for the event.', event });
    } catch (error) {
        res.status(500).json({ message: 'Error registering for event', error: error.message });
    }
});

// Get registered users for an event (Admin only)
router.get('/:id/registrants', verifyToken, authorizeRole(['admin']), async (req, res) => {
    try {
        const event = await Event.findById(req.params.id).populate('registeredUsers', 'username email');
        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }
        res.json(event.registeredUsers);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching registrants', error: error.message });
    }
});

// Delete an event (Admin only)
router.delete('/:id', verifyToken, authorizeRole(['admin']), async (req, res) => {
    try {
        const deletedEvent = await Event.findByIdAndDelete(req.params.id);
        if (!deletedEvent) {
            return res.status(404).json({ message: 'Event not found' });
        }
        res.json({ message: 'Event deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting event', error: error.message });
    }
});

// Add post-event details (organizer or admin only)
router.post('/:id/complete', verifyToken, upload.array('photos', 5), async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);
        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }

        const userId = req.user.userId;
        const userIsOrganizer = event.organizers.some(orgId => orgId.toString() === userId);
        const userIsAdmin = req.user.role === 'admin';

        if (!userIsOrganizer && !userIsAdmin) {
            return res.status(403).json({ message: 'Only the event organizer or an admin can update this event.' });
        }

        const { winnerName, postEventDescription } = req.body;
        event.winnerName = winnerName || event.winnerName;
        event.postEventDescription = postEventDescription || event.postEventDescription;

        if (req.files) {
            const photoUrls = req.files.map(file => file.path);
            event.photos.push(...photoUrls);
        }

        await event.save();
        res.json(event);
    } catch (error) {
        res.status(500).json({ message: 'Error updating event completion details', error: error.message });
    }
});

export default router;