const express = require('express');
const controllers = require('../controllers/userControllers');
const authController = require('./../controllers/authController');

const router = express.Router();

router.route('/signup').post(authController.signup);
router.route('/login').post(authController.login);
router.route('/logout').get(authController.logout);
router.route('/forgotPassword').post(authController.forgotPassword);
router.route('/resetPassword/:token').patch(authController.resetPassword);

//protectall routes after this
router.use(authController.protect);
router.route('/updateMyPassword').patch(authController.updatePassword);
router
  .route('/updateMe')
  .patch(
    controllers.uploadUserPhoto,
    controllers.resizeUserPhoto,
    controllers.updateMe,
  );
router.route('/deleteMe').delete(controllers.deleteMe);
router.get('/me', controllers.getMe, controllers.getUser);

router.use(authController.restrictTo('admin'));
router.route('/').get(controllers.getAllUsers).post(controllers.createUser);
router
  .route('/:id')
  .get(controllers.getUser)
  .patch(controllers.updateUser)
  .delete(controllers.deleteUser);

module.exports = router;
