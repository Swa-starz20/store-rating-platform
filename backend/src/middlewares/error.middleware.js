const { Prisma } = require('@prisma/client');
const { ZodError } = require('zod');

// Centralized error handling middleware
const errorHandler = (err, req, res, next) => {
  console.error('[Error Details]:', err);

  // Prisma unique constraint error
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') {
      const target = err.meta?.target ? ` (${err.meta.target.join(', ')})` : '';
      return res.status(409).json({
        success: false,
        message: `A record with this unique value already exists${target}.`,
        code: err.code
      });
    }

    if (err.code === 'P2025') {
      return res.status(404).json({
        success: false,
        message: 'The requested resource was not found.',
        code: err.code
      });
    }

    return res.status(400).json({
      success: false,
      message: 'Database query failed.',
      code: err.code,
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }

  // Zod validation error
  if (err instanceof ZodError) {
    const formattedErrors = err.errors.map((e) => ({
      field: e.path.join('.'),
      message: e.message
    }));

    return res.status(400).json({
      success: false,
      message: 'Validation error',
      errors: formattedErrors
    });
  }

  // Custom HTTP Errors with status code
  if (err.statusCode) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message || 'Error occurred'
    });
  }

  // Default server error
  return res.status(500).json({
    success: false,
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' ? { stack: err.stack } : {})
  });
};

module.exports = errorHandler;
