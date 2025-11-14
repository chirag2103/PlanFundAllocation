import express from 'express';
import ItemKeyword from '../models/ItemKeyword.js';
import { authenticateToken as authenticate } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/roleCheck.js';

const router = express.Router();

// Get item keywords (filter by department for faculty)
router.get('/', authenticate, async (req, res) => {
  try {
    const { category, search, department } = req.query;
    let query = { isActive: true };

    // Faculty sees only their department items
    if (req.user.role === 'faculty') {
      query.department = req.user.department;
    }
    // Coordinator sees only their department items
    else if (req.user.role === 'coordinator') {
      query.department = req.user.department;
    }
    // Admin sees all items (no filter)

    if (category) {
      query.category = category;
    }

    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }

    if (department) {
      query.department = department;
    }

    const items = await ItemKeyword.find(query)
      .populate('department', 'name code')
      .populate('createdBy', 'name')
      .sort({ category: 1, name: 1 });

    res.json(items);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create item keyword (admin only)
router.post('/', authenticate, requireAdmin, async (req, res) => {
  try {
    const { name, category, description, department } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Item name is required' });
    }

    if (!department) {
      return res.status(400).json({ error: 'Department is required' });
    }

    const item = new ItemKeyword({
      name,
      category,
      description,
      department,
      createdBy: req.user._id,
    });

    await item.save();
    await item.populate('department', 'name code');
    await item.populate('createdBy', 'name');

    res.status(201).json(item);
  } catch (error) {
    if (error.code === 11000) {
      res.status(400).json({ error: 'Item with this name already exists' });
    } else {
      res.status(500).json({ error: error.message });
    }
  }
});

// Update item keyword (admin only)
router.put('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const { name, category, description, department } = req.body;

    const item = await ItemKeyword.findByIdAndUpdate(
      req.params.id,
      { name, category, description, department },
      { new: true, runValidators: true }
    )
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

// Delete item keyword (admin only)
router.delete('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const item = await ItemKeyword.findByIdAndDelete(req.params.id);

    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }

    res.json({ message: 'Item deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
