const express = require('express');
const { isLoggedIn } = require('../controllers/authController');
const { overview, tour, login } = require('../controllers/viewController');

const router = express.Router();

router.use(isLoggedIn);

router.get('/', overview);
router.get('/tours/:slug', tour);
router.get('/login', login);

module.exports = router;
