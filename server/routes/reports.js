import express from 'express';
import Proposal from '../models/Proposal.js';
import FundCycle from '../models/FundCycle.js';
import Department from '../models/Department.js';
import { authenticateToken } from '../middleware/auth.js';
import { requireCoordinatorOrAdmin } from '../middleware/roleCheck.js';

const router = express.Router();

// Department utilization report (coordinator/admin)
router.get(
  '/department-utilization',
  authenticateToken,
  requireCoordinatorOrAdmin,
  async (req, res) => {
    try {
      const { departmentId, cycleId } = req.query;
      let targetDepartment = departmentId;

      // Coordinators can only see their department
      if (req.user.role === 'coordinator') {
        targetDepartment = req.user.department._id;
      }

      if (!targetDepartment) {
        return res.status(400).json({ error: 'Department ID required' });
      }

      const matchStage = {
        department: mongoose.Types.ObjectId(targetDepartment),
      };

      if (cycleId) {
        matchStage.fundCycle = mongoose.Types.ObjectId(cycleId);
      }

      const utilization = await Proposal.aggregate([
        { $match: matchStage },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
            totalAmount: { $sum: '$totalAmount' },
          },
        },
      ]);

      // Get department budget info
      const department = await Department.findById(targetDepartment);
      const cycle = cycleId ? await FundCycle.findById(cycleId) : null;

      let allocatedBudget = 0;
      if (cycle) {
        const deptBudget = cycle.departmentBudgets.find(
          (db) => db.department.toString() === targetDepartment
        );
        allocatedBudget = deptBudget ? deptBudget.allocatedAmount : 0;
      }

      res.json({
        department: department.name,
        allocatedBudget,
        utilization,
        cycle: cycle ? cycle.name : 'All Cycles',
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

// Institutional overview (admin only)
router.get('/institutional-overview', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { cycleId } = req.query;
    const matchStage = {};

    if (cycleId) {
      matchStage.fundCycle = mongoose.Types.ObjectId(cycleId);
    }

    const overview = await Proposal.aggregate([
      { $match: matchStage },
      {
        $lookup: {
          from: 'departments',
          localField: 'department',
          foreignField: '_id',
          as: 'departmentInfo',
        },
      },
      { $unwind: '$departmentInfo' },
      {
        $group: {
          _id: {
            department: '$department',
            departmentName: '$departmentInfo.name',
            status: '$status',
          },
          count: { $sum: 1 },
          totalAmount: { $sum: '$totalAmount' },
        },
      },
      {
        $group: {
          _id: {
            department: '$_id.department',
            departmentName: '$_id.departmentName',
          },
          proposals: {
            $push: {
              status: '$_id.status',
              count: '$count',
              amount: '$totalAmount',
            },
          },
          totalProposals: { $sum: '$count' },
          totalAmount: { $sum: '$totalAmount' },
        },
      },
    ]);

    res.json(overview);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Approval statistics
router.get(
  '/approval-stats',
  authenticateToken,
  requireCoordinatorOrAdmin,
  async (req, res) => {
    try {
      const { departmentId, cycleId, startDate, endDate } = req.query;
      const matchStage = {};

      if (req.user.role === 'coordinator') {
        matchStage.department = req.user.department._id;
      } else if (departmentId) {
        matchStage.department = mongoose.Types.ObjectId(departmentId);
      }

      if (cycleId) matchStage.fundCycle = mongoose.Types.ObjectId(cycleId);

      if (startDate || endDate) {
        matchStage.submittedAt = {};
        if (startDate) matchStage.submittedAt.$gte = new Date(startDate);
        if (endDate) matchStage.submittedAt.$lte = new Date(endDate);
      }

      const stats = await Proposal.aggregate([
        { $match: matchStage },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
            totalAmount: { $sum: '$totalAmount' },
            avgAmount: { $avg: '$totalAmount' },
          },
        },
      ]);

      const totalProposals = stats.reduce((sum, stat) => sum + stat.count, 0);
      const approvalRate =
        totalProposals > 0
          ? (
              ((stats.find((s) => s._id === 'approved')?.count || 0) /
                totalProposals) *
              100
            ).toFixed(2)
          : 0;

      res.json({
        statistics: stats,
        totalProposals,
        approvalRate: parseFloat(approvalRate),
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

// Budget utilization by cycle
router.get(
  '/budget-utilization',
  authenticateToken,
  requireCoordinatorOrAdmin,
  async (req, res) => {
    try {
      const { cycleId } = req.query;

      if (!cycleId) {
        return res.status(400).json({ error: 'Cycle ID required' });
      }

      const cycle = await FundCycle.findById(cycleId).populate(
        'departmentBudgets.department',
        'name code'
      );

      if (!cycle) {
        return res.status(404).json({ error: 'Cycle not found' });
      }

      // Get approved proposals for this cycle
      const approvedProposals = await Proposal.aggregate([
        {
          $match: {
            fundCycle: mongoose.Types.ObjectId(cycleId),
            status: 'approved',
          },
        },
        {
          $group: {
            _id: '$department',
            totalSpent: { $sum: '$totalAmount' },
            proposalCount: { $sum: 1 },
          },
        },
      ]);

      // Combine with budget data
      const utilization = cycle.departmentBudgets.map((deptBudget) => {
        const spent = approvedProposals.find(
          (ap) => ap._id.toString() === deptBudget.department._id.toString()
        );

        return {
          department: deptBudget.department,
          allocated: deptBudget.allocatedAmount,
          spent: spent ? spent.totalSpent : 0,
          remaining:
            deptBudget.allocatedAmount - (spent ? spent.totalSpent : 0),
          utilizationRate: (
            ((spent ? spent.totalSpent : 0) / deptBudget.allocatedAmount) *
            100
          ).toFixed(2),
          proposalCount: spent ? spent.proposalCount : 0,
        };
      });

      res.json({
        cycle: {
          name: cycle.name,
          academicYear: cycle.academicYear,
          totalBudget: cycle.totalBudget,
        },
        departmentUtilization: utilization,
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

// Export data (CSV format)
router.get(
  '/export/:type',
  authenticateToken,
  requireCoordinatorOrAdmin,
  async (req, res) => {
    try {
      const { type } = req.params;
      const { cycleId, departmentId, format = 'csv' } = req.query;

      let data = [];
      let filename = '';

      switch (type) {
        case 'proposals':
          const matchStage = {};
          if (cycleId) matchStage.fundCycle = mongoose.Types.ObjectId(cycleId);
          if (departmentId)
            matchStage.department = mongoose.Types.ObjectId(departmentId);

          data = await Proposal.find(matchStage)
            .populate('faculty', 'name email')
            .populate('department', 'name')
            .populate('fundCycle', 'name academicYear')
            .select(
              'proposalId faculty department fundCycle totalAmount status submittedAt reviewedAt'
            );

          filename = `proposals_${Date.now()}.csv`;
          break;

        default:
          return res.status(400).json({ error: 'Invalid export type' });
      }

      if (format === 'csv') {
        // Convert to CSV format
        const csv = convertToCSV(data);
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader(
          'Content-Disposition',
          `attachment; filename="${filename}"`
        );
        res.send(csv);
      } else {
        res.json(data);
      }
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

// Helper function to convert data to CSV
function convertToCSV(data) {
  if (!data.length) return '';

  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(','),
    ...data.map((row) =>
      headers
        .map((header) => {
          const value = row[header];
          if (value && typeof value === 'object' && value.name) {
            return `"${value.name}"`;
          }
          return `"${value || ''}"`;
        })
        .join(',')
    ),
  ].join('\n');

  return csvContent;
}

export default router;
