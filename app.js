const morgan = require('morgan');
const express = require('express');

const AppError = require(`./utils/AppError`);

const globalErrorHandler = require(`./controllers/errorController`);

const userRouter = require(`./routes/userRoutes`);
const tourRouter = require(`./routes/tourRoutes`);

const app = express();

app.use(express.json());
app.use(express.static(`${__dirname}/public`));

if (process.env.NODE_ENV == 'development') {
  app.use(morgan('dev'));
}
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

app.all('*', (req, res, next) => {
  // const err = new Error(`Can't find ${req.originalUrl} on this server!`);
  // err.status = 'fail';
  // err.statusCode = 404;

  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);
module.exports = app;

// app.use((req, res, next) => {
//   console.log('Hello form the middleware');
//   next();
// });
// app.use((req, res, next) => {
//   req.requestedTime = new Date().toISOString();
//   console.log(req.requestedTime);
//   next();
// });

// app.get('/', (req, res) => {
//   res.send('Hello mother fucker');
// });

// app.post('/', (req, res) => {
//   res.send('You can post but fuck u tho');
// });

// Tours
