const express = require('express');
const {
  getAllBookings,
  createBooking,
  getBooking,
  updateBooking,
  deleteBooking,
  setUserBookingIds,
  getCheckoutSession,
} = require('../controllers/bookingController');
const { verify, restrictTo } = require('../controllers/authController');

const router = express.Router();

router.use(verify);

router.route('/checkout-session/:tourId').get(getCheckoutSession);

router.use(restrictTo(['admin', 'lead-guide']));

router.route('/').get(getAllBookings).post(setUserBookingIds, createBooking);

router.route('/:id').get(getBooking).patch(updateBooking).delete(deleteBooking);

module.exports = router;
