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
const reviewRouter = require('./reviewRoutes');
const { verify, restrictTo } = require('../controllers/authController');

const router = express.Router();

router.use('/:tourId/reviews', reviewRouter);
// router.param('id', checkID);
// router
//   .route('/:tourId/reviews')
//   .post(verify, restrictTo(['user']), createReview);

router.route('/top-5-cheap').get(aliasTopTours, getAllTours);

router.route('/tour-stats').get(getTourStats);
router
  .route('/monthly-plan/:year')
  .get(verify, restrictTo(['admin', 'lead-guide', 'guide']), getMonthlyPlan);

router
  .route('/')
  .get(getAllTours)
  .post(verify, restrictTo(['admin', 'lead-guide']), createTour);

router
  .route('/:id')
  .get(getTour)
  .patch(verify, restrictTo(['admin', 'lead-guide']), updateTour)
  .delete(verify, restrictTo(['admin', 'lead-guide']), deleteTour);

module.exports = router;
