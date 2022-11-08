const express = require('express');
const morgan = require('morgan');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const loginRouter = require('./Routes/loginRouter');
const cartRouter = require('./Routes/cartRouter');
const cors = require('cors');
dotenv.config({ path: './config.env' });
const app = express();

// Middlewares
if (process.env.NODE_ENV === 'development') app.use(morgan('dev'));
app.use(cors()); // Implement CORS
app.use(express.json()); // Body Parser

// Middlewares Routes
app.use('/api/v1/login', loginRouter);
app.use('/api/v1/cart', cartRouter);

// Server and DataBase

const DB = process.env.DATABASE;
mongoose
  .connect(DB, {
    useNewUrlParser: true,
  })
  .then(() => console.log('DB connection Successful'))
  .catch((err) => console.log(err.message));

app.listen(process.env.PORT || 3000, () =>
  console.log(`Server is running on port ${process.env.PORT} 🚀`)
);
