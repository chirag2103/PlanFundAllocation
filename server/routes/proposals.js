import express from 'express';
import Proposal from '../models/Proposal.js';
import FundCycle from '../models/FundCycle.js';
import { authenticateToken as authenticate } from '../middleware/auth.js';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

// Get proposals
router.get('/', authenticate, async (req, res) => {
  try {
    const { status, priority, limit } = req.query;
    let query = {};

    if (req.user.role === 'faculty') {
      query.faculty = req.user._id;
    }

    if (req.user.role === 'coordinator') {
      query.department = req.user.department;
    }

    if (status) query.status = status;
    if (priority) query.priority = priority;

    let proposalsQuery = Proposal.find(query)
      .populate('faculty', 'name email')
      .populate('department', 'name code')
      .populate('fundCycle', 'name academicYear')
      .populate('items.itemKeyword', 'name category') // FIXED: Populate item keyword details
      .populate('reviewedBy', 'name')
      .sort({ createdAt: -1 });

    if (limit) {
      proposalsQuery = proposalsQuery.limit(parseInt(limit));
    }

    const proposals = await proposalsQuery;

    res.json({
      proposals,
      total: proposals.length,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single proposal by ID
router.get('/:id', authenticate, async (req, res) => {
  try {
    const proposal = await Proposal.findById(req.params.id)
      .populate('faculty', 'name email')
      .populate('department', 'name code')
      .populate('fundCycle', 'name academicYear')
      .populate('items.itemKeyword', 'name category') // FIXED: Populate item keyword details
      .populate('reviewedBy', 'name');

    if (!proposal) {
      return res.status(404).json({ error: 'Proposal not found' });
    }

    res.json(proposal);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create proposal (faculty only)
router.post('/', authenticate, async (req, res) => {
  try {
    if (req.user.role !== 'faculty') {
      return res
        .status(403)
        .json({ error: 'Only faculty can create proposals' });
    }

    const { fundCycle, items, priority } = req.body;

    const cycle = await FundCycle.findById(fundCycle);
    if (!cycle) {
      return res.status(404).json({ error: 'Fund cycle not found' });
    }

    if (cycle.status !== 'active') {
      return res.status(400).json({ error: 'Fund cycle is not active' });
    }

    if (cycle.department.toString() !== req.user.department._id.toString()) {
      return res.status(403).json({
        error: 'This fund cycle is not available for your department',
      });
    }

    if (!items || items.length === 0) {
      return res.status(400).json({ error: 'At least one item is required' });
    }

    const validItems = items.every(
      (item) =>
        item.itemKeyword && item.quantity && item.unitCost && item.justification
    );

    if (!validItems) {
      return res.status(400).json({
        error: 'All items must have keyword, quantity, cost, and justification',
      });
    }

    const totalAmount = items.reduce((sum, item) => sum + item.totalCost, 0);

    const proposal = new Proposal({
      proposalId: `PROP-${uuidv4()}`,
      faculty: req.user._id,
      department: req.user.department,
      fundCycle,
      items,
      totalAmount,
      priority: priority || 'medium',
      status: 'draft',
    });

    await proposal.save();
    await proposal.populate('faculty', 'name email');
    await proposal.populate('department', 'name code');
    await proposal.populate('fundCycle', 'name academicYear');
    await proposal.populate('items.itemKeyword', 'name category'); // FIXED: Populate item details

    res.status(201).json(proposal);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update proposal (faculty only, draft status)
router.put('/:id', authenticate, async (req, res) => {
  try {
    if (req.user.role !== 'faculty') {
      return res
        .status(403)
        .json({ error: 'Only faculty can update proposals' });
    }

    const proposal = await Proposal.findById(req.params.id);
    if (!proposal) {
      return res.status(404).json({ error: 'Proposal not found' });
    }

    if (proposal.faculty.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Can only update own proposals' });
    }

    if (proposal.status !== 'draft') {
      return res.status(400).json({ error: 'Can only edit draft proposals' });
    }

    const { fundCycle, items, priority } = req.body;

    if (fundCycle && fundCycle !== proposal.fundCycle.toString()) {
      const cycle = await FundCycle.findById(fundCycle);
      if (!cycle) {
        return res.status(404).json({ error: 'Fund cycle not found' });
      }

      if (cycle.status !== 'active') {
        return res.status(400).json({ error: 'Fund cycle is not active' });
      }

      if (cycle.department.toString() !== req.user.department._id.toString()) {
        return res.status(403).json({
          error: 'This fund cycle is not available for your department',
        });
      }

      proposal.fundCycle = fundCycle;
    }

    if (items) {
      proposal.items = items;
      proposal.totalAmount = items.reduce(
        (sum, item) => sum + item.totalCost,
        0
      );
    }

    if (priority) proposal.priority = priority;

    await proposal.save();
    await proposal.populate('faculty', 'name email');
    await proposal.populate('department', 'name code');
    await proposal.populate('fundCycle', 'name academicYear');
    await proposal.populate('items.itemKeyword', 'name category'); // FIXED: Populate item details

    res.json(proposal);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Submit proposal (faculty)
router.patch('/:id/submit', authenticate, async (req, res) => {
  try {
    if (req.user.role !== 'faculty') {
      return res
        .status(403)
        .json({ error: 'Only faculty can submit proposals' });
    }

    const proposal = await Proposal.findById(req.params.id);
    if (!proposal) {
      return res.status(404).json({ error: 'Proposal not found' });
    }

    if (proposal.faculty.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Can only submit own proposals' });
    }

    proposal.status = 'submitted';
    proposal.submittedAt = new Date();
    await proposal.save();

    res.json(proposal);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Approve proposal (coordinator only)
router.patch('/:id/approve', authenticate, async (req, res) => {
  try {
    if (req.user.role !== 'coordinator') {
      return res
        .status(403)
        .json({ error: 'Only coordinators can approve proposals' });
    }

    const proposal = await Proposal.findById(req.params.id);
    if (!proposal) {
      return res.status(404).json({ error: 'Proposal not found' });
    }

    // Check if proposal is from coordinator's department
    if (proposal.department.toString() !== req.user.department._id.toString()) {
      return res
        .status(403)
        .json({ error: 'Can only review proposals from own department' });
    }

    const { comments } = req.body;

    proposal.status = 'approved';
    proposal.reviewedBy = req.user._id;
    proposal.reviewedAt = new Date();
    proposal.reviewComments = comments || '';

    await proposal.save();
    await proposal.populate('reviewedBy', 'name');

    res.json(proposal);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Reject proposal (coordinator only)
router.patch('/:id/reject', authenticate, async (req, res) => {
  try {
    if (req.user.role !== 'coordinator') {
      return res
        .status(403)
        .json({ error: 'Only coordinators can reject proposals' });
    }

    const proposal = await Proposal.findById(req.params.id);
    if (!proposal) {
      return res.status(404).json({ error: 'Proposal not found' });
    }

    // Check if proposal is from coordinator's department
    if (proposal.department.toString() !== req.user.department._id.toString()) {
      return res
        .status(403)
        .json({ error: 'Can only review proposals from own department' });
    }

    const { comments } = req.body;

    proposal.status = 'rejected';
    proposal.reviewedBy = req.user._id;
    proposal.reviewedAt = new Date();
    proposal.reviewComments = comments || '';

    await proposal.save();
    await proposal.populate('reviewedBy', 'name');

    res.json(proposal);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete proposal (faculty only, draft)
router.delete('/:id', authenticate, async (req, res) => {
  try {
    if (req.user.role !== 'faculty') {
      return res
        .status(403)
        .json({ error: 'Only faculty can delete proposals' });
    }

    const proposal = await Proposal.findById(req.params.id);
    if (!proposal) {
      return res.status(404).json({ error: 'Proposal not found' });
    }

    if (proposal.faculty.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Can only delete own proposals' });
    }

    if (proposal.status !== 'draft') {
      return res.status(400).json({ error: 'Can only delete draft proposals' });
    }

    await Proposal.findByIdAndDelete(req.params.id);
    res.json({ message: 'Proposal deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
