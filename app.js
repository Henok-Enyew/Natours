const morgan = require('morgan');
const path = require('path');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const express = require('express');
const cookieParser = require('cookie-parser');

const AppError = require(`./utils/AppError`);

const globalErrorHandler = require(`./controllers/errorController`);

const userRouter = require(`./routes/userRoutes`);
const tourRouter = require(`./routes/tourRoutes`);
const reviewRouter = require(`./routes/reviewRoutes`);
const viewRouter = require(`./routes/viewRoutes`);

const app = express();
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));
// 1.GLOBAL MIDDLEWARES
app.use(express.static(path.join(__dirname, 'public')));

// Set security HTTP headers
app.use(helmet());
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'"], // Default for other resources
      scriptSrc: [
        "'self'",
        'https://cdnjs.cloudflare.com',
        'https://js.stripe.com',
        'https://api.mapbox.com',
      ],
      connectSrc: [
        "'self'",
        'ws://*', // Allows all ws connections (non-secure)
        'wss://*', // Allows all wss connections (secure)
        'https://js.stripe.com', // Allow Stripe
        'wss://natours-2-shoq.onrender.com:4066', // Specific WebSocket server
        'ws://127.0.0.1:*',
      ],
      frameSrc: [
        "'self'",
        'https://js.stripe.com', // Allow iframes from Stripe
      ],
    },
  }),
);
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
app.use(cookieParser());

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

app.use((req, res, next) => {
  next();
});

app.use('/', viewRouter);
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);

app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);
module.exports = app;
