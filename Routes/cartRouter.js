const express = require('express');
const router = express.Router();
const cartController = require('./../Controller/cartController');
const authController = require('./../Controller/authController');

// update cart
router
  .route('/update-cart')
  .post(authController.protect, cartController.updateCart);

//get cart
router.route('/check-cart').get(authController.protect, cartController.getCart);

module.exports = router;
