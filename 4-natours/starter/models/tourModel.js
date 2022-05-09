const mongoose = require('mongoose');
const slugify = require('slugify');
const { isAlpha } = require('validator');

const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      unique: true,
      trim: true,
      minLength: [10, 'Tour name must be at least 10 characters'],
      maxLength: [40, 'Tour name must be at most 40 characters'],
      // validate: [isAlpha, 'Name should contain alpha characters'],
    },
    slug: String,
    duration: { type: Number, required: [true, 'Duration is required'] },
    maxGroupSize: { type: Number, required: [true, 'Duration is required'] },
    difficulty: {
      type: String,
      required: [true, 'Difficulty is required'],
      enum: {
        values: ['easy', 'medium', 'difficult'],
        message: 'Difficulty is either: easy, medium, difficult',
      },
    },
    ratingsAverage: {
      type: Number,
      default: 2.5,
      min: [1, 'Rating must be above 1.0'],
      max: [5, 'Rating must be below 5.0'],
    },
    ratingsQuantity: { type: Number, default: 0 },
    price: { type: Number, required: [true, 'Price is required'] },
    priceDiscount: {
      type: Number,
      validate: {
        validator: function (val) {
          // this. works only when we create NEW instance, so CREATE or SAVE
          return val < this.price;
        },
        message: 'Discount ({VALUE}) must be lower than price',
      },
    },
    summary: {
      type: String,
      trim: true,
      required: [true, 'Summary is required'],
    },
    description: { type: String, trim: true },
    imageCover: { type: String, required: [true, 'Image is required'] },
    images: [String],
    createdAt: { type: Date, default: Date.now(), select: false },
    startDates: [Date],
    secretTour: {
      type: Boolean,
      default: false,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// virtual params
tourSchema.virtual('durationWeeks').get(function () {
  return this.duration / 7;
});

// document middleware => runs before .save() and .create()

tourSchema.pre('save', function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

// tourSchema.pre('save', function (next) => {
//   console.log('Will save document');
//   next();
// });

// tourSchema.post('save', function (doc, next) => {
//   console.log(doc);
//   next();
// });

// QUERY MIDDLEWARE

// tourSchema.pre('find', function(next))
tourSchema.pre(/^find/, function (next) {
  this.find({ secretTour: { $ne: true } });
  this.start = Date.now();
  next();
});

tourSchema.post(/^find/, function (docs, next) {
  console.log(`Query took ${Date.now() - this.start} milliseconds`);
  next();
});

tourSchema.pre('aggregate', function (next) {
  this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });
  console.log(this.pipeline());
  next();
});

const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
