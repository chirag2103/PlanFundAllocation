import express from 'express';
import Proposal from '../models/Proposal.js';
import FundCycle from '../models/FundCycle.js';
import Department from '../models/Department.js';
import { authenticateToken as authenticate } from '../middleware/auth.js';

const router = express.Router();

// Get proposals with filters
router.get('/proposals', authenticate, async (req, res) => {
  try {
    const { cycleId, departmentId, status, priority, startDate, endDate } =
      req.query;

    let query = {};

    // Department filter
    if (req.user.role === 'coordinator') {
      query.department = req.user.department;
    } else if (req.user.role === 'admin' && departmentId) {
      query.department = departmentId;
    }

    // Fund cycle filter
    if (cycleId) {
      query.fundCycle = cycleId;
    }

    // Status filter
    if (status && status !== 'all') {
      query.status = status;
    }

    // Priority filter
    if (priority && priority !== 'all') {
      query.priority = priority;
    }

    // Date range filter
    if (startDate || endDate) {
      query.submittedAt = {};
      if (startDate) query.submittedAt.$gte = new Date(startDate);
      if (endDate) query.submittedAt.$lte = new Date(endDate);
    }

    const proposals = await Proposal.find(query)
      .populate('faculty', 'name email')
      .populate('department', 'name code')
      .populate('fundCycle', 'name academicYear allocatedBudget')
      .populate('items.itemKeyword', 'name category')
      .populate('reviewedBy', 'name')
      .sort({ submittedAt: -1 });

    res.json(proposals);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get cycle statistics
router.get('/cycle-stats', authenticate, async (req, res) => {
  try {
    const { cycleId } = req.query;

    if (!cycleId) {
      return res.status(400).json({ error: 'cycleId is required' });
    }

    let query = { fundCycle: cycleId };

    if (req.user.role === 'coordinator') {
      query.department = req.user.department;
    }

    const proposals = await Proposal.find(query)
      .populate('faculty', 'name email')
      .populate('department', 'name code')
      .populate('fundCycle', 'name academicYear allocatedBudget')
      .populate('items.itemKeyword', 'name category');

    const cycle = await FundCycle.findById(cycleId).populate(
      'department',
      'name code'
    );

    const stats = {
      cycleName: cycle.name,
      cycleYear: cycle.academicYear,
      allocatedBudget: cycle.allocatedBudget,
      totalProposals: proposals.length,
      approvedCount: proposals.filter((p) => p.status === 'approved').length,
      rejectedCount: proposals.filter((p) => p.status === 'rejected').length,
      submittedCount: proposals.filter((p) => p.status === 'submitted').length,
      draftCount: proposals.filter((p) => p.status === 'draft').length,
      totalRequested: proposals.reduce(
        (sum, p) => sum + (p.totalAmount || 0),
        0
      ),
      totalApproved: proposals
        .filter((p) => p.status === 'approved')
        .reduce((sum, p) => sum + (p.totalAmount || 0), 0),
      approvalRate:
        proposals.length > 0
          ? Number(
              (proposals.filter((p) => p.status === 'approved').length /
                proposals.length) *
                100
            )
          : 0,
      utilizationRate:
        cycle.allocatedBudget > 0
          ? Number(
              (proposals
                .filter((p) => p.status === 'approved')
                .reduce((sum, p) => sum + (p.totalAmount || 0), 0) /
                cycle.allocatedBudget) *
                100
            )
          : 0,
      byPriority: {
        high: proposals.filter((p) => p.priority === 'high').length,
        medium: proposals.filter((p) => p.priority === 'medium').length,
        low: proposals.filter((p) => p.priority === 'low').length,
      },
      byCategory: {},
      proposals,
    };

    proposals.forEach((proposal) => {
      proposal.items.forEach((item) => {
        const cat = item.itemKeyword?.category || 'other';
        if (!stats.byCategory[cat]) {
          stats.byCategory[cat] = {
            requested: 0,
            approved: 0,
            count: 0,
          };
        }
        stats.byCategory[cat].requested += item.totalCost;
        if (proposal.status === 'approved') {
          stats.byCategory[cat].approved += item.totalCost;
        }
        stats.byCategory[cat].count++;
      });
    });

    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get institutional stats - ALL departments for a YEAR (admin only)
router.get('/institutional-stats', authenticate, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res
        .status(403)
        .json({ error: 'Only admin can view institutional stats' });
    }

    const { year } = req.query;

    if (!year) {
      return res.status(400).json({ error: 'year is required' });
    }

    // Match academic year that STARTS with the given year
    // e.g., "2025" matches "2025-26", "2025-27", etc.
    const yearRegex = new RegExp(`^${year}`, 'i');

    // Get all cycles for this year
    const cycles = await FundCycle.find({
      academicYear: yearRegex,
    });

    const cycleIds = cycles.map((c) => c._id);

    // Get ALL proposals for ALL cycles in this year
    const allProposals = await Proposal.find({
      fundCycle: { $in: cycleIds },
    })
      .populate('faculty', 'name email')
      .populate('department', 'name code')
      .populate('fundCycle', 'name academicYear allocatedBudget')
      .populate('items.itemKeyword', 'name category')
      .populate('reviewedBy', 'name')
      .sort({ submittedAt: -1 });

    // Get all departments
    const departments = await Department.find({ isActive: true });

    // Calculate total budget allocated for this year (sum of all cycles)
    const totalBudgetAllocatedForYear = cycles.reduce(
      (sum, cycle) => sum + (cycle.allocatedBudget || 0),
      0
    );

    // Department-wise breakdown
    const departmentStats = {};
    departments.forEach((dept) => {
      const deptProposals = allProposals.filter(
        (p) => p.department?._id.toString() === dept._id.toString()
      );
      const approvedProposals = deptProposals.filter(
        (p) => p.status === 'approved'
      );
      const rejectedProposals = deptProposals.filter(
        (p) => p.status === 'rejected'
      );

      // Get cycles for this department to calculate allocated budget
      const deptCycles = cycles.filter(
        (cycle) =>
          cycle.department?.toString() === dept._id.toString() ||
          // If cycle doesn't have department filter, count for all depts
          !cycle.department
      );

      // Total allocated budget for this department (sum of cycle budgets)
      const allocatedBudgetForDept = deptCycles.reduce(
        (sum, cycle) => sum + (cycle.allocatedBudget || 0),
        0
      );

      departmentStats[dept._id] = {
        name: dept.name,
        code: dept.code,
        totalProposals: deptProposals.length,
        approvedProposals: approvedProposals.length,
        rejectedProposals: rejectedProposals.length,
        submittedProposals: deptProposals.filter(
          (p) => p.status === 'submitted'
        ).length,
        draftProposals: deptProposals.filter((p) => p.status === 'draft')
          .length,

        // Total requested (sum of all proposals requested amounts)
        totalRequested: deptProposals.reduce(
          (sum, p) => sum + (p.totalAmount || 0),
          0
        ),

        // Total approved (sum of all approved proposals)
        totalApproved: approvedProposals.reduce(
          (sum, p) => sum + (p.totalAmount || 0),
          0
        ),

        // Total rejected count
        totalRejected: rejectedProposals.length,

        // Allocated budget for this department (from cycles)
        allocatedBudget: allocatedBudgetForDept,

        // Approval rate
        approvalRate:
          deptProposals.length > 0
            ? Number((approvedProposals.length / deptProposals.length) * 100)
            : 0,

        // Utilization rate (approved / allocated)
        utilizationRate:
          allocatedBudgetForDept > 0
            ? Number(
                (approvedProposals.reduce(
                  (sum, p) => sum + (p.totalAmount || 0),
                  0
                ) /
                  allocatedBudgetForDept) *
                  100
              )
            : 0,
      };
    });

    // Calculate overall stats
    const totalRequested = allProposals.reduce(
      (sum, p) => sum + (p.totalAmount || 0),
      0
    );
    const totalApproved = allProposals
      .filter((p) => p.status === 'approved')
      .reduce((sum, p) => sum + (p.totalAmount || 0), 0);

    // Overall stats
    const overallStats = {
      year,
      cycles: cycles.length,
      totalDepartments: departments.length,

      // Total allocated budget for this academic year (sum of all cycles)
      totalAllocatedBudgetForYear: totalBudgetAllocatedForYear,

      // Total proposals across all departments
      totalProposals: allProposals.length,
      totalApproved: allProposals.filter((p) => p.status === 'approved').length,
      totalRejected: allProposals.filter((p) => p.status === 'rejected').length,
      totalSubmitted: allProposals.filter((p) => p.status === 'submitted')
        .length,
      totalDraft: allProposals.filter((p) => p.status === 'draft').length,

      // Total requested (sum of all proposals across all departments)
      totalRequested,

      // Total approved amount (sum of all approved proposals across all departments)
      totalApprovedAmount: totalApproved,

      // Overall approval rate
      overallApprovalRate:
        allProposals.length > 0
          ? Number(
              (allProposals.filter((p) => p.status === 'approved').length /
                allProposals.length) *
                100
            )
          : 0,

      // Overall utilization rate (total approved / total allocated)
      overallUtilizationRate:
        totalBudgetAllocatedForYear > 0
          ? Number((totalApproved / totalBudgetAllocatedForYear) * 100)
          : 0,

      departmentStats,
      proposals: allProposals,
    };

    res.json(overallStats);
  } catch (error) {
    console.error('Institutional stats error:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
