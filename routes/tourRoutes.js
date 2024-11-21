const express = require('express');
const controllers = require('../controllers/tourControllers');
const authController = require('./../controllers/authController');
const reviewRouter = require('./reviewRoutes');
const router = express.Router();

router.use('/:tourId/reviews', reviewRouter);

router
  .route('/top-5-cheap')
  .get(controllers.aliasTopTours, controllers.getAllTours);

router.route('/tour-stats').get(controllers.getTourStats);
router
  .route('/monthly-plan/:year')
  .get(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide', 'guide'),
    controllers.getMonthlyPlan,
  );

router
  .route('/tours-within/:distance/center/:latlng/unit/:unit')
  .get(controllers.getToursWithin);
router.route('/distances/:latlng/unit/:unit').get(controllers.getDistances);

router
  .route('/')
  .get(controllers.getAllTours)
  .post(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    controllers.createTour,
  );
router
  .route('/:id')
  .get(controllers.getTour)
  .patch(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    controllers.uploadTourPhoto,
    controllers.resizeTourImages,
    controllers.updateTour,
  )
  .delete(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    controllers.deleteTour,
  );

module.exports = router;
