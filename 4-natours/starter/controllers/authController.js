const crypto = require('crypto');
const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const Email = require('../utils/email');

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

const createSendToken = ({ id, user = null, statusCode, res }) => {
  const token = signToken(id);

  const resBody = { status: 'success', token };

  if (user) {
    user.password = undefined;
    user.active = undefined;
    resBody.data = { user };
  }

  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN + 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };

  if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;

  res.cookie('jwt', token, cookieOptions);
  res.status(statusCode).json(resBody);
};

// @ts-ignore
exports.signup = catchAsync(async (req, res, next) => {
  const { name, email, password, passwordConfirm, passwordChangedAt, role } =
    req.body || {};

  const newUser = await User.create({
    name,
    email,
    role,
    password,
    passwordConfirm,
    passwordChangedAt,
  });

  const url = `${req.protocol}://${req.get('host')}/me`;

  await new Email(newUser, url).sendWelcome();

  createSendToken({ id: newUser._id, user: newUser, statusCode: 201, res });
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
  createSendToken({ id: user._id, statusCode: 200, res });
});

exports.logout = (req, res) => {
  res.cookie('jwt', 'loggedout', {
    expires: new Date(Date.now() + 1000 * 10),
    httpOnly: true,
  });

  res.status(200).json({ status: 'success' });
};

// @ts-ignore
exports.verify = catchAsync(async (req, res, next) => {
  // 1) Getting token and checking of it's therefore
  const { authorization } = req.headers || {};

  let token;
  if (authorization && authorization.startsWith('Bearer')) {
    token = authorization.split(' ')[1];
  } else if (req.cookies.jwt && req.cookies.jwt !== 'loggedout') {
    token = req.cookies.jwt;
  }

  // 2) Verification token

  if (!token)
    return next(
      new AppError('You are not logged in. Please login to get an access.', 401)
    );

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
  res.locals.user = curUser;

  next();
});

// @ts-ignore
exports.isLoggedIn = async (req, res, next) => {
  if (req.cookies.jwt) {
    try {
      const token = req.cookies.jwt;

      // 2) Verification token

      if (!token) return next();

      // 3) Check if user still exist

      // @ts-ignore
      const { id, iat } = await promisify(jwt.verify)(
        token,
        // @ts-ignore
        process.env.JWT_SECRET
      );

      const curUser = await User.findById(id);

      if (!curUser) return next();

      // 4) Check if user changes password after the token was isSupported

      if (curUser.changedPasswordAfter(iat)) return next();

      // There is a logged user
      res.locals.user = curUser;
      return next();
    } catch (err) {
      return next();
    }
  }
  next();
};

// @ts-ignore
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

  // 1) Get user based on POSTed email
  const user = await User.findOne({ email });

  if (!user) return next(new AppError('User not found', 404));

  // 2) Generate the random reset token
  const temporaryToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  // 3) Send it to user's email
  try {
    const resetURL = `${req.protocol}://${req.get(
      'host'
    )}/api/v1/users/resetPassword/${temporaryToken}`;

    await new Email(user, resetURL).sendPasswordReset();

    res.status(200).json({ status: 'success', message: 'Token sent to email' });
  } catch (e) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return next(
      new AppError(
        'There was an error sending the email. Please try again.',
        500
      )
    );
  }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  // 1) Get user by token
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gte: Date.now() },
  });

  // 2) If token has not expired and there is user, set new password
  if (!user) return next(new AppError('Token is invalid or has expired', 400));

  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  // 4) Log the user in, send JWT

  createSendToken({ id: user._id, statusCode: 200, res });
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  // 1) Get user from collection
  const { _id } = req.user || {};
  const { newPassword, newPasswordConfirm, curPassword } = req.body || {};

  const user = await User.findById(_id).select('+password');

  // 2) Check if POSTed user password is correct
  if (!(await user.checkPassword(curPassword, user.password)))
    return next(new AppError('Incorrect password', 401));

  // 3) If so update password
  user.password = newPassword;
  user.passwordConfirm = newPasswordConfirm;
  await user.save();
  // User.findByIdAndUpdate will NOT work as intended

  // 4) Log the user in, send JWT

  createSendToken({ id: user._id, statusCode: 200, res });
});
