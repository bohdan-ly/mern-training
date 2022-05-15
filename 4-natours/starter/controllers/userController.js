const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const factory = require('./handlerFactory');

const filterUserNewData = (body, ...allowedFields) =>
  Object.keys(body).reduce((acc, val) => {
    if (allowedFields.includes(val)) acc[val] = body[val];
    return acc;
  }, {});

exports.getMe = (req, res, next) => {
  req.params.id = req.user.id;
  next();
};

exports.updateMe = catchAsync(async (req, res, next) => {
  // 1) Create error if user POSTs password data
  if (req.body.password || req.body.passwordConfirm)
    return next(
      new AppError(
        'This route is not for password updates. Please use /updatePassword'
      )
    );

  // 2) Filter unwanted document
  const filteredBody = filterUserNewData(req.body, 'name', 'email');

  // 3) Update user data
  const user = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({ status: 'success', data: { user } });
});

exports.deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, { active: false });
  res.status(204).json({ status: 'success', data: null });
});

exports.createUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: `Route doesn't exist. Please user /signup instead.`,
  });
};

exports.getAllUsers = factory.getAll(User);
exports.getUser = factory.getOne(User);

// Do NOT update passwords with this
exports.updateUser = factory.updateOne(User);
exports.deleteUser = factory.deleteOne(User);
