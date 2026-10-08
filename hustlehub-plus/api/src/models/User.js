import mongoose from 'mongoose';
import { ROLES } from './constants.js';

const userSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true, select: false },
    name: { type: String, required: true, trim: true, minlength: 1, maxlength: 50 },
    surname: { type: String, required: true, trim: true, minlength: 1, maxlength: 50 },
    displayName: { type: String, required: true, trim: true, minlength: 1, maxlength: 40 },
    role: { type: String, enum: ROLES, required: true },
    contactMethod: { type: String, trim: true, maxlength: 120, default: '' },
  },
  { timestamps: true }
);

userSchema.set('toJSON', {
  transform: (doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
    delete ret.passwordHash;
    return ret;
  },
});

export default mongoose.model('User', userSchema);
