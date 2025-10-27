import express from 'express';
import ItemKeyword from '../models/ItemKeyword.js';
import { authenticateToken } from '../middleware/auth.js';
import {
  requireAdmin,
  requireCoordinatorOrAdmin,
} from '../middleware/roleCheck.js';

const router = express.Router();

// Get all item keywords
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { department, category, search } = req.query;
    const query = { isActive: true };

    if (department) query.department = department;
    if (category) query.category = category;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const items = await ItemKeyword.find(query)
      .populate('department', 'name code')
      .populate('createdBy', 'name')
      .sort({ name: 1 });

    res.json(items);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get item keyword by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const item = await ItemKeyword.findById(req.params.id)
      .populate('department', 'name code')
      .populate('createdBy', 'name');

    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }

    res.json(item);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create new item keyword (admin/coordinator)
router.post(
  '/',
  authenticateToken,
  requireCoordinatorOrAdmin,
  async (req, res) => {
    try {
      const { name, category, description, department, estimatedCost } =
        req.body;

      const item = new ItemKeyword({
        name,
        category,
        description,
        department: department || req.user.department._id,
        estimatedCost,
        createdBy: req.user._id,
      });

      await item.save();
      await item.populate(['department', 'createdBy']);

      res.status(201).json(item);
    } catch (error) {
      if (error.code === 11000) {
        res
          .status(400)
          .json({ error: 'Item already exists in this department' });
      } else {
        res.status(500).json({ error: error.message });
      }
    }
  }
);

// Update item keyword (admin/coordinator)
router.put(
  '/:id',
  authenticateToken,
  requireCoordinatorOrAdmin,
  async (req, res) => {
    try {
      const { name, category, description, estimatedCost } = req.body;

      const item = await ItemKeyword.findById(req.params.id);
      if (!item) {
        return res.status(404).json({ error: 'Item not found' });
      }

      // Check if user can edit this item
      if (
        req.user.role !== 'admin' &&
        item.department.toString() !== req.user.department._id.toString()
      ) {
        return res.status(403).json({ error: 'Access denied' });
      }

      const updatedItem = await ItemKeyword.findByIdAndUpdate(
        req.params.id,
        { name, category, description, estimatedCost },
        { new: true, runValidators: true }
      ).populate(['department', 'createdBy']);

      res.json(updatedItem);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

// Delete item keyword (admin/coordinator)
router.delete(
  '/:id',
  authenticateToken,
  requireCoordinatorOrAdmin,
  async (req, res) => {
    try {
      const item = await ItemKeyword.findById(req.params.id);
      if (!item) {
        return res.status(404).json({ error: 'Item not found' });
      }

      // Check if user can delete this item
      if (
        req.user.role !== 'admin' &&
        item.department.toString() !== req.user.department._id.toString()
      ) {
        return res.status(403).json({ error: 'Access denied' });
      }

      await ItemKeyword.findByIdAndUpdate(req.params.id, { isActive: false });
      res.json({ message: 'Item deleted successfully' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

export default router;
