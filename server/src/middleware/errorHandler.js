// 404 Not Found Middleware
const notFoundHandler = (req, res, next) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Cannot ${req.method} ${req.originalUrl}`,
  });
};

// Global Error Handler Middleware
const errorHandler = (err, req, res, next) => {
  // Handle Malformed JSON payload
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({
      error: 'Bad Request',
      message: 'Malformed JSON payload in request body',
    });
  }

  // Handle Mongoose CastError (e.g., malformed ObjectId)
  if (err.name === 'CastError') {
    return res.status(400).json({
      error: 'Bad Request',
      message: `Invalid value '${err.value}' for field '${err.path}'`,
    });
  }

  // Handle Mongoose Schema Validation Errors
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((val) => val.message);
    return res.status(400).json({
      error: 'Validation Error',
      message: messages.join('; '),
      details: Object.keys(err.errors).reduce((acc, key) => {
        acc[key] = err.errors[key].message;
        return acc;
      }, {}),
    });
  }

  // Handle MongoDB Duplicate Key Error (E11000)
  if (err.code === 11000) {
    const fields = Object.keys(err.keyValue || {});
    return res.status(409).json({
      error: 'Conflict',
      message: `Duplicate value entered for field(s): ${fields.join(', ')}`,
    });
  }

  // Default Internal Server Error (never leak stack trace or credentials in response)
  const statusCode = res.statusCode && res.statusCode !== 200 ? res.statusCode : 500;
  console.error('[Unhandled Server Error]', err);

  res.status(statusCode).json({
    error: err.name || 'Internal Server Error',
    message: err.message || 'An unexpected error occurred on the server',
  });
};

module.exports = {
  notFoundHandler,
  errorHandler,
};
