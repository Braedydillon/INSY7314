import mongoose from 'mongoose';
import Booking from '../models/Booking.js';
import Transaction from '../models/Transaction.js';

export async function getMyIncome(req, res, next) {
  try {
    const totals = await Booking.aggregate([
      { $match: { freelancerId: new mongoose.Types.ObjectId(req.user.id) } },
      { $group: { _id: '$status', totalCents: { $sum: '$totalCents' }, count: { $sum: 1 } } },
    ]);

    const byStatus = {};
    for (const row of totals) {
      byStatus[row._id] = { totalCents: row.totalCents, count: row.count };
    }

    const cents = (status) => byStatus[status]?.totalCents ?? 0;

    return res.status(200).json({
      incomeCents: cents('completed'),
      projectedCents: cents('pending') + cents('confirmed'),
      byStatus,
    });
  } catch (error) {
    next(error);
  }
}

export async function getMyTransactions(req, res, next) {
  try {
    const filter =
      req.user.role === 'client' ? { clientId: req.user.id } : { freelancerId: req.user.id };

    const transactions = await Transaction.find(filter).sort({ createdAt: -1 });

    return res.status(200).json({ transactions });
  } catch (error) {
    next(error);
  }
}
