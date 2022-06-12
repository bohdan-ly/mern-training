const multer = require('multer');
const sharp = require('sharp');
const Tour = require('../models/tourModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const factory = require('./handlerFactory');

const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new AppError('Invalid file type.', 400), false);
  }
};

const upload = multer({ storage: multerStorage, fileFilter: multerFilter });

exports.uploadTourImages = upload.fields([
  { name: 'imageCover', maxCount: 1 },
  { name: 'images', maxCount: 3 },
]);

// upload.single('imageCover') => req.file
// upload.array('images', 5) => req.files

exports.resizeTourImages = catchAsync(async (req, res, next) => {
  if (!req.files.imageCover || !req.files.images) return next();

  // 1) Cover image
  req.body.imageCover = `tour-${req.params.id}-${Date.now()}-cover.jpg`;

  await sharp(req.files.imageCover[0].buffer)
    .resize(2000, 1333)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`public/img/tours/${req.body.imageCover}`);

  // Images

  req.body.images = [];

  await Promise.all(
    req.files.images.map(async (file, idx) => {
      const fileName = `tour-${req.params.id}-${Date.now()}-${idx + 1}.jpg`;

      await sharp(file.buffer)
        .resize(2000, 1333)
        .toFormat('jpeg')
        .jpeg({ quality: 90 })
        .toFile(`public/img/tours/${fileName}`);

      req.body.images.push(fileName);
    })
  );

  next();
});

exports.aliasTopTours = (req, res, next) => {
  req.query.sort = 'price,-ratingsAverage';
  req.query.limit = 5;
  req.query.fields = 'name,price,ratingsAverage,summary';
  next();
};

exports.getAllTours = factory.getAll(Tour);
exports.getTour = factory.getOne(Tour, { path: 'reviews' });
exports.createTour = factory.createOne(Tour);
exports.updateTour = factory.updateOne(Tour);
exports.deleteTour = factory.deleteOne(Tour);

exports.getWithinTours = catchAsync(async (req, res, next) => {
  const { distance, latlng, unit } = req.params;

  if (!distance || !latlng) return next(new AppError('Invalid params.', 400));

  const [lat, lng] = latlng.split(',');

  if (!lat || !lng)
    return next(
      new AppError(
        'Please provide latitude and longitude in the format lat,lng.',
        400
      )
    );

  const radius = unit === 'mi' ? distance / 3963.2 : distance / 6378.1;

  const tours = await Tour.find({
    startLocation: { $geoWithin: { $centerSphere: [[lng, lat], radius] } },
  });

  res
    .status(200)
    .json({ status: 'success', results: tours.length, data: { data: tours } });
});

exports.distance = catchAsync(async (req, res, next) => {
  const { latlng, unit } = req.params;

  if (!latlng) return next(new AppError('Invalid params.', 400));

  const [lat, lng] = latlng.split(',');

  if (!lat || !lng)
    return next(
      new AppError(
        'Please provide latitude and longitude in the format lat,lng.',
        400
      )
    );

  const distanceMultiplier = unit === 'mi' ? 0.000621371 : 0.001;

  const distance = await Tour.aggregate([
    {
      $geoNear: {
        near: {
          type: 'Point',
          coordinates: [+lng, +lat],
        },
        distanceField: 'distance',
        distanceMultiplier,
      },
    },
    {
      $project: {
        distance: 1,
        name: 1,
      },
    },
  ]);

  res.status(200).json({ status: 'success', data: { data: distance } });
});

exports.getTourStats = catchAsync(async (req, res, next) => {
  // try {
  const groups = await Tour.aggregate([
    {
      $match: { ratingsAverage: { $gte: 4.5 } },
    },
    {
      $group: {
        // _id: null,
        _id: { $toUpper: '$difficulty' },
        toursCount: { $sum: 1 },
        ratingsCount: { $sum: '$ratingsQuantity' },
        avgRating: { $avg: '$ratingsAverage' },
        avgPrice: { $avg: '$price' },
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' },
      },
    },
    {
      $sort: { avgPrice: -1 },
    },
  ]);

  res.status(200).json({ status: 'success', data: { groups } });
  // } catch (err) {
  //   res.status(404).json({
  //     status: 'fail',
  //     data: err,
  //   });
  // }
});

