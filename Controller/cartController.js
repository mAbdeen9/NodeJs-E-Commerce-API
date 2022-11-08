const { Users } = require('../Models/User');

exports.updateCart = async (req, res) => {
  try {
    const { updatedCart } = req.body;
    await Users.findByIdAndUpdate(req.user.id, {
      cart: updatedCart,
    });

    res.status(200).json({
      status: 'success',
    });
  } catch (err) {
    res.status(404).json({
      status: 'failed',
      message: err.message,
    });
  }
};

exports.getCart = async (req, res) => {
  try {
    const user = await Users.findById(req.user.id);
    res.status(200).json({
      status: 'success',
      data: user.cart,
    });
  } catch (err) {
    res.status(404).json({
      status: 'failed',
      message: err.message,
    });
  }
};
