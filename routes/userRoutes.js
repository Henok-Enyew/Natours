const express = require('express');
const controllers = require('../controllers/userControllers');
const authController = require('./../controllers/authController');

const router = express.Router();

router.route('/signup').post(authController.signup);
router.route('/login').post(authController.login);

router.route('/forgotPassword').post(authController.forgotPassword);
router.route('/resetPassword/:token').patch(authController.resetPassword);

router
  .route('/updateMyPassword')
  .patch(authController.protect, authController.updatePassword);
router.route('/updateMe').patch(authController.protect, controllers.updateMe);

router.route('/deleteMe').delete(authController.protect, controllers.deleteMe);

router.route('/').get(controllers.getAllUsers).post(controllers.createUser);

router
  .route('/:id')
  .get(controllers.getUser)
  .patch(controllers.updateUser)
  .delete(controllers.deleteUser);

module.exports = router;
