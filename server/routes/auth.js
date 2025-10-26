import express from 'express';
import passport from 'passport';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { authenticateToken } from '../middleware/auth.js';
import { mockUsers } from '../utils/mockUsers.js';

const router = express.Router();

// ============================================
// DEVELOPMENT ONLY - Mock Login Routes
// ============================================

// Get available mock users
router.get('/dev/users', (req, res) => {
  console.log('Dev users route hit!'); // Debug log
  res.json(
    mockUsers.map((u) => ({
      id: u._id,
      name: u.name,
      email: u.email,
      role: u.role,
    }))
  );
});

// Login as specific user
router.post('/dev/login', (req, res) => {
  try {
    const { userId } = req.body;
    console.log('Dev login attempt for userId:', userId); // Debug log

    const user = mockUsers.find((u) => u._id === userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || 'dev-secret',
      { expiresIn: '24h' }
    );

    res.json({ token, user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// Production OAuth Routes
// ============================================

// Google OAuth routes
router.get(
  '/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

router.get(
  '/google/callback',
  passport.authenticate('google', { failureRedirect: '/login' }),
  async (req, res) => {
    try {
      const token = jwt.sign(
        { id: req.user._id, role: req.user.role },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );

      // Update last login
      await User.findByIdAndUpdate(req.user._id, { lastLogin: new Date() });

      const redirectUrl = `${process.env.CLIENT_URL}/auth/callback?token=${token}`;
      res.redirect(redirectUrl);
    } catch (error) {
      console.error('Auth callback error:', error);
      res.redirect(`${process.env.CLIENT_URL}/login?error=auth_failed`);
    }
  }
);

// Get current user
router.get('/me', authenticateToken, (req, res) => {
  res.json(req.user);
});

// Logout
router.post('/logout', authenticateToken, (req, res) => {
  req.logout();
  res.json({ message: 'Logged out successfully' });
});

// Refresh token
router.post('/refresh', authenticateToken, async (req, res) => {
  try {
    const token = jwt.sign(
      { id: req.user._id, role: req.user.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
    res.json({ token });
  } catch (error) {
    res.status(500).json({ error: 'Token refresh failed' });
  }
});

export default router;
