export function errorHandler(err, req, res, next) {
  console.error('Error:', err.message);

  // Zod validation errors
  if (err.name === 'ZodError') {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: err.errors.map(e => ({
        field: e.path.join('.'),
        message: e.message,
      })),
    });
  }

  // Prisma unique constraint violation
  if (err.code === 'P2002') {
    const target = err.meta?.target;
    if (target?.includes('email')) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email already exists.',
      });
    }
    if (target?.includes('unique_user_date_slot') || (target?.includes('user_id') && target?.includes('slot'))) {
      return res.status(409).json({
        success: false,
        message: 'You already have a reading for this slot on this date.',
      });
    }
    return res.status(409).json({
      success: false,
      message: 'A record with this data already exists.',
    });
  }

  // Prisma record not found
  if (err.code === 'P2025') {
    return res.status(404).json({
      success: false,
      message: 'Record not found.',
    });
  }

  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal server error',
  });
}
