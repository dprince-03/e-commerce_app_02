const crypto = require('crypto');
const { User } = require('../models');
const { 
  generateToken, 
  generateRefreshToken, 
  verifyRefreshToken 
} = require('../middleware/auth');
const { asyncHandler, AppError } = require('../middleware/errorHandler');
const logger = require('../utils/logger');
const emailService = require('../services/emailService');

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
const register = asyncHandler(async (req, res) => {
  const { firstName, lastName, email, password, phone, dateOfBirth } = req.body;

  // Check if user already exists
  const existingUser = await User.findOne({ where: { email } });
  if (existingUser) {
    throw new AppError('User already exists with this email', 409);
  }

  // Generate email verification token
  const emailVerificationToken = crypto.randomBytes(32).toString('hex');

  // Create user
  const user = await User.create({
    firstName,
    lastName,
    email,
    password,
    phone,
    dateOfBirth,
    emailVerificationToken,
  });

  // Generate tokens
  const token = generateToken({ userId: user.id });
  const refreshToken = generateRefreshToken({ userId: user.id });

  // Send verification email (in background)
  emailService.sendVerificationEmail(user, emailVerificationToken)
    .catch(err => logger.error('Failed to send verification email:', err));

  // Log registration
  logger.info(`New user registered: ${email}`);

  res.status(201).json({
    success: true,
    message: 'User registered successfully. Please check your email for verification.',
    data: {
      user: user.toJSON(),
      token,
      refreshToken,
    },
  });
});

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Authenticate user
  const { user, error } = await User.getAuthenticated(email, password);
  
  if (error) {
    throw new AppError(error, 401);
  }

  // Generate tokens
  const token = generateToken({ userId: user.id });
  const refreshToken = generateRefreshToken({ userId: user.id });

  // Log successful login
  logger.info(`User logged in: ${email}`);

  res.json({
    success: true,
    message: 'Login successful',
    data: {
      user: user.toJSON(),
      token,
      refreshToken,
    },
  });
});

// @desc    Refresh access token
// @route   POST /api/auth/refresh
// @access  Public
const refresh = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    throw new AppError('Refresh token is required', 400);
  }

  try {
    const decoded = verifyRefreshToken(refreshToken);
    
    const user = await User.findByPk(decoded.userId, {
      attributes: { exclude: ['password'] },
    });

    if (!user || !user.isActive) {
      throw new AppError('Invalid refresh token', 401);
    }

    // Generate new tokens
    const newToken = generateToken({ userId: user.id });
    const newRefreshToken = generateRefreshToken({ userId: user.id });

    res.json({
      success: true,
      message: 'Tokens refreshed successfully',
      data: {
        token: newToken,
        refreshToken: newRefreshToken,
      },
    });
  } catch (error) {
    throw new AppError('Invalid refresh token', 401);
  }
});

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
const getMe = asyncHandler(async (req, res) => {
  res.json({
    success: true,
    data: {
      user: req.user,
    },
  });
});

// @desc    Update current user profile
// @route   PUT /api/auth/me
// @access  Private
const updateMe = asyncHandler(async (req, res) => {
  const { firstName, lastName, phone, dateOfBirth } = req.body;

  const user = await User.findByPk(req.user.id);
  
  // Update fields
  if (firstName) user.firstName = firstName;
  if (lastName) user.lastName = lastName;
  if (phone) user.phone = phone;
  if (dateOfBirth) user.dateOfBirth = dateOfBirth;

  await user.save();

  res.json({
    success: true,
    message: 'Profile updated successfully',
    data: {
      user: user.toJSON(),
    },
  });
});

// @desc    Change password
// @route   PUT /api/auth/change-password
// @access  Private
const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  const user = await User.findByPk(req.user.id);

  // Verify current password
  const isCurrentPasswordValid = await user.comparePassword(currentPassword);
  if (!isCurrentPasswordValid) {
    throw new AppError('Current password is incorrect', 400);
  }

  // Update password
  user.password = newPassword;
  await user.save();

  // Log password change
  logger.info(`Password changed for user: ${user.email}`);

  res.json({
    success: true,
    message: 'Password changed successfully',
  });
});

