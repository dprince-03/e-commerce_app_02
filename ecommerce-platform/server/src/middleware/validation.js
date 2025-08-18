const { body, param, query, validationResult } = require('express-validator');
const { AppError, validationErrorHandler } = require('./errorHandler');

// Validation middleware to check for errors
const validate = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    const error = validationErrorHandler(errors);
    return next(error);
  }
  
  next();
};

// User validation rules
const validateUserRegistration = [
  body('firstName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2 and 50 characters'),
  
  body('lastName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2 and 50 characters'),
  
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one lowercase letter, one uppercase letter, and one number'),
  
  body('phone')
    .optional()
    .matches(/^[+]?[1-9][\d\s\-()]{7,15}$/)
    .withMessage('Please provide a valid phone number'),
  
  body('dateOfBirth')
    .optional()
    .isISO8601()
    .withMessage('Please provide a valid date of birth'),
  
  validate,
];

const validateUserLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  
  validate,
];

const validateUserUpdate = [
  body('firstName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2 and 50 characters'),
  
  body('lastName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2 and 50 characters'),
  
  body('phone')
    .optional()
    .matches(/^[+]?[1-9][\d\s\-()]{7,15}$/)
    .withMessage('Please provide a valid phone number'),
  
  body('dateOfBirth')
    .optional()
    .isISO8601()
    .withMessage('Please provide a valid date of birth'),
  
  validate,
];

const validatePasswordChange = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),
  
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('New password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('New password must contain at least one lowercase letter, one uppercase letter, and one number'),
  
  validate,
];

// Product validation rules
const validateProduct = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 200 })
    .withMessage('Product name must be between 2 and 200 characters'),
  
  body('description')
    .trim()
    .isLength({ min: 10 })
    .withMessage('Product description must be at least 10 characters long'),
  
  body('price')
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number'),
  
  body('comparePrice')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Compare price must be a positive number'),
  
  body('quantity')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Quantity must be a non-negative integer'),
  
  body('categoryId')
    .isUUID()
    .withMessage('Please provide a valid category ID'),
  
  body('sku')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('SKU must be between 1 and 100 characters'),
  
  body('weight')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Weight must be a positive number'),
  
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array'),
  
  body('tags.*')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Each tag must be between 1 and 50 characters'),
  
  validate,
];

const validateProductUpdate = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 200 })
    .withMessage('Product name must be between 2 and 200 characters'),
  
  body('description')
    .optional()
    .trim()
    .isLength({ min: 10 })
    .withMessage('Product description must be at least 10 characters long'),
  
  body('price')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number'),
  
  body('comparePrice')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Compare price must be a positive number'),
  
  body('quantity')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Quantity must be a non-negative integer'),
  
  body('categoryId')
    .optional()
    .isUUID()
    .withMessage('Please provide a valid category ID'),
  
  validate,
];

// Category validation rules
const validateCategory = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Category name must be between 2 and 100 characters'),
  
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description must not exceed 500 characters'),
  
  body('parentId')
    .optional()
    .isUUID()
    .withMessage('Parent ID must be a valid UUID'),
  
  validate,
];

// Order validation rules
const validateOrder = [
  body('items')
    .isArray({ min: 1 })
    .withMessage('Order must contain at least one item'),
  
  body('items.*.productId')
    .isUUID()
    .withMessage('Product ID must be a valid UUID'),
  
  body('items.*.quantity')
    .isInt({ min: 1 })
    .withMessage('Quantity must be a positive integer'),
  
  body('billingAddress')
    .isObject()
    .withMessage('Billing address is required'),
  
  body('billingAddress.firstName')
    .trim()
    .isLength({ min: 1 })
    .withMessage('Billing first name is required'),
  
  body('billingAddress.lastName')
    .trim()
    .isLength({ min: 1 })
    .withMessage('Billing last name is required'),
  
  body('billingAddress.address1')
    .trim()
    .isLength({ min: 1 })
    .withMessage('Billing address is required'),
  
  body('billingAddress.city')
    .trim()
    .isLength({ min: 1 })
    .withMessage('Billing city is required'),
  
  body('billingAddress.postalCode')
    .trim()
    .isLength({ min: 1 })
    .withMessage('Billing postal code is required'),
  
  body('billingAddress.country')
    .trim()
    .isLength({ min: 1 })
    .withMessage('Billing country is required'),
  
  body('shippingAddress')
    .isObject()
    .withMessage('Shipping address is required'),
  
  validate,
];

// Address validation rules
const validateAddress = [
  body('type')
    .isIn(['billing', 'shipping'])
    .withMessage('Address type must be either billing or shipping'),
  
  body('firstName')
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('First name is required and must not exceed 50 characters'),
  
  body('lastName')
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Last name is required and must not exceed 50 characters'),
  
  body('address1')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Address is required and must not exceed 100 characters'),
  
  body('city')
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('City is required and must not exceed 50 characters'),
  
  body('state')
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('State is required and must not exceed 50 characters'),
  
  body('postalCode')
    .trim()
    .isLength({ min: 1, max: 20 })
    .withMessage('Postal code is required and must not exceed 20 characters'),
  
  body('country')
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Country is required and must not exceed 50 characters'),
  
  body('phone')
    .optional()
    .matches(/^[+]?[1-9][\d\s\-()]{7,15}$/)
    .withMessage('Please provide a valid phone number'),
  
  validate,
];

// Review validation rules
const validateReview = [
  body('rating')
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be between 1 and 5'),
  
  body('title')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Review title must not exceed 100 characters'),
  
  body('comment')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Review comment must not exceed 1000 characters'),
  
  validate,
];

// Cart validation rules
const validateCartItem = [
  body('productId')
    .isUUID()
    .withMessage('Product ID must be a valid UUID'),
  
  body('quantity')
    .isInt({ min: 1, max: 100 })
    .withMessage('Quantity must be between 1 and 100'),
  
  body('variant')
    .optional()
    .isObject()
    .withMessage('Variant must be an object'),
  
  validate,
];

// Parameter validation
const validateUUID = (paramName) => [
  param(paramName)
    .isUUID()
    .withMessage(`${paramName} must be a valid UUID`),
  validate,
];

// Query validation
const validatePagination = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  
  query('sortBy')
    .optional()
    .isIn(['name', 'price', 'createdAt', 'rating', 'salesCount'])
    .withMessage('Invalid sort field'),
  
  query('sortOrder')
    .optional()
    .isIn(['ASC', 'DESC'])
    .withMessage('Sort order must be ASC or DESC'),
  
  validate,
];

const validateProductSearch = [
  query('q')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Search query must be between 1 and 100 characters'),
  
  query('category')
    .optional()
    .isUUID()
    .withMessage('Category must be a valid UUID'),
  
  query('minPrice')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Minimum price must be a positive number'),
  
  query('maxPrice')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Maximum price must be a positive number'),
  
  ...validatePagination,
];

module.exports = {
  validate,
  validateUserRegistration,
  validateUserLogin,
  validateUserUpdate,
  validatePasswordChange,
  validateProduct,
  validateProductUpdate,
  validateCategory,
  validateOrder,
  validateAddress,
  validateReview,
  validateCartItem,
  validateUUID,
  validatePagination,
  validateProductSearch,
};