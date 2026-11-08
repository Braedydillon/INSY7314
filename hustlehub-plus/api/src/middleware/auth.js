import jwt from 'jsonwebtoken';
import config from '../config/env.js';
import User from '../models/User.js';

function reject(req, res, reason, message, level = 'warn') {
  req.log[level]({ event: 'auth.token.rejected', reason, ip: req.ip }, 'Token rejected');
  return res.status(401).json({ error: message });
}

export async function authenticate(req, res, next) {
  const header = req.headers.authorization;

  if (!header || !header.startsWith('Bearer ')) {
    return reject(req, res, 'missing', 'Authentication required.', 'info');
  }

  const token = header.split(' ')[1]; // Extract the token leave 'Bearer '

  if (!token) {
    return reject(req, res, 'missing', 'Authentication required.', 'info');
  }

  let decoded;

  try {
    decoded = jwt.verify(token, config.JWT_SECRET, { algorithms: ['HS256'] });
  } catch (err) {
    return err.name === 'TokenExpiredError'
      ? reject(req, res, 'expired', 'Expired or invalid token.', 'info')
      : reject(req, res, 'invalid', 'Expired or invalid token.');
  }

  if (!decoded || typeof decoded !== 'object' || typeof decoded.id !== 'string') {
    return reject(req, res, 'malformed', 'Invalid token.');
  }

  try {
    const user = await User.findById(decoded.id);

    if (!user) {
      return reject(req, res, 'user_not_found', 'User no longer exists.');
    }

    req.user = { id: user.id, email: user.email, role: user.role };

    next();
  } catch (error) {
    next(error);
  }
}
