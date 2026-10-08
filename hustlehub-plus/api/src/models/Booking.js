import mongoose from 'mongoose';
import { BOOKING_STATUSES, MAX_TIER_PRICE_CENTS, MIN_TIER_PRICE_CENTS } from './constants.js';

const { ObjectId } = mongoose.Schema.Types;

const bookingSchema = new mongoose.Schema(
  {
    gigId: { type: ObjectId, ref: 'Gig', required: true },
    clientId: { type: ObjectId, ref: 'User', required: true },
    freelancerId: { type: ObjectId, ref: 'User', required: true },
    tierId: { type: ObjectId, required: true },
    tierTitle: { type: String, required: true, trim: true, maxlength: 40 },
    totalCents: {
      type: Number,
      required: true,
      min: MIN_TIER_PRICE_CENTS,
      max: MAX_TIER_PRICE_CENTS,
      validate: { validator: Number.isInteger, message: 'totalCents must be a whole number' },
    },
    status: { type: String, enum: BOOKING_STATUSES, default: 'pending' },
  },
  { timestamps: true }
);

bookingSchema.index({ clientId: 1, createdAt: -1 });
bookingSchema.index({ freelancerId: 1, status: 1, createdAt: -1 });

bookingSchema.set('toJSON', {
  transform(doc, ret) {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

export default mongoose.model('Booking', bookingSchema);
