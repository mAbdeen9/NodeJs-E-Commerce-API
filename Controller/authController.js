const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const { Users } = require('../Models/User');
const sendEmail = require('../utils/email');
const crypto = require('crypto');
const { log } = require('console');

exports.protect = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization) {
      token = req.headers.authorization;
    }
    if (!token) {
      return res.status(401).json({
        status: 'failed',
        message: 'you are not connected!',
      });
    }

    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
    //  Check if user still exists

    const currentUser = await Users.findById(decoded.payload.id);
    if (!currentUser) {
      return res.status(401).json({
        status: 'failed',
        message: 'you are not connected!',
      });
    }
    req.user = currentUser;
    next();
  } catch (err) {
    console.log(err);
  }
};

//

exports.checkValidToken = async (req, res, next) => {
  try {
    let token;
    if (req.headers.authorization) {
      token = req.headers.authorization;
    }
    if (!token) {
      return res.status(401).json({
        status: 'failed',
        message: 'you are not connected!',
      });
    }

    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
    if (!decoded) {
      return res.status(401).json({
        status: 'failed',
        message: 'you are not connected!',
      });
    }

    res.status(200).json({
      status: 'Success',
    });
  } catch (err) {
    console.log(err);
  }
};

exports.forgotPassword = async (req, res, next) => {
  try {
    // 1) Get user based on POSTed email

    console.log(req.body.email);
    const user = await Users.findOne({ email: req.body.email });
    if (!user) {
      return res.status(404).json({
        status: 'failed',
        message: 'There is no user with this email address.',
      });
    }

    // 2) Generate the random reset token
    const resetToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false });

    // 3) Send it to user's email
    try {
      await sendEmail({
        email: req.body.email,
        message: `Hi 👋🏻 , You recently requested to reset the password for your shopzon account. copy the token below to proceed. If you did not request a password reset, please ignore this email ,  ${resetToken}`,
        subject: 'Your password reset token valid for 10 minutes',
      });
      res.status(200).json({
        status: 'success',
        message: 'Token sent to email!',
      });
    } catch (err) {
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      await user.save({ validateBeforeSave: false });

      return res.status(500).json({
        status: 'failed',
        message: 'There was an error sending the email. Try again later!',
      });
    }
  } catch (err) {
    return res.status(404).json({
      status: 'failed',
      message: 'something went wrong!',
    });
  }
};

exports.resetPassword = async (req, res, next) => {
  try {
    // 1) Get user based on the token

    const hashedToken = crypto
      .createHash('sha256')
      .update(req.body.otp)
      .digest('hex');

    console.log(hashedToken);

    const user = await Users.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() },
    });
    console.log(user);
    // 2) If token has not expired, and there is user, set the new password
    if (!user) {
      return res.status(400).json({
        status: 'failed',
        message: 'Token is invalid or has expired',
      });
    }

    user.password = req.body.password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    return res.status(200).json({
      status: 'success',
      message: 'you changed your password',
    });
  } catch (err) {
    return res.status(404).json({
      status: 'failed',
      message: 'something went wrong!',
    });
  }
};
