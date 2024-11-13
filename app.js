const morgan = require('morgan');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const express = require('express');

const AppError = require(`./utils/AppError`);

const globalErrorHandler = require(`./controllers/errorController`);

const userRouter = require(`./routes/userRoutes`);
const tourRouter = require(`./routes/tourRoutes`);
const reviewRouter = require(`./routes/reviewRoutes`);

const { whitelist } = require('validator');

const app = express();

// 1.GLOBAL MIDDLEWARES

// Set security HTTP headers
app.use(helmet());

// Development logging
if (process.env.NODE_ENV == 'development') {
  app.use(morgan('dev'));
}

// Limit requests from the same API
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'To many request from this ip please try again in an hour.',
});

app.use('/api', limiter);

// Body parser reading data from body into req.body
app.use(express.json({ limit: '10kb' }));

// Data sanotization against NOSQL query injection
app.use(mongoSanitize());
// Data sanotization against XSS
app.use(xss());

//  Prevent paramter pollution
app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingQuantity',
      'ratingsAverage',
      'maxGroupSize',
      'difficulty',
      'price',
    ],
  }),
);
// Serving static files
app.use(express.static(`${__dirname}/public`));

app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);

app.all('*', (req, res, next) => {
  // const err = new Error(`Can't find ${req.originalUrl} on this server!`);
  // err.status = 'fail';
  // err.statusCode = 404;

  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);
module.exports = app;
