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
    // Single department per cycle (coordinator's department)
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department',
      required: true,
    },
    allocatedBudget: {
      type: Number,
      required: true,
      default: 0,
    },
    spentBudget: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ['draft', 'active', 'closed'],
      default: 'draft',
    },
    description: String,
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
);

// Index for efficient queries
fundCycleSchema.index({ department: 1, startDate: 1, endDate: 1 });
fundCycleSchema.index({ status: 1 });

export default mongoose.model('FundCycle', fundCycleSchema);
