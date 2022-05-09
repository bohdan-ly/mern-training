const AppError = require('../utils/appError');

const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}`;
  return new AppError(message, 400);
};

const handleDuplicateFieldsDB = (err) => {
  const dupVal = Object.values(err.keyValue || '').join(', ');
  const message = `Duplication field value: ${dupVal}. Please use another value`;
  return new AppError(message, 400);
};

const handleValidationErrorDB = (err) => {
  const errorsStr = Object.values(err.errors || '')
    .map((el) => el.message)
    .join('. ');

  const message = `Invalid input data. ${errorsStr}`;
  return new AppError(message, 400);
};

const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
    stack: err.stack,
    error: err,
  });
};

const sendErrorProd = (err, res) => {
  // Operational, trusted error: send message to client
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });

    // Programming or other unknown error: don't leak error details'
  } else {
    // 1) Log error
    console.error('ERROR:', err);

    // 2) Send generic message
    res.status(500).json({
      status: 'error',
      message: 'Something went wrong',
    });
  }
};

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';
  let error = { ...err };

  switch (process.env.NODE_ENV) {
    case 'development':
      sendErrorDev(err, res);
      break;
    case 'production':
    default:
      if (err.name === 'CastError') error = handleCastErrorDB(error);
      if (err.code === 11000) error = handleDuplicateFieldsDB(error);
      if (err.name === 'ValidationError')
        error = handleValidationErrorDB(error);

      sendErrorProd(error, res);
      break;
  }
};
