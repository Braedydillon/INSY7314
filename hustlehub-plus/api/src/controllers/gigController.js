import { matchedData } from 'express-validator';
import Gig from '../models/Gig.js';

export async function createGig(req, res, next) {
  try {
    const { title, category, description, tiers } = matchedData(req);

    const gig = await Gig.create({
      freelancerId: req.user.id,
      title,
      category,
      description,
      tiers,
    });

    return res.status(201).json({ gig });
  } catch (error) {
    next(error);
  }
}

export async function getMyGigs(req, res, next) {
  try {
    const gigs = await Gig.find({ freelancerId: req.user.id }).sort({ createdAt: -1 });

    return res.status(200).json({ gigs });
  } catch (error) {
    next(error);
  }
}

function escapeRegex(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Public
export async function browseGigs(req, res, next) {
  try {
    const { category, q } = matchedData(req, { locations: ['query'] });

    const filter = { status: 'active' };
    if (category) filter.category = category;
    if (q) filter.title = new RegExp(escapeRegex(q), 'i');

    const gigs = await Gig.find(filter)
      .sort({ createdAt: -1 })
      .populate('freelancerId', 'displayName');

    return res.status(200).json({ gigs });
  } catch (error) {
    next(error);
  }
}

// Public
export async function getGig(req, res, next) {
  try {
    const gig = await Gig.findOne({ _id: req.params.id, status: 'active' }).populate(
      'freelancerId',
      'displayName contactMethod'
    );

    if (!gig) {
      return res.status(404).json({ error: 'Gig not found.' });
    }

    return res.status(200).json({ gig });
  } catch (error) {
    next(error);
  }
}

export async function updateGig(req, res, next) {
  try {
    const gig = await Gig.findOne({ _id: req.params.id, status: 'active' });

    if (!gig) {
      return res.status(404).json({ error: 'Gig not found.' });
    }

    if (gig.freelancerId.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Permission denied.' });
    }

    const { title, category, description, tiers } = matchedData(req, { locations: ['body'] });
    gig.set({ title, category, description, tiers });
    await gig.save();

    return res.status(200).json({ gig });
  } catch (error) {
    next(error);
  }
}

export async function deleteGig(req, res, next) {
  try {
    const gig = await Gig.findOne({ _id: req.params.id, status: 'active' });

    if (!gig) {
      return res.status(404).json({ error: 'Gig not found.' });
    }

    const isOwner = gig.freelancerId.toString() === req.user.id;
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ error: 'Permission denied.' });
    }

    // Soft delete: marked as removed to prevent orphaned bookings
    gig.status = 'removed';
    await gig.save();

    return res.status(204).send();
  } catch (error) {
    next(error);
  }
}
