const express = require('express');
const { authenticate, isAdmin } = require('../middleware/auth');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Payments
 *   description: Payment processing endpoints
 */

// Placeholder routes - will be implemented when payment processing is built
router.post('/create-intent', authenticate, (req, res) => {
  res.json({
    success: true,
    message: 'Payment intent endpoint - Coming soon',
  });
});

router.post('/webhook', (req, res) => {
  res.json({
    success: true,
    message: 'Payment webhook endpoint - Coming soon',
  });
});

module.exports = router;