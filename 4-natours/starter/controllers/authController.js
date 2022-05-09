const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');

exports.signup = catchAsync(async (req, res, next) => {
  const { name, email, password, passwordConfirm } = req.body || {};

  const newUser = await User.create({ name, email, password, passwordConfirm });

  const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

  res.status(201).json({ status: 'success', token, data: { user: newUser } });
});

exports.login = catchAsync(async (req, res, next) => {
  const { name, email, password, passwordConfirm } = req.body || {};

  const newUser = await User.create({ name, email, password, passwordConfirm });

  const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

  res.status(201).json({ status: 'success', token, data: { user: newUser } });
});
