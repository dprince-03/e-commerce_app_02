const jwt = require('jsonwebtoken');

/**
 * Generate email verification token
 */
const generateVerificationToken = (userId) => {
  return jwt.sign(
    { 
      userId, 
      type: 'email_verification' 
    },
    process.env.JWT_SECRET,
    { expiresIn: '24h' }
  );
};

/**
 * Generate password reset token
 */
const generatePasswordResetToken = (userId) => {
  return jwt.sign(
    { 
      userId, 
      type: 'password_reset' 
    },
    process.env.JWT_SECRET,
    { expiresIn: '1h' }
  );
};

/**
 * Verify token and return decoded payload
 */
const verifyToken = (token, secret = process.env.JWT_SECRET) => {
  try {
    return jwt.verify(token, secret);
  } catch (error) {
    throw error;
  }
};

/**
 * Decode token without verification (for debugging)
 */
const decodeToken = (token) => {
  try {
    return jwt.decode(token);
  } catch (error) {
    throw error;
  }
};

module.exports = {
  generateVerificationToken,
  generatePasswordResetToken,
  verifyToken,
  decodeToken,
};