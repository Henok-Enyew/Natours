const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('./../models/userModel');
const catchAsync = require(`../utils/catchAsync`);
const AppError = require('../utils/AppError');
const Email = require('../utils/email');
const { promisify } = require('util');
// const Tour = require('../models/tourModel');

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    // expiresIn: process.env.JWT_EXPIRE,
  });
};

const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);

  const cookieOptions = {
    expiresIn: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000,
    ),
    httpOnly: true,
    secure: true,
  };

  // if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;
  res.cookie('jwt', token, cookieOptions);
  user.password = undefined;

  return res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user,
    },
  });
};

// const createVerificationToken = (userId) => {
//   return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
//     expiresIn: '24h', // Token valid for 24 hours
//   });
// };

// To make sure the user is verfied
exports.protectVerified = catchAsync(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });
  console.log(user.isVerified);
  if (!user.isVerified) {
    return next(
      new AppError('Please verify your email to access this resource.', 403),
    );
  }
  next();
});

exports.verifyEmail = catchAsync(async (req, res, next) => {
  const { token } = req.query;
  console.log(token);
  if (!token) {
    return next(new AppError('Token is missing!', 400));
  }
  // Verify the token
  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    return next(new AppError('Invalid or expired token!', 400));
  }

  // Update the user's verification status
  const user = await User.findByIdAndUpdate(decoded.id, { isVerified: true });

  if (!user) {
    return next(new AppError('User not found!', 404));
  }

  req.user = user;
  next();
  // createSendToken(user, 201, res);
});

exports.signup = catchAsync(async (req, res) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    role: req.body.role,
    // passwordChangedAt: req.body.passwordChangedAt,
  });

  // const url = `${req.protocol}://${req.get('host')}/me`;
  // `${process.env.FRONTEND_URL}/verify-email?token=${token}`

  const token = signToken(newUser._id);
  const url = `${req.protocol}://${req.get('host')}/verify-email?token=${token}`;
  // console.log(token);
  // await sendVerificationEmail(newUser.email, token);
  await new Email(newUser, url).sendVerfication();

  res.status(201).json({
    status: 'success',
    message: 'User created! Please verify your email.',
  });
  // createSendToken(newUser, 201, res);
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  // 1. Check if email and passwords exist
  if (!email || !password) {
    return next(new AppError('Please provide email and password', 400));
  }
  // 2.Check if user exists and password is correct
  const user = await User.findOne({ email }).select('+password');
  // console.log(email, password);
  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError('Incorrect email or password', 401));
  }
  //   3.Send token to client
  createSendToken(user, 201, res);
});

exports.protect = catchAsync(async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }
  if (!token) {
    return next(
      new AppError('You are not logged in! Please login to get access. '),
    );
  }
  // 2) Verfication Token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  // // 3> Checj if the user still exsits
  const freshUser = await User.findById(decoded.id);
  if (!freshUser) {
    return next(
      new AppError(
        'The user belonging to this token does no longer exist!',
        401,
      ),
    );
  }

  // // 4. Check if user chaged password after token was issued
  if (freshUser.changedPasswordAfter(decoded.iat)) {
    return next(
      new AppError('User recently changed password! Please login again ', 401),
    );
  }
  // GRANT ACCESS TO PROTECTED ROUTE
  req.user = freshUser;
  res.locals.user = freshUser;
  next();
});

exports.logout = (req, res) => {
  res.cookie('jwt', 'loggedout', {
    expiresIn: new Date(Date.now() * 10 * 1000),
    httpOnly: true,
  });

  res.status(201).json({ status: 'Success' });
};
// Ther will be no errors this is only for rendered pages
exports.isLoggedIn = async (req, res, next) => {
  if (req.cookies.jwt) {
    try {
      const decoded = await promisify(jwt.verify)(
        req.cookies.jwt,
        process.env.JWT_SECRET,
      );
      // // 3> Checj if the user still exsits
      const freshUser = await User.findById(decoded.id);
      if (!freshUser) {
        return next();
      }

      // // 4. Check if user chaged password after token was issued
      if (freshUser.changedPasswordAfter(decoded.iat)) {
        return next();
      }
      // GRANT ACCESS TO PROTECTED ROUTE

      res.locals.user = freshUser;
      return next();
    } catch (err) {
      return next();
    }
  }
  next();
};

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError(
          'You dont have the permission to perform this action!',
          403,
        ),
      );
    }
    next();
  };
};

exports.forgotPassword = catchAsync(async (req, res, next) => {
  // GET user based on posted email
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new AppError('There is no user with that email address!', 404));
  }
  //2 GEnerate random reset token
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });
  //3 Send

  try {
    const resetURL = `${req.protocol}://${req.get('host')}/api/v1/users/resetPassword/${resetToken}`;
    await new Email(user, resetURL).sendPasswordReset();
    res.status(200).json({
      status: 'success',
      message: 'Token sent to email ',
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return next(
      new AppError(
        'There was an error sending the email, please try again',
        500,
      ),
    );
  }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  // 1. GET user based on token
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });
  // 2.If token not expired,and there is a user, set new password
  if (!user) {
    return next(new AppError('Token is invalid or expired', 400));
  }

  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();
  createSendToken(user, 201, res);
  // const token = signToken(user._id);
  // res.status(201).json({
  //   status: 'success',
  //   token,
  // });
  // 3. UPDATE changed password at propety of the user
  // 4.LOG the usre in , send JWT
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  // 1. Get user from collection
  const currentPassword = req.body.passwordCurrent;
  const password = req.body.password;
  const passwordConfirm = req.body.passwordConfirm;
  const user = await User.findById(req.user.id).select('+password');
  // console.log('user: ' + req.user);
  // 2.Check if posted current password is correct
  if (!user || !(await user.correctPassword(currentPassword, user.password))) {
    return next(new AppError('The current password is not correct.', 401));
  }
  // 3.If so updaye password

  user.password = password;
  user.passwordConfirm = passwordConfirm;
  await user.save();

  //  4.Log user in , JWT
  createSendToken(user, 201, res);
  // next();
});
