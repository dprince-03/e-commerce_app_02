import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/index.js';
import { USER_ROLES } from '../utils/constants.js';

export async function registerUser({ email, password, name }) {
  const existing = await User.findOne({ where: { email } });
  if (existing) {
    const err = new Error('Email already registered');
    err.status = 409;
    throw err;
  }
  const passwordHash = await bcrypt.hash(password, 10);
  const user = await User.create({ email, passwordHash, name, role: USER_ROLES.CUSTOMER });
  return sanitizeUser(user);
}

export async function loginUser({ email, password }) {
  const user = await User.findOne({ where: { email } });
  if (!user) {
    const err = new Error('Invalid credentials');
    err.status = 401;
    throw err;
  }
  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    const err = new Error('Invalid credentials');
    err.status = 401;
    throw err;
  }
  const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, process.env.JWT_SECRET || 'changeme', {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  });
  return { token, user: sanitizeUser(user) };
}

function sanitizeUser(user) {
  const { id, email, name, role, createdAt, updatedAt } = user.toJSON();
  return { id, email, name, role, createdAt, updatedAt };
}

