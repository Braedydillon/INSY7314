
import User from '../models/User.js';
import Gig from '../models/Gig.js';
import Booking from '../models/Booking.js';
import Transaction from '../models/Transaction.js';

export async function getAdminUsers(req, res, next) {
  try {
    const users = await User.find()
      .select('-passwordHash -password')
      .sort({ createdAt: -1 });

    res.status(200).json({ users });
  } catch (error) {
    next(error);
  }
}

export async function getAdminGigs(req, res, next) {
  try {
    const gigs = await Gig.find()
      .sort({ createdAt: -1 });

    res.status(200).json({ gigs });
  } catch (error) {
    next(error);
  }
}

export async function getAdminBookings(req, res, next) {
  try {
    const bookings = await Booking.find()
      .sort({ createdAt: -1 });

    res.status(200).json({ bookings });
  } catch (error) {
    next(error);
  }
}

export async function getAdminTransactions(req, res, next) {
  try {
    const transactions = await Transaction.find()
      .sort({ createdAt: -1 });

    res.status(200).json({ transactions });
  } catch (error) {
    next(error);
  }
}
