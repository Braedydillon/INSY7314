import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import { matchedData } from 'express-validator';
import config from '../config/env.js';
import User from '../models/User.js';
import { isAccountLocked, recordFailedLogin, clearFailedLogins } from '../services/loginLockout.js';

import { createResetToken, hashResetToken } from '../services/resetTokens.js';
import { sendPasswordResetEmail } from '../services/mailer.js';

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
      req.log.warn(
        { event: 'auth.register.duplicate', email },
        'Registration with an existing email'
      );
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
      req.log.warn(
        { event: 'auth.register.duplicate', email },
        'Registration with an existing email'
      );
      return res.status(409).json({ error: 'Email already registered' });
    }
    next(error);
  }
}

function sendLockedResponse(res, user) {
  const secondsRemaining = Math.max(
    1,
    Math.ceil((new Date(user.lockUntil).getTime() - Date.now()) / 1000)
  );

  const minutesRemaining = Math.ceil(secondsRemaining / 60);

  res.set('Retry-After', String(secondsRemaining));

  return res.status(423).json({
    code: 'ACCOUNT_LOCKED',
    error: `Account temporarily locked. Try again in ${minutesRemaining} minute(s).`,
    retryAfterSeconds: secondsRemaining,
  });
}

export async function login(req, res, next) {
  try {
    const { email, password } = matchedData(req);

    const user = await User.findOne({ email }).select(
      '+passwordHash +failedLoginAttempts ' + '+firstFailedLoginAt +lockUntil'
    );

    const invalidMessage = {
      error: 'Invalid email or password',
    };

    if (!user) {
      req.log.warn(
        { event: 'auth.login.failed', reason: 'unknown_user', email, ip: req.ip },
        'Login failed'
      );
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    if (isAccountLocked(user)) {
      req.log.warn(
        {
          event: 'auth.login.blocked',
          userId: user.id,
          ip: req.ip,
        },
        'Login blocked by temporary account lockout'
      );

      return sendLockedResponse(res, user);
    }

    const passwordMatch = await bcrypt.compare(password, user.passwordHash);

    if (!passwordMatch) {
      const newlyLocked = recordFailedLogin(user);
      await user.save();

      req.log.warn(
        {
          event: newlyLocked ? 'auth.account.locked' : 'auth.login.failed',
          reason: 'wrong_password',
          userId: user.id,
          ip: req.ip,
        },
        newlyLocked ? 'Account temporarily locked' : 'Login failed'
      );

      if (newlyLocked) {
        return sendLockedResponse(res, user);
      }

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
        ip: req.ip,
      },
      'Login succeeded'
    );

    return res.status(200).json({ message: 'Login successful', token, user: user.toJSON() });
  } catch (error) {
    next(error);
  }
}

const RESET_REQUESTED = 'If an account exists for that email, a reset link has been sent.';
const RESET_INVALID = 'This reset link is invalid or has expired.';

export async function forgotPassword(req, res, next) {
  try {
    const { email } = matchedData(req);
    const user = await User.findOne({ email });

    if (user) {
      const { token, tokenHash, expiresAt } = createResetToken();

      await User.updateOne(
        { _id: user._id },
        { passwordResetTokenHash: tokenHash, passwordResetExpires: expiresAt }
      );

      const resetUrl = `${config.APP_URL}/reset-password#token=${token}`;

      sendPasswordResetEmail(user.email, resetUrl)
        .then(() =>
          req.log.info(
            { event: 'auth.password_reset.email_sent', userId: user.id },
            'Reset email sent'
          )
        )
        .catch((err) =>
          req.log.error(
            { event: 'auth.password_reset.email_failed', userId: user.id, err },
            'Reset email failed'
          )
        );
    }

    req.log.info(
      { event: 'auth.password_reset.requested', email, userFound: Boolean(user), ip: req.ip },
      'Password reset requested'
    );

    return res.status(200).json({ message: RESET_REQUESTED });
  } catch (error) {
    next(error);
  }
}

export async function resetPassword(req, res, next) {
  try {
    const { token, password } = matchedData(req);

    const tokenFilter = {
      passwordResetTokenHash: hashResetToken(token),
      passwordResetExpires: mongoose.trusted({ $gt: new Date() }),
    };

    if (!(await User.exists(tokenFilter))) {
      req.log.warn(
        { event: 'auth.password_reset.invalid_token', ip: req.ip },
        'Invalid reset token'
      );
      return res.status(400).json({ error: RESET_INVALID });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const user = await User.findOneAndUpdate(
      tokenFilter,
      {
        $set: { passwordHash },
        $unset: { passwordResetTokenHash: 1, passwordResetExpires: 1 },
        $inc: { tokenVersion: 1 },
      },
      { returnDocument: 'after' }
    );

    if (!user) {
      req.log.warn(
        { event: 'auth.password_reset.invalid_token', ip: req.ip },
        'Reset token already used'
      );
      return res.status(400).json({ error: RESET_INVALID });
    }

    req.log.info(
      { event: 'auth.password_reset.completed', userId: user.id, ip: req.ip },
      'Password reset completed'
    );

    return res.status(200).json({
      message: 'Your password has been reset. Please log in with your new password.',
    });
  } catch (error) {
    next(error);
  }
}
