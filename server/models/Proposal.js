import mongoose from 'mongoose';

const proposalSchema = new mongoose.Schema(
  {
    proposalId: {
      type: String,
      required: true,
      unique: true,
    },
    faculty: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department',
      required: true,
    },
    fundCycle: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'FundCycle',
      required: true,
    },
    items: [
      {
        itemKeyword: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'ItemKeyword',
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
          min: 1,
        },
        unitCost: {
          type: Number,
          required: true,
          min: 0,
        },
        totalCost: {
          type: Number,
          required: true,
        },
        justification: {
          type: String,
          required: true,
          trim: true,
        },
      },
    ],
    totalAmount: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ['draft', 'submitted', 'approved', 'rejected'],
      default: 'draft',
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium',
    },
    submittedAt: Date,
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    reviewedAt: Date,
    reviewComments: String,
  },
  { timestamps: true }
);

export default mongoose.model('Proposal', proposalSchema);
