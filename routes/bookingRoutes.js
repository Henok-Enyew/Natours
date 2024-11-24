const express = require('express');
const controllers = require('../controllers/bookingController');
const authController = require('../controllers/authController');

const router = express.Router();

router.use(authController.protect);
router.get('/checkout-session/:tourId', controllers.getCheckoutSession);

router
  .post('/', controllers.createBooking)
  .get('/', authController.restrictTo('admin'), controllers.getAllBookings);

router.use(authController.restrictTo('admin', 'lead-guide'));

router
  .get('/:id', controllers.getBooking)
  .patch('/:id', controllers.updateBooking)
  .delete('/:id', controllers.deleteBooking);

module.exports = router;
