import express from "express";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Event from '../models/Event.js';
import upload from '../config/cloudinary.js';
import { verifyToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// User Registration
router.post('/register', async (req, res) => {
  try {
    const { username, password, email } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: 'Username already taken' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const newUser = new User({
      username,
      password: hashedPassword,
      email,
    });

    // Save user to database
    await newUser.save();

    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).json({ message: 'Error registering user' });
  }
});

// User Login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    // Check if user exists
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Create and assign a token
    const token = jwt.sign({ userId: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.json({ message: 'Logged in successfully', token, user });
  } catch (error) {
    console.error('Error logging in:', error);
    res.status(500).json({ message: 'Error logging in' });
  }
});

// Upload user profile picture
router.put('/profile/photo', verifyToken, upload.single('avatar'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded.' });
    }

    const user = await User.findById(req.user.userId);
    user.avatar = req.file.path; // URL from Cloudinary
    await user.save();

    res.json({ message: 'Profile photo updated successfully.', user });
  } catch (error) {
    res.status(500).json({ message: 'Error uploading photo', error: error.message });
  }
});

// Get current user's full profile details
router.get('/profile/me', verifyToken, async (req, res) => {
  try {
    // Find user and populate the teams they are a member of
    const userProfile = await User.findById(req.user.userId)
      .select('-password') // Exclude password from the result
      .populate('teams', 'name description avatar');

    if (!userProfile) {
      return res.status(404).json({ message: 'User not found.' });
    }

    // Find events the user has registered for
    const registeredEvents = await Event.find({ registeredUsers: req.user.userId, approved: true }, 'name date description');

    res.json({ userProfile, registeredEvents });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching profile data', error: error.message });
  }
});

export default router;
