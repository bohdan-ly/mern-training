// review, rating, createdAt, ref to tour, ref to user
const mongoose = require('mongoose');

const review = new mongoose.Schema(
  {
    review: {
      type: 'String',
      required: [true, 'Review is can not be empty.'],
    },
    rating: { type: Number, min: 0, max: 10 },
    createdAt: { type: Date, default: new Date(Date.now()) },
    tour: {
      type: mongoose.Schema.ObjectId,
      ref: 'Tour',
      required: [true, 'Review must belong to a tour.'],
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'Review must belong to a user.'],
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

review.pre(/^find/gi, function (next) {
  this.populate({
    path: 'user',
    select: 'name photo',
  });
  //   this.populate({
  //     path: 'tour',
  //     select: 'name',
  //   });
  next();
});

const Review = mongoose.model('Review', review);

module.exports = Review;
