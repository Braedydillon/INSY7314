import { matchedData } from 'express-validator';
import Gig from '../models/Gig.js';
import Booking from '../models/Booking.js';
import Transaction from '../models/Transaction.js';

export async function createBooking(req, res, next) {
  try {
    const { gigId, tierId } = matchedData(req, { locations: ['body'] });

    if (!gigId) {
      return res.status(404).json({ message: 'Gig not found' });
    }

    const gig = await Gig.findById(gigId);
    if (!gig) {
      return res.status(404).json({ message: 'Gig not found' });
    }

    const tier = gig.tiers.id(tierId);
    if (!tier) {
      return res.status(404).json({ message: 'Tier not found' });
    }

    const booking = new Booking({
      gigId: gig._id,
      tierId: tier._id,
      clientId: req.user.id,
      freelancerId: gig.freelancerId,
      tierTitle: tier.title,
      totalCents: tier.priceCents,
    });

    let payment;
    try {
      payment = await Transaction.create({
        bookingId: booking._id,
        clientId: booking.clientId,
        freelancerId: booking.freelancerId,
        amountCents: booking.totalCents,
        type: 'payment',
      });
    } catch (error) {
      await Booking.deleteOne({ _id: booking._id });
      return res.status(402).json({ message: 'Payment failed', error: error.message });
    }

    return res.status(201).json({ booking, transaction: payment });
  } catch (error) {
    next(error);
  }
}

export async function getMyBookings(req, res, next) {
  try {
    const filter =
      req.user.role === 'freelancer' ? { clientId: req.user.id } : { freelancerId: req.user.id };

    const bookings = await Booking.find(filter)
      .sort({ createdAt: -1 })
      .populate('gigId', 'title')
      .populate('clientId', 'displayName contactMethod')
      .populate('freelancerId', 'displayName contactMethod');

    return res.status(200).json({ bookings });
  } catch (error) {
    next(error);
  }
}

export async function getBooking(req, res, next) {
  try {
    const booking = await Booking.findOne(req.params.Id)
      .populate('gigId', 'title')
      .populate('clientId', 'displayName contactMethod')
      .populate('freelancerId', 'displayName contactMethod');

    const isInvolved =
      booking && (booking.clientId.id === req.user.id || booking.freelancerId.id === req.user.id);

    if (!booking || !isInvolved) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    return res.status(200).json({ booking });
  } catch (error) {
    next(error);
  }
}

async function changeStatus(req, res, next, { ownerField, from, to, refund }) {
  try {
    const requester = { _id: req.params.id, [ownerField]: req.user.id };

    const before = await Booking.findOneAndUpdate(
      { ...requester, status: { $in: from } },
      { status: to }
    );

    if (!before) {
      const exists = await Booking.findOne(requester);

      if (!exists) {
        return res.status(404).json({ error: 'Booking not found.' });
      }

      return res.status(409).json({ error: `This booking is already ${exists.status}.` });
    }

    let transaction = null;

    if (refund) {
      try {
        transaction = await Transaction.create({
          bookingId: before._id,
          clientId: before.clientId,
          freelancerId: before.freelancerId,
          type: 'refund',
          amountCents: -before.totalCents,
        });
      } catch (error) {
        await Booking.updateOne({ _id: before._id }, { status: before.status });
        throw error;
      }
    }

    const booking = await Booking.findById(before._id);

    return res.status(200).json({ booking, transaction });
  } catch (error) {
    next(error);
  }
}

export function acceptBooking(req, res, next) {
  return changeStatus(req, res, next, {
    ownerField: 'freelancerId',
    from: ['pending'],
    to: 'confirmed',
    refund: false,
  });
}

export function completeBooking(req, res, next) {
  return changeStatus(req, res, next, {
    ownerField: 'freelancerId',
    from: ['confirmed'],
    to: 'completed',
    refund: false,
  });
}

export function declineBooking(req, res, next) {
  return changeStatus(req, res, next, {
    ownerField: 'freelancerId',
    from: ['pending'],
    to: 'declined',
    refund: true,
  });
}

export function cancelBooking(req, res, next) {
  return changeStatus(req, res, next, {
    ownerField: 'clientId',
    from: ['pending', 'confirmed'],
    to: 'cancelled',
    refund: true,
  });
}
