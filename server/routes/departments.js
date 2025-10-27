import express from 'express';
import Department from '../models/Department.js';
import { authenticateToken } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/roleCheck.js';

const router = express.Router();

// Get all departments
router.get('/', authenticateToken, async (req, res) => {
  try {
    const departments = await Department.find({ isActive: true })
      .populate('coordinator', 'name email')
      .sort({ name: 1 });
    res.json(departments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get department by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const department = await Department.findById(req.params.id).populate(
      'coordinator',
      'name email'
    );

    if (!department) {
      return res.status(404).json({ error: 'Department not found' });
    }

    res.json(department);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create new department (admin only)
router.post('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { name, code, coordinator, budget, description } = req.body;

    const department = new Department({
      name,
      code,
      coordinator,
      budget,
      description,
    });

    await department.save();
    await department.populate('coordinator', 'name email');

    res.status(201).json(department);
  } catch (error) {
    if (error.code === 11000) {
      res.status(400).json({ error: 'Department name or code already exists' });
    } else {
      res.status(500).json({ error: error.message });
    }
  }
});

// Update department (admin only)
router.put('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { name, code, coordinator, budget, description } = req.body;

    const department = await Department.findByIdAndUpdate(
      req.params.id,
      { name, code, coordinator, budget, description },
      { new: true, runValidators: true }
    ).populate('coordinator', 'name email');

    if (!department) {
      return res.status(404).json({ error: 'Department not found' });
    }

    res.json(department);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete department (admin only)
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const department = await Department.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!department) {
      return res.status(404).json({ error: 'Department not found' });
    }

    res.json({ message: 'Department deactivated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
