const APIFeatures = require(`./../utils/apiFeature`);
const catchAsync = require(`../utils/catchAsync`);
const AppError = require(`../utils/AppError`);
const User = require('./../models/userModel');
// const users = JSON.parse(
//   fs.readFileSync(`${__dirname}/../dev-data/data/users.json`, 'utf-8')
// );
const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) {
      newObj[el] = obj[el];
    }
  });

  return newObj;
};

exports.updateMe = catchAsync(async (req, res, next) => {
  //1.Create error if user post password
  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new AppError(
        'Please use update my password route for updating passwords',
        400,
      ),
    );
  }

  // 2. Filterout to allow only the allowed fields to be updated
  const filteredBody = filterObj(req.body, 'name', 'email');

  // Update user document=> we cant use user.save() here becasue that will ask as to validate password and bluh bluh
  const updatedUser = await User.findByIdAndUpdate(req.user._id, filteredBody, {
    runValidators: true,
    new: true,
  });
  res.status(201).json({
    status: 'success',
    data: {
      user: updatedUser,
    },
  });
});

exports.deleteMe = catchAsync(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(req.user._id, { active: false });

  res.status(201).json({
    status: 'success',
    message: 'Hope you will come back again',
  });
});

exports.getAllUsers = catchAsync(async (req, res, next) => {
  const features = new APIFeatures(User.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .pagination();
  const users = await features.query;
  res.status(200).json({
    status: 'success',
    numUsers: users.length,
    data: {
      users,
    },
  });
});

exports.getUser = (req, res) => {
  const id = req.params.id;
  const user = users[id];

  if (!user)
    res.status(404).json({
      status: 'fail',
      message: 'user not found',
    });

  res.status(200).json({
    status: 'success',
    data: {
      user,
    },
  });
};

exports.createUser = (req, res) => {
  res.status(201).json({
    status: 'success',
    message: 'successfully created user',
  });
};

exports.updateUser = (req, res) => {
  if (req.params.id * 1 >= users.length) {
    res.status(404).json({
      status: 'fail',
      message: 'invalid id',
    });
  }

  res.status(200).json({
    status: 'success',
    data: {},
  });
};

exports.deleteUser = (req, res) => {
  if (req.params.id * 1 >= users.length) {
    res.status(404).json({
      status: 'fail',
      message: 'invalid id',
    });
  }

  res.status(200).json({
    status: 'success',
    data: null,
  });
};
