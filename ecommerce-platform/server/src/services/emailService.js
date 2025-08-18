const nodemailer = require('nodemailer');
const logger = require('../utils/logger');

require('dotenv').config();

// Create transporter
const createTransporter = () => {
  return nodemailer.createTransporter({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: process.env.SMTP_PORT == 465, // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

// Send email function
const sendEmail = async (options) => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: `"E-commerce Platform" <${process.env.SMTP_USER}>`,
      to: options.email,
      subject: options.subject,
      text: options.message,
      html: options.html,
    };

    const info = await transporter.sendMail(mailOptions);
    logger.info(`Email sent: ${info.messageId}`);
    return info;
  } catch (error) {
    logger.error('Email sending failed:', error);
    throw error;
  }
};

// Email templates
const getEmailTemplate = (type, data) => {
  const baseStyle = `
    <style>
      body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
      .container { max-width: 600px; margin: 0 auto; padding: 20px; }
      .header { background-color: #007bff; color: white; padding: 20px; text-align: center; }
      .content { padding: 20px; background-color: #f8f9fa; }
      .button { 
        display: inline-block; 
        padding: 12px 24px; 
        background-color: #007bff; 
        color: white; 
        text-decoration: none; 
        border-radius: 5px; 
        margin: 10px 0;
      }
      .footer { padding: 20px; text-align: center; color: #666; font-size: 12px; }
    </style>
  `;

  const templates = {
    verification: `
      ${baseStyle}
      <div class="container">
        <div class="header">
          <h1>Welcome to E-commerce Platform!</h1>
        </div>
        <div class="content">
          <h2>Hi ${data.firstName},</h2>
          <p>Thank you for registering with us. Please verify your email address to complete your registration.</p>
          <p>
            <a href="${process.env.API_URL}/api/auth/verify-email/${data.token}" class="button">
              Verify Email Address
            </a>
          </p>
          <p>If the button doesn't work, copy and paste this link into your browser:</p>
          <p>${process.env.API_URL}/api/auth/verify-email/${data.token}</p>
          <p>This link will expire in 24 hours.</p>
        </div>
        <div class="footer">
          <p>If you didn't create an account, please ignore this email.</p>
        </div>
      </div>
    `,
    
    passwordReset: `
      ${baseStyle}
      <div class="container">
        <div class="header">
          <h1>Password Reset Request</h1>
        </div>
        <div class="content">
          <h2>Hi ${data.firstName},</h2>
          <p>We received a request to reset your password. Click the button below to reset it:</p>
          <p>
            <a href="${process.env.API_URL}/api/auth/reset-password/${data.token}" class="button">
              Reset Password
            </a>
          </p>
          <p>If the button doesn't work, copy and paste this link into your browser:</p>
          <p>${process.env.API_URL}/api/auth/reset-password/${data.token}</p>
          <p>This link will expire in 10 minutes.</p>
        </div>
        <div class="footer">
          <p>If you didn't request a password reset, please ignore this email.</p>
        </div>
      </div>
    `,

    orderConfirmation: `
      ${baseStyle}
      <div class="container">
        <div class="header">
          <h1>Order Confirmation</h1>
        </div>
        <div class="content">
          <h2>Hi ${data.firstName},</h2>
          <p>Thank you for your order! Here are the details:</p>
          <div style="background: white; padding: 15px; margin: 10px 0; border-radius: 5px;">
            <h3>Order #${data.orderNumber}</h3>
            <p><strong>Order Date:</strong> ${new Date(data.createdAt).toLocaleDateString()}</p>
            <p><strong>Total Amount:</strong> $${data.totalAmount}</p>
            <p><strong>Status:</strong> ${data.status}</p>
          </div>
          <h3>Items Ordered:</h3>
          ${data.items.map(item => `
            <div style="background: white; padding: 10px; margin: 5px 0; border-radius: 5px;">
              <p><strong>${item.productName}</strong></p>
              <p>Quantity: ${item.quantity} × $${item.price} = $${item.totalPrice}</p>
            </div>
          `).join('')}
          <p>We'll send you another email when your order ships.</p>
        </div>
        <div class="footer">
          <p>Thank you for shopping with us!</p>
        </div>
      </div>
    `,

    orderShipped: `
      ${baseStyle}
      <div class="container">
        <div class="header">
          <h1>Order Shipped</h1>
        </div>
        <div class="content">
          <h2>Hi ${data.firstName},</h2>
          <p>Great news! Your order has been shipped.</p>
          <div style="background: white; padding: 15px; margin: 10px 0; border-radius: 5px;">
            <h3>Order #${data.orderNumber}</h3>
            <p><strong>Tracking Number:</strong> ${data.trackingNumber}</p>
            <p><strong>Shipping Method:</strong> ${data.shippingMethod}</p>
            <p><strong>Estimated Delivery:</strong> 3-5 business days</p>
          </div>
          <p>You can track your package using the tracking number above.</p>
        </div>
        <div class="footer">
          <p>Thank you for shopping with us!</p>
        </div>
      </div>
    `,

    welcome: `
      ${baseStyle}
      <div class="container">
        <div class="header">
          <h1>Welcome to E-commerce Platform!</h1>
        </div>
        <div class="content">
          <h2>Hi ${data.firstName},</h2>
          <p>Welcome to our e-commerce platform! We're excited to have you as part of our community.</p>
          <p>Here's what you can do now:</p>
          <ul>
            <li>Browse our extensive product catalog</li>
            <li>Add items to your wishlist</li>
            <li>Enjoy secure checkout and payment</li>
            <li>Track your orders in real-time</li>
            <li>Leave reviews for products you love</li>
          </ul>
          <p>
            <a href="${process.env.API_URL}" class="button">
              Start Shopping
            </a>
          </p>
        </div>
        <div class="footer">
          <p>Happy shopping!</p>
        </div>
      </div>
    `,
  };

  return templates[type] || '';
};

