import mongoose from 'mongoose';
import Booking from '../models/Booking.js';
import Transaction from '../models/Transaction.js';
import { TAX_TABLES, taxYearFor, taxYearRange } from '../config/taxTables.js';
import { calculateTax } from '../services/tax.js';

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

const TAX_YEAR_MONTHS = [3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 1, 2];
const MONTH_LABELS = [
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
  'Jan',
  'Feb',
];

export async function getMyTax(req, res, next) {
  try {
    const taxYear = req.query.taxYear ?? taxYearFor(new Date());
    const table = TAX_TABLES[taxYear];

    if (!table) {
      return res
        .status(404)
        .json({ error: 'The current year does not have a tax table configured.' });
    }

    const { start, end } = taxYearRange(taxYear);
    const freelancerId = new mongoose.Types.ObjectId(req.user.id);

    const [completedByMonth, projectedRows] = await Promise.all([
      Booking.aggregate([
        { $match: { freelancerId, status: 'completed' } },
        { $addFields: { earnedAt: { $ifNull: ['$completedAt', '$updatedAt'] } } },
        { $match: { earnedAt: { $gte: start, $lt: end } } },
        { $group: { _id: { $month: '$earnedAt' }, totalCents: { $sum: '$totalCents' } } },
      ]),

      Booking.aggregate([
        { $match: { freelancerId, status: { $in: ['pending', 'confirmed'] } } },
        { $group: { _id: null, totalCents: { $sum: '$totalCents' } } },
      ]),
    ]);

    const byMonth = new Map(completedByMonth.map((row) => [row._id, row.totalCents]));

    const monthly = TAX_YEAR_MONTHS.map((month, index) => ({
      month: MONTH_LABELS[index],
      completedCents: byMonth.get(month) ?? 0,
    }));

    const incomeCents = monthly.reduce((sum, row) => sum + row.completedCents, 0);
    const projectedCents = projectedRows[0]?.totalCents ?? 0;

    return res.status(200).json({
      taxYear: { year: taxYear, label: table.label, start, end, source: table.source },
      incomeCents,
      projectedCents,
      estimate: calculateTax(incomeCents, table),
      projectedEstimate: calculateTax(incomeCents + projectedCents, table),
      monthly,
    });
  } catch (error) {
    next(error);
  }
}
