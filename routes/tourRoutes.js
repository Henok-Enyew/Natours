const express = require('express');
const controllers = require('../controllers/tourControllers');
const authController = require('./../controllers/authController');

const router = express.Router();

// router.param('id', controllers.checkID);
router
  .route('/top-5-cheap')
  .get(controllers.aliasTopTours, controllers.getAllTours);

router.route('/tour-stats').get(controllers.getTourStats);
router.route('/monthly-plan/:year').get(controllers.getMonthlyPlan);

router
  .route('/')
  .get(authController.protect, controllers.getAllTours)
  .post(controllers.createTour);
router
  .route('/:id')
  .get(controllers.getTour)
  .patch(controllers.updateTour)
  .delete(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    controllers.deleteTour,
  );

module.exports = router;
