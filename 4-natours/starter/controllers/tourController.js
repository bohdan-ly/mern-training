const fs = require('fs');

const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`)
);

exports.checkID = (req, res, next, val) => {
  const tour = tours.find((t) => t.id === +val);

  console.log(tour);

  if (!tour)
    return res
      .status(404)
      .json({ status: 'fail', message: `Tour with this id doesn't exist` });

  next();
};

exports.validateNewTour = (req, res, next) => {
  const { name, price } = req.body || {};

  if (!name || !price)
    return res.status(400).json({ status: 'fail', message: `Missing params` });

  next();
};

exports.getAllTours = (req, res) =>
  res.status(200).json({
    status: 'success',
    results: tours.length,
    requestTime: req.requestTime,
    data: { tours },
  });

exports.createTour = (req, res) => {
  const newId = tours[tours.length - 1].id + 1;

  const newTour = Object.assign({ id: newId }, req.body);

  tours.push(newTour);

  fs.writeFile(
    `${__dirname}/dev-data/data/tours-simple.json`,
    JSON.stringify(tours),
    (err) => {
      res.status(201).json({ status: 'success', data: { tour: newTour } });
    }
  );
};

exports.getTour = (req, res) => {
  // console.log(req.params);
  const { id } = req.params || {};
  const tour = tours.find((t) => t.id === +id);

  res.status(200).json({ status: 'success', data: { tour } });
};

exports.updateTour = (req, res) => {
  // console.log(req.params);
  const { id } = req?.params || {};
  const tour = tours.find((t) => id && t.id === +id);

  res
    .status(200)
    .json({ status: 'success', data: { tour: 'Updated tour here' } });
};

exports.deleteTour = (req, res) => {
  // console.log(req.params);
  const { id } = req?.params || {};
  const tour = tours.find((t) => id && t.id === +id);

  res.status(204).json({ status: 'success', data: null });
};
