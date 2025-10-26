import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { mockUsers } from '../utils/mockUsers.js';

export const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'Access token required' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'dev-secret');

    // Always use mock users in development (simpler check)
    const useMockUsers =
      !process.env.MONGO_URI || process.env.NODE_ENV === 'development';

    if (useMockUsers) {
      // Use mock users
      const user = mockUsers.find((u) => u._id === decoded.id);
      if (!user || !user.isActive) {
        return res
          .status(401)
          .json({ error: 'Invalid token or user inactive' });
      }
      req.user = user;
      next();
    } else {
      // Use database in production
      const user = await User.findById(decoded.id).populate('department');
      if (!user || !user.isActive) {
        return res
          .status(401)
          .json({ error: 'Invalid token or user inactive' });
      }
      req.user = user;
      next();
    }
  } catch (error) {
    console.error('Auth error:', error.message);
    return res.status(403).json({ error: 'Invalid token' });
  }
};

export const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'dev-secret');

      const useMockUsers =
        !process.env.MONGO_URI || process.env.NODE_ENV === 'development';

      if (useMockUsers) {
        const user = mockUsers.find((u) => u._id === decoded.id);
        if (user && user.isActive) {
          req.user = user;
        }
      } else {
        const user = await User.findById(decoded.id).populate('department');
        if (user && user.isActive) {
          req.user = user;
        }
      }
    }
    next();
  } catch (error) {
    next();
  }
};
