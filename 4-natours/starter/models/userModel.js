const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const { isEmail } = require('validator');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    validate: [isEmail, 'Provide valid email address'],
  },
  photo: String,
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [8, 'Password must be at least 6 characters'],
  },
  passwordConfirm: {
    type: String,
    required: [true, 'Password confirmation is required'],
    validate: {
      validator: function (pass) {
        // this. works only when we create NEW instance
        return pass === this.password;
      },
      message: 'Passwords must be the same',
    },
  },
});

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  this.password = await bcrypt.hash(this.password, 12);
  this.passwordConfirm = undefined;
  next();
});

const User = mongoose.model('User', userSchema);

module.exports = User;
