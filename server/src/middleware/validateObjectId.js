const mongoose = require('mongoose');

/**
 * Middleware to validate MongoDB ObjectId parameters in request params.
 * Default param name is 'id'.
 */
const validateObjectId = (paramName = 'id') => {
  return (req, res, next) => {
    const id = req.params[paramName];
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        error: 'Bad Request',
        message: `The provided '${paramName}' (${id}) is not a valid MongoDB ObjectId`,
      });
    }
    next();
  };
};

module.exports = validateObjectId;
