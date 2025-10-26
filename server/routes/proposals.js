import express from 'express';
import Proposal from '../models/Proposal.js';
import FundCycle from '../models/FundCycle.js';
import { authenticateToken } from '../middleware/auth.js';
import { requireCoordinatorOrAdmin } from '../middleware/roleCheck.js';

const router = express.Router();

// Get proposals with filtering
router.get('/', authenticateToken, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      department,
      fundCycle,
      faculty,
    } = req.query;

    const query = {};

    // Role-based filtering
    if (req.user.role === 'faculty') {
      query.faculty = req.user._id;
    } else if (req.user.role === 'coordinator') {
      query.department = req.user.department._id;
    }

    // Additional filters
    if (status) query.status = status;
    if (department && req.user.role === 'admin') query.department = department;
    if (fundCycle) query.fundCycle = fundCycle;
    if (faculty && ['coordinator', 'admin'].includes(req.user.role)) {
      query.faculty = faculty;
    }

    const proposals = await Proposal.find(query)
      .populate('faculty', 'name email')
      .populate('department', 'name code')
      .populate('fundCycle', 'name academicYear')
      .populate('items.itemKeyword', 'name category')
      .populate('reviewedBy', 'name')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await Proposal.countDocuments(query);

    res.json({
      proposals,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get proposal by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const proposal = await Proposal.findById(req.params.id)
      .populate('faculty', 'name email')
      .populate('department', 'name code')
      .populate('fundCycle', 'name academicYear')
      .populate('items.itemKeyword', 'name category description')
      .populate('reviewedBy', 'name');

    if (!proposal) {
      return res.status(404).json({ error: 'Proposal not found' });
    }

    // Check access permissions
    const canAccess =
      req.user.role === 'admin' ||
      (req.user.role === 'coordinator' &&
        proposal.department._id.toString() ===
          req.user.department._id.toString()) ||
      (req.user.role === 'faculty' &&
        proposal.faculty._id.toString() === req.user._id.toString());

    if (!canAccess) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json(proposal);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create new proposal (faculty)
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { fundCycle, items, priority } = req.body;

    // Validate fund cycle is active and within submission deadline
    const cycle = await FundCycle.findById(fundCycle);
    if (!cycle || cycle.status !== 'active') {
      return res.status(400).json({ error: 'Invalid or inactive fund cycle' });
    }

    if (new Date() > cycle.submissionDeadline) {
      return res.status(400).json({ error: 'Submission deadline has passed' });
    }

    // Calculate total amount
    const totalAmount = items.reduce((sum, item) => sum + item.totalCost, 0);

    const proposal = new Proposal({
      faculty: req.user._id,
      department: req.user.department._id,
      fundCycle,
      items,
      totalAmount,
      priority: priority || 'medium',
    });

    await proposal.save();
    await proposal.populate([
      { path: 'faculty', select: 'name email' },
      { path: 'department', select: 'name code' },
      { path: 'fundCycle', select: 'name academicYear' },
      { path: 'items.itemKeyword', select: 'name category' },
    ]);

    res.status(201).json(proposal);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update proposal (faculty - only drafts)
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const proposal = await Proposal.findById(req.params.id);

    if (!proposal) {
      return res.status(404).json({ error: 'Proposal not found' });
    }

    // Only faculty can edit their own drafts
    if (
      proposal.faculty.toString() !== req.user._id.toString() ||
      proposal.status !== 'draft'
    ) {
      return res.status(403).json({ error: 'Cannot edit this proposal' });
    }

    const { items, priority } = req.body;
    const totalAmount = items.reduce((sum, item) => sum + item.totalCost, 0);

    const updatedProposal = await Proposal.findByIdAndUpdate(
      req.params.id,
      { items, totalAmount, priority },
      { new: true, runValidators: true }
    ).populate([
      { path: 'faculty', select: 'name email' },
      { path: 'department', select: 'name code' },
      { path: 'fundCycle', select: 'name academicYear' },
      { path: 'items.itemKeyword', select: 'name category' },
    ]);

    res.json(updatedProposal);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Submit proposal (faculty)
router.patch('/:id/submit', authenticateToken, async (req, res) => {
  try {
    const proposal = await Proposal.findById(req.params.id);

    if (!proposal) {
      return res.status(404).json({ error: 'Proposal not found' });
    }

    if (proposal.faculty.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Access denied' });
    }

    if (proposal.status !== 'draft') {
      return res.status(400).json({ error: 'Proposal already submitted' });
    }

    const updatedProposal = await Proposal.findByIdAndUpdate(
      req.params.id,
      {
        status: 'submitted',
        submittedAt: new Date(),
      },
      { new: true }
    );

    res.json(updatedProposal);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Review proposal (coordinator/admin)
router.patch(
  '/:id/review',
  authenticateToken,
  requireCoordinatorOrAdmin,
  async (req, res) => {
    try {
      const { status, reviewComments } = req.body;

      if (!['approved', 'rejected'].includes(status)) {
        return res.status(400).json({ error: 'Invalid review status' });
      }

      const proposal = await Proposal.findById(req.params.id);
      if (!proposal) {
        return res.status(404).json({ error: 'Proposal not found' });
      }

      if (!['submitted', 'under-review'].includes(proposal.status)) {
        return res.status(400).json({ error: 'Proposal cannot be reviewed' });
      }

      // Check if coordinator can review this proposal
      if (
        req.user.role === 'coordinator' &&
        proposal.department.toString() !== req.user.department._id.toString()
      ) {
        return res.status(403).json({ error: 'Access denied' });
      }

      // If approving, check budget availability
      if (status === 'approved') {
        const cycle = await FundCycle.findById(proposal.fundCycle);
        const deptBudget = cycle.departmentBudgets.find(
          (db) => db.department.toString() === proposal.department.toString()
        );

        if (
          !deptBudget ||
          deptBudget.spentAmount + proposal.totalAmount >
            deptBudget.allocatedAmount
        ) {
          return res.status(400).json({ error: 'Insufficient budget' });
        }

        // Update spent amount
        await FundCycle.findOneAndUpdate(
          {
            _id: proposal.fundCycle,
            'departmentBudgets.department': proposal.department,
          },
          {
            $inc: { 'departmentBudgets.$.spentAmount': proposal.totalAmount },
          }
        );
      }

      const updatedProposal = await Proposal.findByIdAndUpdate(
        req.params.id,
        {
          status,
          reviewComments,
          reviewedBy: req.user._id,
          reviewedAt: new Date(),
        },
        { new: true }
      ).populate([
        { path: 'faculty', select: 'name email' },
        { path: 'department', select: 'name code' },
        { path: 'reviewedBy', select: 'name' },
      ]);

      res.json(updatedProposal);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

// Delete proposal (faculty - only drafts)
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const proposal = await Proposal.findById(req.params.id);

    if (!proposal) {
      return res.status(404).json({ error: 'Proposal not found' });
    }

    if (
      proposal.faculty.toString() !== req.user._id.toString() ||
      proposal.status !== 'draft'
    ) {
      return res.status(403).json({ error: 'Cannot delete this proposal' });
    }

    await Proposal.findByIdAndDelete(req.params.id);
    res.json({ message: 'Proposal deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
