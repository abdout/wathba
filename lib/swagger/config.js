const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'Alwathba (Alwathba Coop) API Documentation',
    version: '1.0.0',
    description: 'Complete API documentation for the Alwathba multi-vendor e-commerce platform',
    contact: {
      name: 'Alwathba Coop',
      email: 'sales@alwathbacoop.ae',
      url: 'https://alwathbacoop.ae'
    }
  },
  servers: [
    {
      url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
      description: 'Development server'
    },
    {
      url: 'https://alwathbacoop.ae',
      description: 'Production server'
    }
  ],
  components: {
    securitySchemes: {
      ClerkAuth: {
        type: 'apiKey',
        in: 'header',
        name: 'Authorization',
        description: 'Clerk authentication token'
      }
    },
    schemas: {
      Product: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          name: { type: 'string' },
          description: { type: 'string' },
          mrp: { type: 'number' },
          price: { type: 'number' },
          images: { type: 'array', items: { type: 'string' } },
          category: { type: 'string' },
          inStock: { type: 'boolean' },
          storeId: { type: 'string' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' }
        }
      },
      Order: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          total: { type: 'number' },
          status: {
            type: 'string',
            enum: ['ORDER_PLACED', 'PROCESSING', 'SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED', 'REFUNDED']
          },
          userId: { type: 'string' },
          storeId: { type: 'string' },
          addressId: { type: 'string' },
          isPaid: { type: 'boolean' },
          paymentMethod: {
            type: 'string',
            enum: ['COD', 'STRIPE', 'PAYPAL']
          },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' }
        }
      },
      Review: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          rating: { type: 'integer', minimum: 1, maximum: 5 },
          review: { type: 'string' },
          userId: { type: 'string' },
          productId: { type: 'string' },
          orderId: { type: 'string' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' }
        }
      },
      Cart: {
        type: 'object',
        additionalProperties: {
          type: 'integer',
          minimum: 1
        }
      },
      Address: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          userId: { type: 'string' },
          name: { type: 'string' },
          email: { type: 'string' },
          street: { type: 'string' },
          city: { type: 'string' },
          state: { type: 'string' },
          zip: { type: 'string' },
          country: { type: 'string' },
          phone: { type: 'string' }
        }
      },
      Store: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          name: { type: 'string' },
          description: { type: 'string' },
          username: { type: 'string' },
          address: { type: 'string' },
          status: { type: 'string', enum: ['pending', 'approved', 'rejected'] },
          isActive: { type: 'boolean' },
          logo: { type: 'string' },
          email: { type: 'string' },
          contact: { type: 'string' }
        }
      },
      Error: {
        type: 'object',
        properties: {
          success: { type: 'boolean', default: false },
          error: { type: 'string' },
          message: { type: 'string' },
          details: { type: 'object' }
        }
      },
      Success: {
        type: 'object',
        properties: {
          success: { type: 'boolean', default: true },
          data: { type: 'object' }
        }
      }
    }
  },
  tags: [
    { name: 'Products', description: 'Product management endpoints' },
    { name: 'Orders', description: 'Order management endpoints' },
    { name: 'Cart', description: 'Shopping cart endpoints' },
    { name: 'Reviews', description: 'Product reviews and ratings' },
    { name: 'User', description: 'User profile and addresses' },
    { name: 'Vendor', description: 'Vendor store management' },
    { name: 'Admin', description: 'Admin management endpoints' },
    { name: 'Payment', description: 'Payment processing endpoints' },
    { name: 'Email', description: 'Email notification endpoints' }
  ]
};

const options = {
  swaggerDefinition,
  apis: ['./app/api/**/*.js', './lib/swagger/docs/*.js']
};

export default options;