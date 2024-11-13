const express = require('express');
const controllers = require('../controllers/reviewController');
const authController = require('../controllers/authController');

const router = express.Router();

router
  .route('/')
  .post(
    authController.protect,
    authController.restrictTo('user'),
    controllers.createReview,
  )
  .get(controllers.getAllReviews);

router
  .route('/:id')
  .get(controllers.getReview)
  .patch(controllers.updateReview)
  .delete(controllers.deleteReview);
module.exports = router;
