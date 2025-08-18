const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'E-commerce Platform API',
      version: '1.0.0',
      description: 'A comprehensive e-commerce platform API built with Node.js, Express, and PostgreSQL',
      contact: {
        name: 'E-commerce Platform Team',
        email: 'support@ecommerce.com',
      },
    },
    servers: [
      {
        url: process.env.API_URL || 'http://localhost:5000',
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        User: {
          type: 'object',
          required: ['firstName', 'lastName', 'email'],
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
              description: 'User unique identifier',
            },
            firstName: {
              type: 'string',
              minLength: 2,
              maxLength: 50,
              description: 'User first name',
            },
            lastName: {
              type: 'string',
              minLength: 2,
              maxLength: 50,
              description: 'User last name',
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'User email address',
            },
            phone: {
              type: 'string',
              description: 'User phone number',
            },
            dateOfBirth: {
              type: 'string',
              format: 'date',
              description: 'User date of birth',
            },
            avatar: {
              type: 'string',
              description: 'User avatar URL',
            },
            role: {
              type: 'string',
              enum: ['customer', 'admin', 'vendor'],
              description: 'User role',
            },
            isActive: {
              type: 'boolean',
              description: 'User account status',
            },
            isEmailVerified: {
              type: 'boolean',
              description: 'Email verification status',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Account creation timestamp',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Last update timestamp',
            },
          },
        },
        Product: {
          type: 'object',
          required: ['name', 'description', 'price', 'categoryId'],
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
              description: 'Product unique identifier',
            },
            name: {
              type: 'string',
              minLength: 2,
              maxLength: 200,
              description: 'Product name',
            },
            slug: {
              type: 'string',
              description: 'Product URL slug',
            },
            description: {
              type: 'string',
              description: 'Product description',
            },
            shortDescription: {
              type: 'string',
              description: 'Product short description',
            },
            sku: {
              type: 'string',
              description: 'Product SKU',
            },
            price: {
              type: 'number',
              minimum: 0,
              description: 'Product price',
            },
            comparePrice: {
              type: 'number',
              minimum: 0,
              description: 'Product compare price',
            },
            quantity: {
              type: 'integer',
              minimum: 0,
              description: 'Product quantity in stock',
            },
            images: {
              type: 'array',
              items: {
                type: 'string',
              },
              description: 'Product images URLs',
            },
            categoryId: {
              type: 'string',
              format: 'uuid',
              description: 'Product category ID',
            },
            tags: {
              type: 'array',
              items: {
                type: 'string',
              },
              description: 'Product tags',
            },
            isActive: {
              type: 'boolean',
              description: 'Product active status',
            },
            isFeatured: {
              type: 'boolean',
              description: 'Product featured status',
            },
            rating: {
              type: 'number',
              minimum: 0,
              maximum: 5,
              description: 'Product average rating',
            },
            reviewCount: {
              type: 'integer',
              minimum: 0,
              description: 'Number of reviews',
            },
            salesCount: {
              type: 'integer',
              minimum: 0,
              description: 'Number of sales',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Product creation timestamp',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Last update timestamp',
            },
          },
        },
        Category: {
          type: 'object',
          required: ['name'],
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
              description: 'Category unique identifier',
            },
            name: {
              type: 'string',
              minLength: 2,
              maxLength: 100,
              description: 'Category name',
            },
            slug: {
              type: 'string',
              description: 'Category URL slug',
            },
            description: {
              type: 'string',
              description: 'Category description',
            },
            image: {
              type: 'string',
              description: 'Category image URL',
            },
            parentId: {
              type: 'string',
              format: 'uuid',
              description: 'Parent category ID',
            },
            isActive: {
              type: 'boolean',
              description: 'Category active status',
            },
            sortOrder: {
              type: 'integer',
              description: 'Category sort order',
            },
          },
        },
        Order: {
          type: 'object',
          required: ['userId', 'items', 'billingAddress', 'shippingAddress'],
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
              description: 'Order unique identifier',
            },
            orderNumber: {
              type: 'string',
              description: 'Order number',
            },
            userId: {
              type: 'string',
              format: 'uuid',
              description: 'Customer user ID',
            },
            status: {
              type: 'string',
              enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'],
              description: 'Order status',
            },
            paymentStatus: {
              type: 'string',
              enum: ['pending', 'paid', 'failed', 'refunded', 'partially_refunded'],
              description: 'Payment status',
            },
            subtotal: {
              type: 'number',
              minimum: 0,
              description: 'Order subtotal',
            },
            taxAmount: {
              type: 'number',
              minimum: 0,
              description: 'Tax amount',
            },
            shippingAmount: {
              type: 'number',
              minimum: 0,
              description: 'Shipping amount',
            },
            totalAmount: {
              type: 'number',
              minimum: 0,
              description: 'Total order amount',
            },
            billingAddress: {
              type: 'object',
              description: 'Billing address',
            },
            shippingAddress: {
              type: 'object',
              description: 'Shipping address',
            },
            trackingNumber: {
              type: 'string',
              description: 'Shipping tracking number',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Order creation timestamp',
            },
          },
        },
        Error: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false,
            },
            message: {
              type: 'string',
              description: 'Error message',
            },
            errors: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  field: {
                    type: 'string',
                  },
                  message: {
                    type: 'string',
                  },
                },
              },
              description: 'Validation errors',
            },
          },
        },
        Success: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true,
            },
            message: {
              type: 'string',
              description: 'Success message',
            },
            data: {
              type: 'object',
              description: 'Response data',
            },
          },
        },
      },
    },
    tags: [
      {
        name: 'Authentication',
        description: 'User authentication and authorization',
      },
      {
        name: 'Users',
        description: 'User management',
      },
      {
        name: 'Products',
        description: 'Product management',
      },
      {
        name: 'Categories',
        description: 'Product category management',
      },
      {
        name: 'Orders',
        description: 'Order management',
      },
      {
        name: 'Payments',
        description: 'Payment processing',
      },
      {
        name: 'Cart',
        description: 'Shopping cart management',
      },
      {
        name: 'Reviews',
        description: 'Product reviews',
      },
    ],
  },
  apis: ['./src/routes/*.js'], // Path to the API docs
};

const specs = swaggerJsdoc(options);

module.exports = specs;