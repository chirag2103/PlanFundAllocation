import express from 'express';
import FundCycle from '../models/FundCycle.js';
import { authenticateToken as authenticate } from '../middleware/auth.js';

const router = express.Router();

// Check for date overlap within same department
const checkDateOverlap = async (
  departmentId,
  startDate,
  endDate,
  excludeCycleId = null
) => {
  const query = {
    department: departmentId,
    $or: [
      // New cycle starts during existing cycle
      { startDate: { $lte: endDate }, endDate: { $gte: startDate } },
      // New cycle contains existing cycle
      { startDate: { $gte: startDate }, endDate: { $lte: endDate } },
    ],
  };

  if (excludeCycleId) {
    query._id = { $ne: excludeCycleId };
  }

  const overlappingCycles = await FundCycle.find(query);
  return overlappingCycles.length > 0 ? overlappingCycles : null;
};

// Get cycles
router.get('/', authenticate, async (req, res) => {
  try {
    const { status } = req.query;
    let query = {};

    // Faculty: only see cycles from their department that are active
    if (req.user.role === 'faculty') {
      query.department = req.user.department;
      query.status = 'active'; // Faculty only see active cycles
    }

    // Coordinator: only see cycles they created (their department)
    if (req.user.role === 'coordinator') {
      query.department = req.user.department;
    }

    // Admin: see all cycles
    // (no filter for admin)

    if (status) {
      query.status = status;
    }

    const cycles = await FundCycle.find(query)
      .populate('createdBy', 'name email')
      .populate('department', 'name code budget')
      .sort({ createdAt: -1 });

    res.json(cycles);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single cycle
router.get('/:id', authenticate, async (req, res) => {
  try {
    const cycle = await FundCycle.findById(req.params.id)
      .populate('createdBy', 'name email')
      .populate('department', 'name code budget');

    if (!cycle) {
      return res.status(404).json({ error: 'Cycle not found' });
    }

    // Check access permissions
    if (req.user.role === 'faculty') {
      if (cycle.department._id.toString() !== req.user.department.toString()) {
        return res.status(403).json({ error: 'Access denied' });
      }
    }

    if (req.user.role === 'coordinator') {
      if (cycle.department._id.toString() !== req.user.department.toString()) {
        return res.status(403).json({ error: 'Access denied' });
      }
    }

    res.json(cycle);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create cycle (coordinator only, for their department)
router.post('/', authenticate, async (req, res) => {
  try {
    // Only coordinator can create cycles
    if (req.user.role !== 'coordinator') {
      return res
        .status(403)
        .json({ error: 'Only coordinators can create cycles' });
    }

    const {
      name,
      academicYear,
      startDate,
      endDate,
      allocatedBudget,
      description,
    } = req.body;

    // Validate coordinator has department
    if (!req.user.department) {
      return res
        .status(400)
        .json({ error: 'Coordinator must have department assigned' });
    }

    // Validate dates
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (start >= end) {
      return res
        .status(400)
        .json({ error: 'End date must be after start date' });
    }

    // Check for overlapping cycles in same department
    const overlappingCycles = await checkDateOverlap(
      req.user.department,
      start,
      end
    );

    if (overlappingCycles) {
      return res.status(400).json({
        error: 'Date range overlaps with existing cycle(s) in your department',
        overlappingCycles: overlappingCycles.map((c) => ({
          name: c.name,
          startDate: c.startDate,
          endDate: c.endDate,
        })),
      });
    }

    // Create cycle
    const cycle = new FundCycle({
      name,
      academicYear,
      startDate: start,
      endDate: end,
      department: req.user.department,
      allocatedBudget: parseFloat(allocatedBudget) || 0,
      spentBudget: 0,
      status: 'draft',
      description,
      createdBy: req.user._id,
    });

    await cycle.save();
    await cycle.populate('department', 'name code budget');
    await cycle.populate('createdBy', 'name email');

    res.status(201).json(cycle);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update cycle (coordinator only)
router.put('/:id', authenticate, async (req, res) => {
  try {
    if (req.user.role !== 'coordinator') {
      return res
        .status(403)
        .json({ error: 'Only coordinators can update cycles' });
    }

    const cycle = await FundCycle.findById(req.params.id);
    if (!cycle) {
      return res.status(404).json({ error: 'Cycle not found' });
    }

    // Check ownership
    if (cycle.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Can only update own cycles' });
    }

    // Can't edit active or closed cycles
    if (cycle.status !== 'draft') {
      return res.status(400).json({ error: 'Can only edit draft cycles' });
    }

    const {
      name,
      academicYear,
      startDate,
      endDate,
      allocatedBudget,
      description,
    } = req.body;

    // Update fields
    if (name) cycle.name = name;
    if (academicYear) cycle.academicYear = academicYear;
    if (description !== undefined) cycle.description = description;
    if (allocatedBudget !== undefined)
      cycle.allocatedBudget = parseFloat(allocatedBudget);

    // If dates are being updated, check for overlaps
    if (startDate || endDate) {
      const newStart = startDate ? new Date(startDate) : cycle.startDate;
      const newEnd = endDate ? new Date(endDate) : cycle.endDate;

      if (newStart >= newEnd) {
        return res
          .status(400)
          .json({ error: 'End date must be after start date' });
      }

      // Check overlaps (excluding current cycle)
      const overlappingCycles = await checkDateOverlap(
        cycle.department,
        newStart,
        newEnd,
        cycle._id
      );

      if (overlappingCycles) {
        return res.status(400).json({
          error: 'Date range overlaps with existing cycle(s)',
          overlappingCycles: overlappingCycles.map((c) => ({
            name: c.name,
            startDate: c.startDate,
            endDate: c.endDate,
          })),
        });
      }

      cycle.startDate = newStart;
      cycle.endDate = newEnd;
    }

    await cycle.save();
    await cycle.populate('department', 'name code budget');
    await cycle.populate('createdBy', 'name email');

    res.json(cycle);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Activate cycle (coordinator only)
router.patch('/:id/activate', authenticate, async (req, res) => {
  try {
    if (req.user.role !== 'coordinator') {
      return res
        .status(403)
        .json({ error: 'Only coordinators can activate cycles' });
    }

    const cycle = await FundCycle.findById(req.params.id);
    if (!cycle) {
      return res.status(404).json({ error: 'Cycle not found' });
    }

    // Check ownership
    if (cycle.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Can only activate own cycles' });
    }

    if (cycle.status === 'active') {
      return res.status(400).json({ error: 'Cycle is already active' });
    }

    if (cycle.status === 'closed') {
      return res.status(400).json({ error: 'Cannot activate closed cycle' });
    }

    cycle.status = 'active';
    await cycle.save();

    res.json(cycle);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Close cycle (coordinator only)
router.patch('/:id/close', authenticate, async (req, res) => {
  try {
    if (req.user.role !== 'coordinator') {
      return res
        .status(403)
        .json({ error: 'Only coordinators can close cycles' });
    }

    const cycle = await FundCycle.findById(req.params.id);
    if (!cycle) {
      return res.status(404).json({ error: 'Cycle not found' });
    }

    // Check ownership
    if (cycle.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Can only close own cycles' });
    }

    if (cycle.status === 'closed') {
      return res.status(400).json({ error: 'Cycle is already closed' });
    }

    cycle.status = 'closed';
    await cycle.save();

    res.json(cycle);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete cycle (coordinator only, draft only)
router.delete('/:id', authenticate, async (req, res) => {
  try {
    if (req.user.role !== 'coordinator') {
      return res
        .status(403)
        .json({ error: 'Only coordinators can delete cycles' });
    }

    const cycle = await FundCycle.findById(req.params.id);
    if (!cycle) {
      return res.status(404).json({ error: 'Cycle not found' });
    }

    // Check ownership
    if (cycle.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Can only delete own cycles' });
    }

    // Can only delete draft cycles
    if (cycle.status !== 'draft') {
      return res.status(400).json({ error: 'Can only delete draft cycles' });
    }

    await FundCycle.findByIdAndDelete(req.params.id);
    res.json({ message: 'Cycle deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
