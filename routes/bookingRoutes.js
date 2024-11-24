const express = require('express');
const controllers = require('../controllers/bookingController');
const authController = require('../controllers/authController');

const router = express.Router();

router.use(authController.protect);

router
  .get('/', authController.restrictTo('admin'), controllers.getAllBookings)
  .post('/', controllers.createBooking);

router.use(authController.restrictTo('admin', 'lead-guide'));

router
  .get('/:id', controllers.getBooking)
  .patch('/:id', controllers.updateBooking)
  .delete('/:id', controllers.deleteBooking);

router.get(
  '/checkout-session/:tourId',
  authController.protect,
  controllers.getCheckoutSession,
);

module.exports = router;
