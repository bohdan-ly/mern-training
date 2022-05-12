const User = require('../models/userModel');
const APIFeatures = require('../utils/apiFeatures');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

exports.getAllUsers = catchAsync(async (req, res) => {
  const users = await User.find();

  res
    .status(200)
    .json({ status: 'success', results: users.length, data: { users } });
});

exports.createUser = (req, res) => {
  res.status(500).json({ status: 'error', message: `Route doesn't exist` });
};

exports.getUser = (req, res) => {
  res.status(500).json({ status: 'error', message: `Route doesn't exist` });
};

exports.updateUser = (req, res) => {
  res.status(500).json({ status: 'error', message: `Route doesn't exist` });
};

exports.deleteUser = (req, res) => {
  res.status(500).json({ status: 'error', message: `Route doesn't exist` });
};
