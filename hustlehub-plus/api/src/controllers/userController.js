import User from '../models/User.js';
import { matchedData } from 'express-validator';

export async function getMe(req, res, next) {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    return res.status(200).json({ user: user.toJSON() });
  } catch (error) {
    next(error);
  }
}

export async function updateMe(req, res, next) {
  try {
    const updates = matchedData(req, { locations: ['body'] });

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    return res.status(200).json({ message: 'Profile updated successfully.', user: user.toJSON() });
  } catch (error) {
    next(error);
  }
}
