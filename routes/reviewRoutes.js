const express = require('express');
const controllers = require('../controllers/reviewController');
const authController = require('../controllers/authController');

const router = express.Router({ mergeParams: true });

router.use(authController.protect);

router
  .route('/')
  .post(
    authController.restrictTo('user'),
    controllers.setTourUserIds,
    controllers.createReview,
  )
  .get(controllers.getAllReviews);

router
  .route('/:id')
  .get(controllers.getReview)
  .patch(authController.restrictTo('user', 'admin'), controllers.updateReview)
  .delete(authController.restrictTo('user', 'admin'), controllers.deleteReview);
module.exports = router;
