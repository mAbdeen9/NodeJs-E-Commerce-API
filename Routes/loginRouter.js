const express = require('express');
const router = express.Router();
const loginController = require('./../Controller/loginController');
const authController = require('./../Controller/authController');

// sign in
router.route('/sign-in').post(loginController.signIn);
// sign up
router.route('/sign-up').post(loginController.signUp);
//check Valid Token
router.route('/checkValidToken').post(authController.checkValidToken);
//reset password
router.post('/forgotPassword', authController.forgotPassword);
router.patch('/resetPassword', authController.resetPassword);

module.exports = router;
