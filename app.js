const express = require('express');
const morgan = require('morgan');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const loginRouter = require('./Routes/loginRouter');
const cartRouter = require('./Routes/cartRouter');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const compression = require('compression');
const cors = require('cors');
dotenv.config({ path: './config.env' });

const app = express();

const limiter = rateLimit({
  max: 300,
  windowMs: 30 * 30 * 1000,
  message: 'Too many requests from this IP, please try again in an half-hour!',
});
app.enable('trust proxy');

// Middlewares
if (process.env.NODE_ENV === 'development') app.use(morgan('dev'));
app.use(cors()); // Implement CORS
app.use(express.json()); // Body Parser
app.use('/api', limiter); // Limit requests from same IP
app.use(helmet()); // Set security HTTP headers
app.use(mongoSanitize()); // Data sanitization against NoSQL query injection
app.use(xss()); // Data sanitization against XSS
app.use(compression()); //improve the performance

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
