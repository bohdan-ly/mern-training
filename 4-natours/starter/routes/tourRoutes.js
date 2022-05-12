const express = require('express');
const {
  getAllTours,
  createTour,
  getTour,
  updateTour,
  deleteTour,
  aliasTopTours,
  getTourStats,
  getMonthlyPlan,
  // checkID,
  // validateNewTour,
} = require('../controllers/tourController');
const { verify, restrictTo } = require('../controllers/authController');

const router = express.Router();

// router.param('id', checkID);

router.route('/top-5-cheap').get(aliasTopTours, getAllTours);

router.route('/tour-stats').get(getTourStats);
router.route('/monthly-plan/:year').get(getMonthlyPlan);

router.route('/').get(verify, getAllTours).post(
  // validateNewTour,
  createTour
);

router
  .route('/:id')
  .get(getTour)
  .patch(updateTour)
  .delete(verify, restrictTo(['admin', 'lead-guide']), deleteTour);

module.exports = router;
