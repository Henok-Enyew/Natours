const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/AppError');
const APIFeatures = require(`./../utils/apiFeature`);

exports.deleteOne = (Model) => {
  return catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndDelete(req.params.id);

    if (!doc) {
      return next(new AppError('No document found with that id', 404));
    }
    res.status(200).json({
      status: 'success',
      data: null,
    });
  });
};

exports.updateOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!doc) {
      return next(new AppError('No document found with that id', 404));
    }
    res.status(200).json({
      status: 'success',
      data: {
        data: doc,
      },
    });
  });

exports.createOne = (Model) => {
  return catchAsync(async (req, res, next) => {
    const doc = await Model.create(req.body);
    res.status(201).json({
      status: 'success',
      data: {
        tour: doc,
      },
    });
  });
};

exports.getOne = (Model, popOptions) => {
  return catchAsync(async (req, res, next) => {
    let query = Model.findById(req.params.id);
    if (popOptions) {
      query = query.populate(popOptions);
    }
    const doc = await query;

    if (!doc) {
      return next(new AppError('No document found with that id', 404));
    }
    res.status(200).json({
      status: 'success',
      data: {
        doc,
      },
    });
  });
};

exports.getAll = (Model) =>
  catchAsync(async (req, res, next) => {
    let filter = {};
    if (req.params.tourId) filter = { tour: req.params.tourId };
    const features = new APIFeatures(Model.find(), req.query)
      .filter(filter)
      .sort()
      .limitFields()
      .pagination();
    // const doc = await features.query.explain();
    const doc = await features.query;
    res.status(200).json({
      status: 'success',
      resultNumber: doc.length,
      data: {
        data: doc,
      },
    });
  });
