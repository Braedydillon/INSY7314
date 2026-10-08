import mongoose from 'mongoose';
import { TRANSACTION_TYPES } from './constants.js';

const { ObjectId } = mongoose.Schema.Types;

const transactionSchema = new mongoose.Schema(
  {
    bookingId: { type: ObjectId, ref: 'Booking', required: true, immutable: true },
    clientId: { type: ObjectId, ref: 'User', required: true, immutable: true },
    freelancerId: { type: ObjectId, ref: 'User', required: true, immutable: true },
    type: { type: String, enum: TRANSACTION_TYPES, required: true, immutable: true },
    amountCents: {
      type: Number,
      required: true,
      immutable: true,
      validate: [
        { validator: Number.isInteger, message: 'amountCents must be a whole number' },
        {
          validator(value) {
            return this.type === 'refund' ? value < 0 : value > 0;
          },
          message: 'amountCents must be positive for payments and negative for refunds',
        },
      ],
    },
  },
  { timestamps: true }
);

transactionSchema.index({ bookingId: 1, type: 1 }, { unique: true });
transactionSchema.index({ freelancerId: 1, createdAt: -1 });
transactionSchema.index({ clientId: 1, createdAt: -1 });

transactionSchema.set('toJSON', {
  transform(doc, ret) {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

export default mongoose.model('Transaction', transactionSchema);
