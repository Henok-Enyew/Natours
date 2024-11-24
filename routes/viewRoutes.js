const express = require('express');
const viewControllers = require('../controllers/viewControllers');
const authControllers = require('../controllers/authController');
const bookingController = require('../controllers/bookingController');

const router = express.Router();

router.get(
  '/',
  bookingController.createBookingCheckout,
  authControllers.isLoggedIn,
  viewControllers.getOverview,
);
router.get('/tour/:slug', authControllers.isLoggedIn, viewControllers.getTour);
router.get('/login', authControllers.isLoggedIn, viewControllers.getLoginForm);
router.get('/signup', viewControllers.getSignUpForm);
router.get('/me', authControllers.protect, viewControllers.getAccount);
router.get('/my-tours', authControllers.protect, viewControllers.getMyTours);

module.exports = router;
