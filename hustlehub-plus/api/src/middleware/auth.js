import jwt from 'jsonwebtoken';
import config from '../config/env.js';
import User from '../models/User.js';

export async function authenticate(req, res, next) {
  const header = req.headers.authorization;

  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authernticaiton required.' });
  }

  const token = header.split(' ')[1]; // Extract the token leave 'Bearer '

  if (!token){
    return res.status(401).json({error: 'Authentication required'});
  }

  let decoded;

   try {
    decoded = jwt.verify(token, config.JWT_SECRET, {algorithms: ['HS256']});
  } catch {
    return res.status(401).json({error: 'Expired or invalid token.'});
  }

   if (!decoded || typeof decoded !== 'object' || typeof decoded.id !== 'string') {
    return res.status(401).json({error: 'Invalid token.'});
  }

  try {
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({error: 'User no longer exists.'});
    }

    req.user = {id: user.id, email: user.email, role: user.role};

    next();
  } catch (error) {
    next(error);
  }
}
