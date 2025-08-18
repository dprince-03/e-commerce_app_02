const sgMail = require('@sendgrid/mail');
const logger = require('../utils/logger');

// Configure SendGrid
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

/**
 * Send email verification email
 */
const sendVerificationEmail = async (email, token, firstName) => {
  try {
    const verificationUrl = `${process.env.CLIENT_URL}/verify-email?token=${token}`;
    
    const msg = {
      to: email,
      from: {
        email: process.env.SENDGRID_FROM_EMAIL,
        name: process.env.SENDGRID_FROM_NAME,
      },
      subject: 'Verify Your Email Address',
      templateId: 'd-verification-template-id', // Replace with your SendGrid template ID
      dynamicTemplateData: {
        firstName,
        verificationUrl,
        supportEmail: 'support@ecommerce.com',
      },
      // Fallback HTML if template is not available
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Welcome to Our E-commerce Platform!</h2>
          <p>Hi ${firstName},</p>
          <p>Thank you for registering with us. Please verify your email address by clicking the button below:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verificationUrl}" 
               style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
              Verify Email Address
            </a>
          </div>
          <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
          <p style="word-break: break-all; color: #666;">${verificationUrl}</p>
          <p>This link will expire in 24 hours.</p>
          <p>If you didn't create an account, please ignore this email.</p>
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
          <p style="color: #666; font-size: 14px;">
            Need help? Contact us at <a href="mailto:support@ecommerce.com">support@ecommerce.com</a>
          </p>
        </div>
      `,
    };

    await sgMail.send(msg);
    logger.info(`Verification email sent to: ${email}`);
    
    return true;
  } catch (error) {
    logger.error('Failed to send verification email:', error);
    throw error;
  }
};

/**
 * Send password reset email
 */
const sendPasswordResetEmail = async (email, token, firstName) => {
  try {
    const resetUrl = `${process.env.CLIENT_URL}/reset-password?token=${token}`;
    
    const msg = {
      to: email,
      from: {
        email: process.env.SENDGRID_FROM_EMAIL,
        name: process.env.SENDGRID_FROM_NAME,
      },
      subject: 'Reset Your Password',
      templateId: 'd-password-reset-template-id', // Replace with your SendGrid template ID
      dynamicTemplateData: {
        firstName,
        resetUrl,
        supportEmail: 'support@ecommerce.com',
      },
      // Fallback HTML if template is not available
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Password Reset Request</h2>
          <p>Hi ${firstName},</p>
          <p>We received a request to reset your password. Click the button below to create a new password:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" 
               style="background-color: #dc3545; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
              Reset Password
            </a>
          </div>
          <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
          <p style="word-break: break-all; color: #666;">${resetUrl}</p>
          <p>This link will expire in 1 hour.</p>
          <p>If you didn't request a password reset, please ignore this email. Your password will remain unchanged.</p>
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
          <p style="color: #666; font-size: 14px;">
            Need help? Contact us at <a href="mailto:support@ecommerce.com">support@ecommerce.com</a>
          </p>
        </div>
      `,
    };

    await sgMail.send(msg);
    logger.info(`Password reset email sent to: ${email}`);
    
    return true;
  } catch (error) {
    logger.error('Failed to send password reset email:', error);
    throw error;
  }
};

/**
 * Send order confirmation email
 */
const sendOrderConfirmationEmail = async (email, orderData) => {
  try {
    const { firstName, orderNumber, total, estimatedDelivery } = orderData;
    
    const msg = {
      to: email,
      from: {
        email: process.env.SENDGRID_FROM_EMAIL,
        name: process.env.SENDGRID_FROM_NAME,
      },
      subject: `Order Confirmation - #${orderNumber}`,
      templateId: 'd-order-confirmation-template-id', // Replace with your SendGrid template ID
      dynamicTemplateData: {
        firstName,
        orderNumber,
        total: `$${total}`,
        estimatedDelivery: estimatedDelivery ? new Date(estimatedDelivery).toLocaleDateString() : 'TBD',
        supportEmail: 'support@ecommerce.com',
      },
      // Fallback HTML if template is not available
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Order Confirmed!</h2>
          <p>Hi ${firstName},</p>
          <p>Thank you for your order! We've received your order and it's being processed.</p>
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
            <h3 style="margin-top: 0;">Order Details</h3>
            <p><strong>Order Number:</strong> #${orderNumber}</p>
            <p><strong>Total Amount:</strong> $${total}</p>
            <p><strong>Estimated Delivery:</strong> ${estimatedDelivery ? new Date(estimatedDelivery).toLocaleDateString() : 'TBD'}</p>
          </div>
          <p>We'll send you an email when your order ships with tracking information.</p>
          <p>If you have any questions, please contact our support team.</p>
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
          <p style="color: #666; font-size: 14px;">
            Need help? Contact us at <a href="mailto:support@ecommerce.com">support@ecommerce.com</a>
          </p>
        </div>
      `,
    };

    await sgMail.send(msg);
    logger.info(`Order confirmation email sent to: ${email}`);
    
    return true;
  } catch (error) {
    logger.error('Failed to send order confirmation email:', error);
    throw error;
  }
};

/**
 * Send welcome email
 */
const sendWelcomeEmail = async (email, firstName) => {
  try {
    const msg = {
      to: email,
      from: {
        email: process.env.SENDGRID_FROM_EMAIL,
        name: process.env.SENDGRID_FROM_NAME,
      },
      subject: 'Welcome to Our E-commerce Platform!',
      templateId: 'd-welcome-template-id', // Replace with your SendGrid template ID
      dynamicTemplateData: {
        firstName,
        supportEmail: 'support@ecommerce.com',
      },
      // Fallback HTML if template is not available
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Welcome to Our Platform!</h2>
          <p>Hi ${firstName},</p>
          <p>Welcome to our e-commerce platform! We're excited to have you on board.</p>
          <p>Here are some things you can do to get started:</p>
          <ul>
            <li>Browse our product catalog</li>
            <li>Create your first order</li>
            <li>Set up your profile</li>
            <li>Add items to your wishlist</li>
          </ul>
          <p>If you have any questions or need assistance, our support team is here to help!</p>
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
          <p style="color: #666; font-size: 14px;">
            Need help? Contact us at <a href="mailto:support@ecommerce.com">support@ecommerce.com</a>
          </p>
        </div>
      `,
    };

    await sgMail.send(msg);
    logger.info(`Welcome email sent to: ${email}`);
    
    return true;
  } catch (error) {
    logger.error('Failed to send welcome email:', error);
    throw error;
  }
};

module.exports = {
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendOrderConfirmationEmail,
  sendWelcomeEmail,
};