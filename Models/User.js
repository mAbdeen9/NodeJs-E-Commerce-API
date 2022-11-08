const mongoose = require('mongoose');
const Joi = require('joi');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const { log } = require('console');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Must have a name'],
    minlength: 2,
  },
  email: {
    type: String,
    required: [true, 'Must have email'],
    unique: true,
    minlength: 4,
  },
  password: {
    type: String,
    required: [true, 'Must have password'],
    minlength: 8,
    maxlength: 40,
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user',
  },
  cart: { type: Object },
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
});

// hashing password before saveing to database
UserSchema.pre('save', async function (next) {
  // Only run this function if password was actually modified
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

UserSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

UserSchema.methods.createPasswordResetToken = function () {
  console.log(123);
  const resetToken = crypto.randomBytes(32).toString('hex');

  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  console.log({ resetToken }, this.passwordResetToken);

  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

const Users = mongoose.model('Users', UserSchema);

// Joi validtion
function validateRegister(body) {
  const registerRules = Joi.object({
    name: Joi.string().min(2).max(255).required(),
    email: Joi.string().min(4).max(255).required().email(),
    password: Joi.string().min(8).max(50).required(),
  });
  return registerRules.validate(body);
}

function validateLogin(body) {
  const loginRules = Joi.object({
    email: Joi.string().min(4).max(255).required().email(),
    password: Joi.string().required().min(8).max(50),
  });
  return loginRules.validate(body);
}

module.exports = { Users, validateRegister, validateLogin };