// Send verification email
const sendVerificationEmail = async (user, token) => {
  const html = getEmailTemplate('verification', {
    firstName: user.firstName,
    token,
  });

  await sendEmail({
    email: user.email,
    subject: 'Verify Your Email Address',
    html,
    message: `Please verify your email by clicking this link: ${process.env.API_URL}/api/auth/verify-email/${token}`,
  });
};

// Send password reset email
const sendPasswordResetEmail = async (user, token) => {
  const html = getEmailTemplate('passwordReset', {
    firstName: user.firstName,
    token,
  });

  await sendEmail({
    email: user.email,
    subject: 'Password Reset Request',
    html,
    message: `Reset your password by clicking this link: ${process.env.API_URL}/api/auth/reset-password/${token}`,
  });
};

// Send welcome email
const sendWelcomeEmail = async (user) => {
  const html = getEmailTemplate('welcome', {
    firstName: user.firstName,
  });

  await sendEmail({
    email: user.email,
    subject: 'Welcome to E-commerce Platform!',
    html,
    message: 'Welcome to our e-commerce platform! Start exploring our products today.',
  });
};

// Send order confirmation email
const sendOrderConfirmationEmail = async (order, user) => {
  const html = getEmailTemplate('orderConfirmation', {
    firstName: user.firstName,
    orderNumber: order.orderNumber,
    createdAt: order.createdAt,
    totalAmount: order.totalAmount,
    status: order.status,
    items: order.items,
  });

  await sendEmail({
    email: user.email,
    subject: `Order Confirmation - #${order.orderNumber}`,
    html,
    message: `Your order #${order.orderNumber} has been confirmed. Total: $${order.totalAmount}`,
  });
};

// Send order shipped email
const sendOrderShippedEmail = async (order, user) => {
  const html = getEmailTemplate('orderShipped', {
    firstName: user.firstName,
    orderNumber: order.orderNumber,
    trackingNumber: order.trackingNumber,
    shippingMethod: order.shippingMethod,
  });

  await sendEmail({
    email: user.email,
    subject: `Order Shipped - #${order.orderNumber}`,
    html,
    message: `Your order #${order.orderNumber} has been shipped. Tracking: ${order.trackingNumber}`,
  });
};

// Send low stock alert (for admins/vendors)
const sendLowStockAlert = async (product, recipients) => {
  const html = `
    <h2>Low Stock Alert</h2>
    <p>The following product is running low on stock:</p>
    <p><strong>Product:</strong> ${product.name}</p>
    <p><strong>SKU:</strong> ${product.sku}</p>
    <p><strong>Current Stock:</strong> ${product.quantity}</p>
    <p><strong>Threshold:</strong> ${product.lowStockThreshold}</p>
    <p>Please restock this product soon to avoid stockouts.</p>
  `;

  for (const email of recipients) {
    await sendEmail({
      email,
      subject: `Low Stock Alert - ${product.name}`,
      html,
      message: `Low stock alert for ${product.name}. Current stock: ${product.quantity}`,
    });
  }
};

// Send newsletter
const sendNewsletter = async (subscribers, subject, content) => {
  const html = `
    <style>
      body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
      .container { max-width: 600px; margin: 0 auto; padding: 20px; }
      .header { background-color: #007bff; color: white; padding: 20px; text-align: center; }
      .content { padding: 20px; background-color: #f8f9fa; }
    </style>
    <div class="container">
      <div class="header">
        <h1>E-commerce Platform Newsletter</h1>
      </div>
      <div class="content">
        ${content}
      </div>
    </div>
  `;

  const promises = subscribers.map(subscriber => 
    sendEmail({
      email: subscriber.email,
      subject,
      html,
      message: content.replace(/<[^>]*>/g, ''), // Strip HTML for text version
    }).catch(err => {
      logger.error(`Failed to send newsletter to ${subscriber.email}:`, err);
    })
  );

  await Promise.allSettled(promises);
};

module.exports = {
  sendEmail,
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendWelcomeEmail,
  sendOrderConfirmationEmail,
  sendOrderShippedEmail,
  sendLowStockAlert,
  sendNewsletter,
};