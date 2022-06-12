const express = require('express');
const { isLoggedIn, verify } = require('../controllers/authController');
const { createBookingCheckout } = require('../controllers/bookingController');
const {
  overview,
  tour,
  login,
  account,
  updateAccount,
  getMyTours,
} = require('../controllers/viewController');

const router = express.Router();

router.get('/', createBookingCheckout, isLoggedIn, overview);
router.get('/tours/:slug', isLoggedIn, tour);
router.get('/login', isLoggedIn, login);
router.get('/me', verify, account);
router.get('/my-bookings', verify, getMyTours);

router.post('/submit-user-form', verify, updateAccount);

module.exports = router;
