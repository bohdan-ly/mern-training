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

const handleJWTError = () =>
  new AppError('Invalid token. Please login again.', 401);

const handleJWTExpiredError = () =>
  new AppError('Expired session. Please login a gain.', 401);

const sendErrorDev = (err, req, res) => {
  if (req.originalUrl.startsWith('/api')) {
    return res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
      stack: err.stack,
      error: err,
    });
  }

  return res.status(err.statusCode).render('', {
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
      sendErrorDev(err, req, res);
      break;
    case 'production':
    default:
      switch (err.name) {
        case 'CastError':
          error = handleCastErrorDB(error);
          break;
        case 'ValidationError':
          error = handleValidationErrorDB(error);
          break;
        case 'JsonWebTokenError':
          error = handleJWTError();
          break;
        case 'TokenExpiredError':
          error = handleJWTExpiredError();
          break;

        default:
          if (err.code === 11000) error = handleDuplicateFieldsDB(error);
          break;
      }

      sendErrorProd(error, req, res);
      break;
  }
};
