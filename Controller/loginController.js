const { Users, validateRegister, validateLogin } = require('../Models/User');
const jwt = require('jsonwebtoken');

const signToken = (payload) =>
  jwt.sign({ payload }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

exports.signUp = async (req, res) => {
  try {
    //- Joi Validation
    const { error } = validateRegister(req.body);
    if (error) {
      return res.status(400).json({
        status: 'failed',
        message: error.message,
      });
    }
    //- Check if user is already exist in DB
    const user = await Users.findOne({ email: req.body.email });
    if (user) {
      return res.status(400).json({
        status: 'failed',
        message: 'User is already exist!',
      });
    }
    //- Register New User To DB Encrypt Password will be handled by the moongose midleware
    //  in the user model
    const newUser = await Users.create(req.body);
    res.status(200).json({
      status: 'Success',
      message: `new account for ${newUser.name} created successfully`,
    });
  } catch (err) {
    return res.status(400).json({
      status: 'failed',
      message: err.message,
    });
  }
};

exports.signIn = async (req, res) => {
  try {
    //- Joi Validation
    console.log(req.body);
    const { error } = validateLogin(req.body);
    if (error) {
      return res.status(400).json({
        status: 'failed',
        message: error.message,
      });
    }

    const { email, password } = req.body;
    // 2) Check if user exists && password is correct
    const user = await Users.findOne({ email }).select('+password');
    if (!user || !(await user.correctPassword(password, user.password))) {
      return res.status(401).json({
        status: 'failed',
        message: 'email or password is not valid!',
      });
    }

    // 3) if everything ok, send token to client
    const token = signToken({
      name: user.name,
      id: user._id,
      role: user.role,
      cart: user.cart,
    });

    res.status(200).json({
      status: 'Success',
      data: {
        token,
      },
    });
  } catch (err) {
    return res.status(400).json({
      status: 'failed',
      message: err.message,
    });
  }
};
