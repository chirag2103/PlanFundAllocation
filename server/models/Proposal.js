import mongoose from 'mongoose';

const proposalItemSchema = new mongoose.Schema({
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
    min: 0,
  },
  justification: {
    type: String,
    required: true,
  },
});

const proposalSchema = new mongoose.Schema(
  {
    proposalId: {
      type: String,
      unique: true,
      required: true,
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
    items: [proposalItemSchema],
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: [
        'draft',
        'submitted',
        'under-review',
        'approved',
        'rejected',
        'cancelled',
      ],
      default: 'draft',
    },
    submittedAt: {
      type: Date,
    },
    reviewedAt: {
      type: Date,
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    reviewComments: {
      type: String,
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium',
    },
    attachments: [
      {
        filename: String,
        url: String,
        uploadedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Generate proposal ID before saving
proposalSchema.pre('save', async function (next) {
  if (!this.proposalId) {
    const year = new Date().getFullYear();
    const count = await mongoose.model('Proposal').countDocuments({
      proposalId: { $regex: `^PR-${year}-` },
    });
    this.proposalId = `PR-${year}-${String(count + 1).padStart(3, '0')}`;
  }
  next();
});

// Index for efficient queries
proposalSchema.index({ faculty: 1, status: 1 });
proposalSchema.index({ department: 1, status: 1 });
proposalSchema.index({ fundCycle: 1, status: 1 });

export default mongoose.model('Proposal', proposalSchema);
