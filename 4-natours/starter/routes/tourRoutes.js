const express = require('express');
const router = express.Router();

const {
  getAllTours,
  createTour,
  getTour,
  updateTour,
  deleteTour,
  checkID,
  validateNewTour,
} = require('./../controllers/tourController');

router.param('id', checkID);

router.route('/').get(getAllTours).post(validateNewTour, createTour);

router.route('/:id').get(getTour).patch(updateTour).delete(deleteTour);

module.exports = router;
