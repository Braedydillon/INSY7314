// General constants used throughout the application
export const ROLES = ['client', 'freelancer', 'admin'];
export const GIG_STATUSES = ['active', 'removed'];
export const GIG_CATEGORIES = [
  'music',
  'coding',
  'writing',
  'marketing',
  'tutoring',
  'photography',
  'art',
  'design',
  'videography',
  'other',
];
export const BOOKING_STATUSES = ['pending', 'confirmed', 'declined', 'cancelled'];
export const TRANSACTION_TYPES = ['payment', 'refund'];

// Constants related to gig tiers
export const MIN_TIERS = 1;
export const MAX_TIERS = 3;
// Pricing is handled in cents (ZAR) to avoid floating point precision issues
export const MIN_TIER_PRICE_CENTS = 3000;
export const MAX_TIER_PRICE_CENTS = 5000000;
