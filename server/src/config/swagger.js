import swaggerJSDoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'E-commerce API',
      version: '1.0.0'
    },
    servers: [{ url: process.env.APP_URL || 'http://localhost:4000' }],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      }
    },
    security: [{ bearerAuth: [] }]
  },
  apis: ['src/routes/*.js', 'src/controllers/*.js']
};

export const swaggerSpec = swaggerJSDoc(options);

