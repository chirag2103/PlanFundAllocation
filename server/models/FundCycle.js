import mongoose from 'mongoose';

const fundCycleSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    academicYear: {
      type: String,
      required: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    submissionDeadline: {
      type: Date,
      required: true,
    },
    reviewDeadline: {
      type: Date,
      required: true,
    },
    totalBudget: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: ['active', 'closed', 'draft'],
      default: 'draft',
    },
    departmentBudgets: [
      {
        department: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Department',
          required: true,
        },
        allocatedAmount: {
          type: Number,
          required: true,
          min: 0,
        },
        spentAmount: {
          type: Number,
          default: 0,
          min: 0,
        },
      },
    ],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    description: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Index for active cycles
fundCycleSchema.index({ status: 1, academicYear: 1 });

export default mongoose.model('FundCycle', fundCycleSchema);