exports.getMonthlyPlan = catchAsync(async (req, res, next) => {
  // try {
  const year = +req.params.year; // 2021

  const plan = await Tour.aggregate([
    {
      $unwind: '$startDates',
    },
    {
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lt: new Date(`${year}-12-31`),
        },
      },
    },
    {
      $group: {
        _id: { $month: '$startDates' },
        toursStartsCount: { $sum: 1 },
        tours: { $push: '$name' },
      },
    },
    {
      $addFields: { month: '$_id' },
    },
    {
      $project: { _id: 0 },
    },
    { $limit: 12 },
  ]);

  res.status(200).json({ status: 'success', data: { plan } });
  // } catch (err) {
  //   res.status(404).json({
  //     status: 'fail',
  //     data: err,
  //   });
  // }
});

// const fs = require('fs');

// const tours = JSON.parse(
//   fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`)
// );

// exports.checkID = (req, res, next, val) => {
//   const tour = tours.find((t) => t.id === +val);

//   console.log(tour);

//   if (!tour)
//     return res
//       .status(404)
//       .json({ status: 'fail', message: `Tour with this id doesn't exist` });

//   next();
// };

// exports.validateNewTour = (req, res, next) => {
//   const { name, price } = req.body || {};

//   if (!name || !price)
//     return res.status(400).json({ status: 'fail', message: `Missing params` });

//   next();
// };

// exports.getAllTours = catchAsync(async (req, res, next) => {
//   // try {

//   // BUILD QUERY

//   // SIMPLE FILTERING

//   // SORTING

//   // FIELDS limiting

//   // PAGINATION

//   // EXECUTE QUERY
//   const features = new APIFeatures(Tour.find(), req.query)
//     .filter()
//     .sort()
//     .limitFields()
//     .pagination();

//   const tours = await features.query;

//   // const query = Tour.find()
//   //   .where('duration')
//   //   .equals(5)
//   //   .where('difficulty')
//   //   .equals('easy');

//   // SEND RESPONSE
//   res.status(200).json({
//     status: 'success',
//     results: tours.length,
//     // requestTime: req.requestTime,
//     data: { tours },
//   });

//   // } catch (err) {
//   //   res.status(404).json({
//   //     status: 'fail',
//   //     data: err,
//   //   });
//   // }
// });

// exports.getTour = catchAsync(async (req, res, next) => {
//   // try {
//   // console.log(req.params);
//   // const { id } = req.params || {};
//   // const tour = tours.find((t) => t.id === +id);

//   const tour = await Tour.findById(req.params.id).populate('reviews');

//   if (!tour) {
//     return next(new AppError('Not tour found with that id', 404));
//   }

//   res.status(200).json({
//     status: 'success',
//     data: { tour },
//   });

//   // } catch (err) {
//   //   res.status(404).json({
//   //     status: 'fail',
//   //     data: err,
//   //   });
//   // }
// });

// exports.createTour = catchAsync(async (req, res, next) => {
//   // try {
//   // const newId = tours[tours.length - 1].id + 1;

//   // const newTour = Object.assign({ id: newId }, req.body);

//   // tours.push(newTour);

//   // fs.writeFile(
//   //   `${__dirname}/dev-data/data/tours-simple.json`,
//   //   JSON.stringify(tours),
//   //   (err) => {
//   //     res.status(201).json({ status: 'success', data: { tour: newTour } });
//   //   }
//   // );

//   // const tour = new Tour({});
//   // tour.save();

//   const newTour = await Tour.create(req.body);

//   res.status(201).json({ status: 'success', data: { tour: newTour } });
//   // } catch (err) {
//   //   res
//   //     .status(400)
//   //     .json({ status: 'fail', data: err.message || err._errmessage });
//   // }
// });

// exports.updateTour = catchAsync(async (req, res, next) => {
//   // try {
//   // console.log(req.params);
//   // const { id } = req?.params || {};
//   // const tour = tours.find((t) => id && t.id === +id);

//   const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
//     new: true,
//     runValidators: true,
//   });

//   if (!tour) {
//     return next(new AppError('Not tour found with that id', 404));
//   }

//   res.status(200).json({ status: 'success', data: { tour } });
//   // } catch (err) {
//   //   res.status(404).json({
//   //     status: 'fail',
//   //     data: err,
//   //   });
//   // }
// });

// exports.deleteTour = catchAsync(async (req, res, next) => {
//   // try {
//   // console.log(req.params);
//   // const { id } = req?.params || {};
//   // const tour = tours.find((t) => id && t.id === +id);

//   const tour = await Tour.findByIdAndDelete(req.params.id);

//   if (!tour) {
//     return next(new AppError('Not tour found with that id', 404));
//   }

//   // In RESTful it's okay to don't return anything when we delete something

//   res.status(204).json({ status: 'success', data: null });
//   // } catch (err) {
//   //   res.status(404).json({
//   //     status: 'fail',
//   //     data: err,
//   //   });
//   // }
// });
