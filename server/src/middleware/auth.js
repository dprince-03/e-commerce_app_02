const jwt = require('jsonwebtoken');
const { prisma } = require('../config/database');
const logger = require('../utils/logger');

/**
 * Verify JWT token middleware
 */
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access token is required',
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Get user from database
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        status: true,
        isEmailVerified: true,
      },
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token - user not found',
      });
    }

    if (user.status !== 'ACTIVE') {
      return res.status(401).json({
        success: false,
        message: 'Account is not active',
      });
    }

    // Attach user to request
    req.user = user;
    next();
  } catch (error) {
    logger.error('Token verification failed:', error);
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token has expired',
      });
    }
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token',
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

/**
 * Role-based access control middleware
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions',
      });
    }

    next();
  };
};

/**
 * Check if user owns the resource or is admin
 */
const authorizeResource = (resourceModel, resourceIdField = 'id') => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required',
        });
      }

      // Admin can access everything
      if (req.user.role === 'ADMIN') {
        return next();
      }

      const resourceId = req.params[resourceIdField];
      if (!resourceId) {
        return res.status(400).json({
          success: false,
          message: 'Resource ID is required',
        });
      }

      // Check if user owns the resource
      const resource = await prisma[resourceModel].findUnique({
        where: { id: resourceId },
        select: { userId: true },
      });

      if (!resource) {
        return res.status(404).json({
          success: false,
          message: 'Resource not found',
        });
      }

      if (resource.userId !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: 'Access denied - you can only access your own resources',
        });
      }

      next();
    } catch (error) {
      logger.error('Resource authorization failed:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  };
};

/**
 * Optional authentication middleware
 */
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          status: true,
        },
      });

      if (user && user.status === 'ACTIVE') {
        req.user = user;
      }
    }

    next();
  } catch (error) {
    // Continue without authentication
    next();
  }
};

module.exports = {
  authenticateToken,
  authorize,
  authorizeResource,
  optionalAuth,
};