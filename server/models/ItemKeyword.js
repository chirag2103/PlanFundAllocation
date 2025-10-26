import mongoose from 'mongoose';

const itemKeywordSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      required: true,
      enum: ['equipment', 'software', 'consumables', 'furniture', 'other'],
    },
    description: {
      type: String,
    },
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department',
    },
    estimatedCost: {
      min: Number,
      max: Number,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for name and department
itemKeywordSchema.index({ name: 1, department: 1 }, { unique: true });

export default mongoose.model('ItemKeyword', itemKeywordSchema);
