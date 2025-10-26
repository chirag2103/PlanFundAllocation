import express from 'express';
import FundCycle from '../models/FundCycle.js';
import Department from '../models/Department.js';
import { authenticateToken } from '../middleware/auth.js';
import { requireCoordinatorOrAdmin } from '../middleware/roleCheck.js';

const router = express.Router();

// Get all fund cycles
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { status, academicYear } = req.query;
    const query = {};

    if (status) query.status = status;
    if (academicYear) query.academicYear = academicYear;

    const cycles = await FundCycle.find(query)
      .populate('createdBy', 'name')
      .populate('departmentBudgets.department', 'name code')
      .sort({ createdAt: -1 });

    res.json(cycles);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get cycle by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const cycle = await FundCycle.findById(req.params.id)
      .populate('createdBy', 'name')
      .populate('departmentBudgets.department', 'name code');

    if (!cycle) {
      return res.status(404).json({ error: 'Cycle not found' });
    }

    res.json(cycle);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create new fund cycle (coordinator/admin)
router.post(
  '/',
  authenticateToken,
  requireCoordinatorOrAdmin,
  async (req, res) => {
    try {
      const {
        name,
        academicYear,
        startDate,
        endDate,
        submissionDeadline,
        reviewDeadline,
        totalBudget,
        departmentBudgets,
        description,
      } = req.body;

      // Validate dates
      const start = new Date(startDate);
      const end = new Date(endDate);
      const submission = new Date(submissionDeadline);
      const review = new Date(reviewDeadline);

      if (start >= end || submission >= review || submission <= start) {
        return res.status(400).json({ error: 'Invalid date configuration' });
      }

      // Validate budget allocation
      const totalAllocated = departmentBudgets.reduce(
        (sum, dept) => sum + dept.allocatedAmount,
        0
      );
      if (totalAllocated > totalBudget) {
        return res
          .status(400)
          .json({ error: 'Department budgets exceed total budget' });
      }

      const cycle = new FundCycle({
        name,
        academicYear,
        startDate: start,
        endDate: end,
        submissionDeadline: submission,
        reviewDeadline: review,
        totalBudget,
        departmentBudgets,
        createdBy: req.user._id,
        description,
      });

      await cycle.save();
      await cycle.populate(['createdBy', 'departmentBudgets.department']);

      res.status(201).json(cycle);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

// Update fund cycle (coordinator/admin)
router.put(
  '/:id',
  authenticateToken,
  requireCoordinatorOrAdmin,
  async (req, res) => {
    try {
      const cycle = await FundCycle.findById(req.params.id);
      if (!cycle) {
        return res.status(404).json({ error: 'Cycle not found' });
      }

      // Can't modify active cycles with submitted proposals
      if (cycle.status === 'active') {
        return res
          .status(400)
          .json({ error: 'Cannot modify active cycle with proposals' });
      }

      const updatedCycle = await FundCycle.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true, runValidators: true }
      ).populate(['createdBy', 'departmentBudgets.department']);

      res.json(updatedCycle);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

// Activate fund cycle (coordinator/admin)
router.patch(
  '/:id/activate',
  authenticateToken,
  requireCoordinatorOrAdmin,
  async (req, res) => {
    try {
      const cycle = await FundCycle.findByIdAndUpdate(
        req.params.id,
        { status: 'active' },
        { new: true }
      );

      if (!cycle) {
        return res.status(404).json({ error: 'Cycle not found' });
      }

      res.json(cycle);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

// Close fund cycle (coordinator/admin)
router.patch(
  '/:id/close',
  authenticateToken,
  requireCoordinatorOrAdmin,
  async (req, res) => {
    try {
      const cycle = await FundCycle.findByIdAndUpdate(
        req.params.id,
        { status: 'closed' },
        { new: true }
      );

      if (!cycle) {
        return res.status(404).json({ error: 'Cycle not found' });
      }

      res.json(cycle);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

export default router;
