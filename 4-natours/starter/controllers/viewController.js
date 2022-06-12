const Tour = require('../models/tourModel');
const User = require('../models/userModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

exports.overview = catchAsync(async (req, res, next) => {
  const tours = await Tour.find();

  res.status(200).render('overview', {
    title: 'All tours',
    tours,
  });
});

exports.tour = catchAsync(async (req, res, next) => {
  const { slug } = req.params || {};

  if (!slug) return res.redirect('/');

  // @ts-ignore
  const tour = await Tour.findOne({ slug }).populate({
    path: 'reviews',
    fields: 'review rating user',
  });

  console.log(tour);

  if (!tour)
    return next(new AppError('Tour with that name was not found', 404));

  res.status(200).render('tour', {
    title: tour.name,
    tour,
  });
});

exports.login = (req, res) =>
  res.status(200).render('login', {
    title: 'Login',
  });

exports.account = (req, res) =>
  res.status(200).render('account', {
    title: 'Your account',
  });

exports.updateAccount = catchAsync(async (req, res, next) => {
  // @ts-ignore
  const updatedUser = await User.findByIdAndUpdate(
    req.user.id,
    {
      name: req.body.name,
      email: req.body.email,
    },
    {
      new: true,
      runValidators: true,
    }
  );

  res.status(200).render('account', {
    title: 'Your account',
    user: updatedUser,
  });
});
