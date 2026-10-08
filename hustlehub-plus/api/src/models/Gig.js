import mongoose from 'mongoose';
import {
  GIG_STATUSES,
  GIG_CATEGORIES,
  MIN_TIERS,
  MAX_TIERS,
  MIN_TIER_PRICE_CENTS,
  MAX_TIER_PRICE_CENTS,
} from './constants.js';

const tierSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, minlength: 2, maxlength: 40 },
  description: { type: String, trim: true, maxlength: 200, default: '' },
  priceCents: {
    type: Number,
    required: true,
    min: MIN_TIER_PRICE_CENTS,
    max: MAX_TIER_PRICE_CENTS,
    validate: { validator: Number.isInteger, message: 'priceCents must be a whole number' },
  },
});

tierSchema.set('toJSON', {
  transform(doc, ret) {
    ret.id = ret._id.toString();
    delete ret._id;
    return ret;
  },
});

const gigSchema = new mongoose.Schema(
  {
    freelancerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true, trim: true, minlength: 3, maxlength: 80 },
    category: { type: String, required: true, enum: GIG_CATEGORIES },
    description: { type: String, required: true, trim: true, minlength: 10, maxlength: 1000 },
    status: { type: String, enum: GIG_STATUSES, default: 'active' },
    tiers: {
      type: [tierSchema],
      validate: {
        validator(tiers) {
          tiers.length >= MIN_TIERS && tiers.length <= MAX_TIERS;
        },
        message: `A gig must have between ${MIN_TIERS} and ${MAX_TIERS} tiers`,
      },
    },
  },
  { timestamps: true }
);

// Indexes for efficient querying
gigSchema.index({ status: 1, category: 1, createdAt: -1 });
gigSchema.index({ freelancerId: 1, createdAt: -1 });

// Virtuals for price range
gigSchema.virtual('fromPriceCents').get(function () {
  if (!this.tiers || this.tiers.length === 0) return null;
  return Math.min(...this.tiers.map((tier) => tier.priceCents));
});

gigSchema.virtual('toPriceCents').get(function () {
  if (!this.tiers || this.tiers.length === 0) return null;
  return Math.max(...this.tiers.map((tier) => tier.priceCents));
});

gigSchema.set('toJSON', {
  virtuals: true,
  transform(doc, ret) {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

export default mongoose.model('Gig', gigSchema);
