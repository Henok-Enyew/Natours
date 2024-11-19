const Tour = require('../models/tourModel');
const User = require('../models/userModel');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');

exports.getOverview = catchAsync(async (req, res, next) => {
  const tours = await Tour.find();
  res.status(200).render('overview', { title: 'All tours', tours });
});
exports.getTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findOne({ slug: req.params.slug }).populate({
    path: 'reviews',
    fields: 'reivew user rating',
  });

  if (!tour) {
    return next(new AppError('There is no Tour with than name.', 404));
  }
  res.status(200).render('tour', { title: `${tour.name}`, tour });
});

exports.getLoginForm = catchAsync(async (req, res) => {
  res.status(200).render('login', { title: 'Login to your Account' });
});

exports.getAccount = catchAsync(async (req, res) => {
  res.status(200).render('account', { title: 'Your Account' });
});

exports.updateUserData = catchAsync(async (req, res) => {
  const updatedUser = await User.findByIdAndUpdate(
    req.user.id,
    {
      name: req.body.name,
      email: req.body.email,
    },
    {
      new: true,
      runValidators: true,
    },
  );
  res
    .status(200)
    .render('account', { title: 'Your Account', user: updatedUser });
});
