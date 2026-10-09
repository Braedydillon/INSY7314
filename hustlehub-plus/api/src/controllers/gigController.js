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
