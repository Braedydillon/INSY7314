import jwt from 'jsonwebtoken';
import config from '../config/env.js';
import { getUserById } from '../store/users.js';

export function authenticate(req, res, next) {
  const header = req.headers.authorization;

  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authernticaiton required.' });
  }

  const token = header.split(' ')[1]; // Extract the token leave 'Bearer '

  try {
    const decoded = jwt.verify(token, config.JWT_SECRET);
    const user = getUserById(decoded.id);

    if (!user) {
      return res.status(401).json({ error: 'Expired or invalid token' });
    }
    req.user = { id: user.id, email: user.email };
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Expired or tampered token' });
  }
}
