const AppError = require('../utils/AppError');

function handeleCastErrorDB(err) {
  const message = `Invalid ${err.path}: ${err.value}`;
  return new AppError(message, 400);
}
function handeleDuplicateFieldsDB(err) {
  const value = err.errmsg.match(/(["'])(?:(?=(\\?))\2.)*?\1/);
  const message = `Duplicate field value ${value}: please use another value `;
  return new AppError(message, 400);
}
function handleValidationErrorDB(err) {
  const errors = Object.values(err.errors).map((el) => el.message);
  const message = `Invalid input data. ${errors.join('. ')} `;
  return new AppError(message, 400);
}

const handleJWTError = () => {
  return new AppError('Invalid token, please login again', 401);
};
const handleJWTExpiredError = () => {
  return new AppError('Yout Token has Expired, please login again', 401);
};

function sendErrorDev(err, req, res) {
  if (req.originalUrl.startsWith('/api')) {
    return res.status(err.statusCode).json({
      status: err.status,
      error: err,
      stack: err.stack,
      message: err.message,
    });
  }
  return res
    .status(err.statusCode)
    .render('error', { title: 'Something went wrong', msg: err.message });
}

function sendErrorProd(err, req, res) {
  if (req.originalUrl.startsWith('/api')) {
    //  A) Operational trusted error send message to the client
    if (err.isOperational) {
      return res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
      });
    }
    return res.status(500).json({
      status: 'error',
      message: 'Something went very wrong',
    });
  }
  // B) rendered website

  if (err.isOperational) {
    return res
      .status(err.statusCode)
      .render('error', { title: 'Something went wrong', msg: err.message });
  }
  return res.status(err.statusCode).render('error', {
    title: 'Something went wrong',
    msg: 'Please try again later',
  });
}
module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, req, res);
  } else if (process.env.NODE_ENV === 'production') {
    let error = { ...err };
    console.log(err.message);
    error.message = err.message;
    if (error.name === 'CastError') error = handeleCastErrorDB(error);
    if (error.code === 11000) error = handeleDuplicateFieldsDB(error);
    if (error.name === 'ValidationError')
      error = handleValidationErrorDB(error);

    if (error.name === 'JsonWebTokenError') error = handleJWTError();
    if (error.name === 'TokenExpiredError') error = handleJWTExpiredError();
    sendErrorProd(error, req, res);
  }
};
