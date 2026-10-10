import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { matchedData } from 'express-validator';
import config from '../config/env.js';
import User from '../models/User.js';

function createToken(user) {
  return jwt.sign(
    {
      id: user.id,
    },
    config.JWT_SECRET,
    {
      expiresIn: config.JWT_EXPIRES_IN || '1h',
    }
  );
}

export async function register(req, res, next) {
  try {
    const { email, password, name, surname, displayName, role, contactMethod } = matchedData(req);

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(409).json({ error: 'User already exists' });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await User.create({
      email,
      passwordHash,
      name,
      surname,
      displayName,
      role,
      contactMethod: contactMethod || '',
    });

    return res.status(201).json({ message: 'User created successfully', user: user.toJSON() });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ error: 'Email already registered' });
    }
    next(error);
  }
}

export async function login(req, res, next) {
  try {
    const { email, password } = matchedData(req);

    const user = await User.findOne({ email }).select('+passwordHash');

    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const passwordMatch = await bcrypt.compare(password, user.passwordHash);

    if (!passwordMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = createToken(user);

    return res.status(200).json({ message: 'Login successful', token, user: user.toJSON() });
  } catch (error) {
    next(error);
  }
}
