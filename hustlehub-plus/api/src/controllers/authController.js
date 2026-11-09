import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { matchedData } from 'express-validator';
import config from '../config/env.js';
import User from '../models/User.js';
import {  isAccountLocked,recordFailedLogin, clearFailedLogins} from '../services/loginLockout.js';


function createToken(user) {
  return jwt.sign(
    {
      id: user.id,
      ver: user.tokenVersion,
    },
    config.JWT_SECRET,
    {
      algorithm: 'HS256',
      expiresIn: config.JWT_EXPIRES_IN || '1h',
    }
  );
}

export async function register(req, res, next) {
  const { email, password, name, surname, displayName, role, contactMethod } = matchedData(req);

  try {
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      req.log.warn({ event: 'auth.register.duplicate', email }, 'Registration with an existing email');
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

    req.log.info({ event: 'auth.registered', userId: user.id, role: user.role }, 'User registered');

    return res.status(201).json({ message: 'User created successfully', user: user.toJSON() });
  } catch (error) {
    if (error.code === 11000) {
      req.log.warn({ event: 'auth.register.duplicate', email }, 'Registration with an existing email');
      return res.status(409).json({ error: 'Email already registered' });
    }
    next(error);
  }
}

export async function login(req, res, next) {
  try {
    const { email, password } = matchedData(req);

    const user = await User.findOne({ email }).select('+passwordHash +failedLoginAttempts ' +
        '+firstFailedLoginAt +lockUntil');

            const invalidMessage = {
      error: 'Invalid email or password'
      };

    if (!user) {
      req.log.warn(
        { event: 'auth.login.failed', reason: 'unknown_user', email, ip: req.ip },
        'Login failed'
      );
      return res.status(401).json({ error: 'Invalid email or password' });
    }

        if (isAccountLocked(user)) {
      req.log.warn({
        event: 'auth.login.blocked',
        userId: user.id,
        ip: req.ip
      }, 'Login blocked by temporary account lockout');

      return res.status(401).json(invalidMessage);
    }

    const passwordMatch = await bcrypt.compare(password, user.passwordHash);

     if (!passwordMatch) {
      const newlyLocked = recordFailedLogin(user);
      await user.save();

      req.log.warn({
        event: newlyLocked
          ? 'auth.account.locked'
          : 'auth.login.failed',
        reason: 'wrong_password',
        userId: user.id,
        ip: req.ip
      }, newlyLocked
        ? 'Account temporarily locked'
        : 'Login failed'
      );
       return res.status(401).json(invalidMessage);
    }

   
    // Successful login: reset failed attempts
    clearFailedLogins(user);
    await user.save();

    const token = createToken(user);

    req.log.info(
      {
        event: 'auth.login.succeeded',
        email,
        userId: user.id,
        role: user.role,
        ip: req.ip
      },
      'Login succeeded'
    );


    return res.status(200).json({ message: 'Login successful', token, user: user.toJSON() });
  } catch (error) {
    next(error);
  }
}
