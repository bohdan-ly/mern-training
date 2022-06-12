const express = require('express');
const { isLoggedIn, verify } = require('../controllers/authController');
const {
  overview,
  tour,
  login,
  account,
  updateAccount,
} = require('../controllers/viewController');

const router = express.Router();

router.get('/', isLoggedIn, overview);
router.get('/tours/:slug', isLoggedIn, tour);
router.get('/login', isLoggedIn, login);
router.get('/me', verify, account);

router.post('/submit-user-form', verify, updateAccount);

module.exports = router;
