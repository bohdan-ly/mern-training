const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');

const app = express();

// @ts-ignore
const limiter = rateLimit({
  max: 100,
  windowMs: 15 * 60 * 1000,
  message: 'Too many requests. Please try again later',
});

// GLOBAL MIDDLEWARES

// Security HTTP headers
// @ts-ignore
app.use(helmet());

// Development logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Limit requests from same API
app.use('/api', limiter);

// Body parser with limit on 10kb, reading data from body into req.body
app.use(express.json({ limit: '10kb' }));

// Data sanitization against NoSQL query injection
app.use(mongoSanitize());

// Data sanitization against XSS
app.use(xss());

// Prevent parameter pollution
app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingsAverage',
      'ratingsQuantity',
      'price',
      'maxGroupSize',
      'difficulty',
    ],
  })
);

// Serving static files
app.use(express.static(`${__dirname}/public`));

// app.use((req, res, next) => {
//   console.log('Hello from middleware');
//   next();
// });

// Test middleware
app.use((req, res, next) => {
  // @ts-ignore
  req.requestTime = new Date().toISOString();
  next();
});

// app.get('/', (req, res) => {
//   res.status(200).json({ message: 'Hello, world!', success: true });
// });

// app.post('/', (req, res) => {
//   res.status(200).json({ message: 'Hello, world!2', success: true });
// });

// ROUTE HANDLES

// ROUTES

app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);

// app.get('/api/v1/tours', getAllTours);

// app.post('/api/v1/tours', createTour);

// app.get('/api/v1/tours/:id', getTour);

// app.patch('/api/v1/tours/:id', updateTour);

// app.delete('/api/v1/tours/:id', deleteTour);

app.all('*', (req, res, next) => {
  // res.status(404).json({
  //   success: 'fail',
  //   message: `Can't find ${req.originalUrl} on this server`,
  // });

  // const err = new Error();
  // err.statusCode = 404;
  // err.status = 'fail';
  // err.message = `Can't find ${req.originalUrl} on this server`;

  next(new AppError(`Can't find ${req.originalUrl} on this server`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
