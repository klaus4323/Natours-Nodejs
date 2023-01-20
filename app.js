////////////LOGGINF USERS WITH OUR API PART 1//////////////////////////////////

const path = require('path');
const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');

const cookieParser = require(`cookie-parser`);

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');
const viewRouter = require('./routes/viewRoutes');

const app = express();

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

app.use(express.static(path.join(__dirname, 'public')));

const defaultSrcUrls = ['https://js.stripe.com/'];
const scriptSrcUrls = [
  'https://unpkg.com/',
  'https://tile.openstreetmap.org',
  'https://cdnjs.cloudflare.com/ajax/libs/axios/1.2.2/axios.min.js',
  'https://js.stripe.com/v3/',
  'https://unpkg.com/leaflet@1.9.3/dist/leaflet.js',
  'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
];
const connectSrcUrls = [
  'https://js.stripe.com',
  'https://unpkg.com',
  'https://tile.openstreetmap.org',
  'https://cdnjs.cloudflare.com',
  'http://localhost:3000/api/v1/users/login',
  'http://localhost/api/v1/bookings/checkout-session/',
];
const fontSrcUrls = [
  'https:',
  'data:',
  'fonts.googleapis.com',
  'fonts.gstatic.com',
  'https://fonts.gstatic.com',
];
const styleSrcUrls = [
  'https://unpkg.com/',
  'https://tile.openstreetmap.org',
  'https://fonts.googleapis.com/',
  'https:',
];

app.use(helmet());

app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'", ...defaultSrcUrls],
      scriptSrc: ["'self'", ...scriptSrcUrls],
      connectSrc: ["'self'", ...connectSrcUrls],
      fontSrc: ["'self'", ...fontSrcUrls],
      styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
      imgSrc: ["'self'", 'blob:', 'data:', 'https:'],
      workerSrc: ["'self'", 'blob:'],
      baseUri: ["'self'"],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: [],
    },
  })
);

// app.use(
//   helmet.contentSecurityPolicy({
//     directives: {
//       workerSrc: ["'self'", 'blob:'],
//       imgSrc: ["'self'", 'blob:', 'data:', 'https:', 'img-src:'],
//       defaultSrc: ["'self'"],
//       baseUri: ["'self'"],
//       fontSrc: ["'self'", 'https:', 'data:'],
//       scriptSrc: [
//         "'self'",
//         'https://cdnjs.cloudflare.com/ajax/libs/axios/1.2.2/axios.min.js',
//         'https://unpkg.com/leaflet@1.9.3/dist/leaflet.js',
//       ],
//       objectSrc: ["'none'"],
//       styleSrc: ["'self'", 'https:', 'unsafe-inline'],
//       upgradeInsecureRequests: [],
//     },
//   })
// );

if (process.env.NODE_ENV === 'development') {
  app.use(morgan(`dev`));
}

const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this IP. Please try again in an hour!',
});
app.use('/api', limiter);

app.use(express.json({ limit: '10kb' }));
app.use(cookieParser());

app.use(mongoSanitize());

app.use(xss());

app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingsQuantity',
      'ratingsAverage',
      'maxGroupSize',
      'difficulty',
      'price',
    ],
  })
);

app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  console.log(req.cookies);
  next();
});

app.use('/', viewRouter);
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);

app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