// @desc    Forgot password
// @route   POST /api/auth/forgot-password
// @access  Public
const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ where: { email } });
  if (!user) {
    // Don't reveal if email exists or not
    return res.json({
      success: true,
      message: 'If the email exists, a password reset link has been sent',
    });
  }

  // Generate reset token
  const resetToken = crypto.randomBytes(32).toString('hex');
  const resetTokenExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  // Save reset token
  user.passwordResetToken = resetToken;
  user.passwordResetExpires = resetTokenExpiry;
  await user.save();

  // Send reset email (in background)
  emailService.sendPasswordResetEmail(user, resetToken)
    .catch(err => logger.error('Failed to send password reset email:', err));

  // Log password reset request
  logger.info(`Password reset requested for: ${email}`);

  res.json({
    success: true,
    message: 'If the email exists, a password reset link has been sent',
  });
});

// @desc    Reset password
// @route   POST /api/auth/reset-password/:token
// @access  Public
const resetPassword = asyncHandler(async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  const user = await User.findOne({
    where: {
      passwordResetToken: token,
      passwordResetExpires: {
        [User.sequelize.Sequelize.Op.gt]: new Date(),
      },
    },
  });

  if (!user) {
    throw new AppError('Invalid or expired reset token', 400);
  }

  // Update password and clear reset token
  user.password = password;
  user.passwordResetToken = null;
  user.passwordResetExpires = null;
  user.loginAttempts = 0; // Reset login attempts
  user.lockUntil = null;
  await user.save();

  // Generate new tokens
  const newToken = generateToken({ userId: user.id });
  const refreshToken = generateRefreshToken({ userId: user.id });

  // Log password reset
  logger.info(`Password reset successful for: ${user.email}`);

  res.json({
    success: true,
    message: 'Password reset successful',
    data: {
      user: user.toJSON(),
      token: newToken,
      refreshToken,
    },
  });
});

// @desc    Verify email
// @route   GET /api/auth/verify-email/:token
// @access  Public
const verifyEmail = asyncHandler(async (req, res) => {
  const { token } = req.params;

  const user = await User.findOne({
    where: { emailVerificationToken: token },
  });

  if (!user) {
    throw new AppError('Invalid verification token', 400);
  }

  // Update user verification status
  user.isEmailVerified = true;
  user.emailVerificationToken = null;
  await user.save();

  // Log email verification
  logger.info(`Email verified for: ${user.email}`);

  res.json({
    success: true,
    message: 'Email verified successfully',
  });
});

// @desc    Resend verification email
// @route   POST /api/auth/resend-verification
// @access  Private
const resendVerification = asyncHandler(async (req, res) => {
  const user = await User.findByPk(req.user.id);

  if (user.isEmailVerified) {
    throw new AppError('Email is already verified', 400);
  }

  // Generate new verification token
  const emailVerificationToken = crypto.randomBytes(32).toString('hex');
  user.emailVerificationToken = emailVerificationToken;
  await user.save();

  // Send verification email
  await emailService.sendVerificationEmail(user, emailVerificationToken);

  res.json({
    success: true,
    message: 'Verification email sent successfully',
  });
});

// @desc    Logout user (client-side token invalidation)
// @route   POST /api/auth/logout
// @access  Private
const logout = asyncHandler(async (req, res) => {
  // In a more sophisticated setup, you might want to blacklist the token
  // For now, we'll just send a success response
  
  // Log logout
  logger.info(`User logged out: ${req.user.email}`);

  res.json({
    success: true,
    message: 'Logged out successfully',
  });
});

module.exports = {
  register,
  login,
  refresh,
  getMe,
  updateMe,
  changePassword,
  forgotPassword,
  resetPassword,
  verifyEmail,
  resendVerification,
  logout,
};