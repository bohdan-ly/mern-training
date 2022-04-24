const Tour = require('../models/tourModel');
const APIFeatures = require('../utils/apiFeatures');
const catchAsync = require('../utils/catchAsync');
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

exports.aliasTopTours = (req, res, next) => {
  req.query.sort = 'price,-ratingsAverage';
  req.query.limit = 5;
  req.query.fields = 'name,price,ratingsAverage,summary';
  next();
};

exports.getAllTours = catchAsync(async (req, res, next) => {
  // try {

  // BUILD QUERY

  // SIMPLE FILTERING

  // SORTING

  // FIELDS limiting

  // PAGINATION

  // EXECUTE QUERY
  const features = new APIFeatures(Tour.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .pagination();

  const tours = await features.query;

  // const query = Tour.find()
  //   .where('duration')
  //   .equals(5)
  //   .where('difficulty')
  //   .equals('easy');

  // SEND RESPONSE
  res.status(200).json({
    status: 'success',
    results: tours.length,
    // requestTime: req.requestTime,
    data: { tours },
  });

  // } catch (err) {
  //   res.status(404).json({
  //     status: 'fail',
  //     data: err,
  //   });
  // }
});

exports.createTour = async (req, res) => {
  try {
    // const newId = tours[tours.length - 1].id + 1;

    // const newTour = Object.assign({ id: newId }, req.body);

    // tours.push(newTour);

    // fs.writeFile(
    //   `${__dirname}/dev-data/data/tours-simple.json`,
    //   JSON.stringify(tours),
    //   (err) => {
    //     res.status(201).json({ status: 'success', data: { tour: newTour } });
    //   }
    // );

    // const tour = new Tour({});
    // tour.save();

    const newTour = await Tour.create(req.body);

    res.status(201).json({ status: 'success', data: { tour: newTour } });
  } catch (err) {
    res
      .status(400)
      .json({ status: 'fail', data: err.message || err._errmessage });
  }
};

exports.getTour = async (req, res) => {
  try {
    // console.log(req.params);
    // const { id } = req.params || {};
    // const tour = tours.find((t) => t.id === +id);

    const tour = await Tour.findById(req.params.id);

    res.status(200).json({
      status: 'success',
      data: { tour },
    });
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      data: err,
    });
  }
};

exports.updateTour = async (req, res) => {
  try {
    // console.log(req.params);
    // const { id } = req?.params || {};
    // const tour = tours.find((t) => id && t.id === +id);

    const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({ status: 'success', data: { tour } });
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      data: err,
    });
  }
};

exports.deleteTour = async (req, res) => {
  try {
    // console.log(req.params);
    // const { id } = req?.params || {};
    // const tour = tours.find((t) => id && t.id === +id);

    await Tour.findByIdAndDelete(req.params.id);

    // In RESTful it's okay to don't return anything when we delete something

    res.status(204).json({ status: 'success', data: null });
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      data: err,
    });
  }
};

exports.getTourStats = async (req, res) => {
  try {
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
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      data: err,
    });
  }
};

exports.getMonthlyPlan = async (req, res) => {
  try {
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
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      data: err,
    });
  }
};
