const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

exports.signup = catchAsync(async (req, res, next) => {
  const { name, email, password, passwordConfirm, passwordChangedAt } =
    req.body || {};

  const newUser = await User.create({
    name,
    email,
    password,
    passwordConfirm,
    passwordChangedAt,
  });

  const token = signToken(newUser._id);

  res.status(201).json({ status: 'success', token, data: { user: newUser } });
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body || {};

  // 1) Validate email and password

  if (!email || !password)
    return next(new AppError('Please provide email and password', 404));

  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await user.checkPassword(password, user.password)))
    return next(new AppError('Incorrect email or password', 401));

  // 3) If all is ok, send token to client
  const token = signToken(user._id);

  res.status(200).json({ status: 'success', token });
});

exports.verify = catchAsync(async (req, res, next) => {
  // 1) Getting token and checking of it's therefore
  const { authorization } = req.headers || {};
  const token =
    authorization?.startsWith('Bearer') && authorization.split(' ')[1];

  // 2) Verification token

  if (!token) return next(new AppError('Please login to get an access.', 401));

  // 3) Check if user still exist

  // @ts-ignore
  const { id, iat } = await promisify(jwt.verify)(
    token,
    // @ts-ignore
    process.env.JWT_SECRET
  );

  const curUser = await User.findById(id);

  if (!curUser)
    return next(
      new AppError('The user belonging to this token does no longer exist', 401)
    );

  // 4) Check if user changes password after the token was isSupported

  if (curUser.changedPasswordAfter(iat))
    return next(new AppError('User recently changed password', 401));

  // Grant access to protected rout
  req.user = curUser;
  next();
});

exports.restrictTo = (roles) => (req, res, next) => {
  const { role } = req.user || {};

  if (!roles.includes(role))
    return next(
      new AppError('You do not have permission to access this action.', 401)
    );

  next();
};

exports.forgotPassword = catchAsync(async (req, res, next) => {
  const { email } = req.body || {};

  const user = await User.findOne({ email });

  if (!user) return next(new AppError('User not found', 404));

  const hashedToken = user.createPasswordResetToken();

  await user.save({ validateBeforeSave: false });

  console.log(user);
});

exports.resetPassword = catchAsync((req, res, next) => {
  const { role } = req.user || {};

  if (!roles.includes(role))
    return next(
      new AppError('You do not have permission to access this action.', 401)
    );

  next();
});
