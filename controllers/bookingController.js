const stripe = require(`stripe`)(process.env.STRIP_SECRET_KEY);
const Tour = require(`./../models/tourModel`);
const Booking = require(`./../models/booingModel`);
const catchAsync = require(`../utils/catchAsync`);
const AppError = require(`../utils/AppError`);
const factory = require('./handleFactory');
const { default: axios } = require('axios');

exports.getCheckoutSessionChapa = catchAsync(async (req, res, next) => {
  const tour = await Tour.findById(req.params.tourId);
  console.log(req.user);
  const options = {
    method: 'POST',
    url: 'https://api.chapa.co/v1/transaction/initialize',
    headers: {
      Authorization: `Bearer ${process.env.CHAPA_SECRET_KEY}`,
      'Content-Type': 'application/json',
    },
    data: {
      amount: `${tour.price}`,
      currency: 'ETB',
      email: req.user.email,
      first_name: req.user.name.split(' ')[0],
      last_name: req.user.name.split(' ')[1],
      phone_number: '0904927815',
      tx_ref: `tx-${Date.now()}`,
      callback_url: `https://natours-sbd8.onrender.com`,
      return_url: `https://natours-sbd8.onrender.com`,
      'customization[title]': 'Natours',
      'customization[description]': tour.summary,
    },
  };
  try {
    const session = await axios(options);
    // console.log(session);
    res.status(200).json({
      status: 'success',
      session: session.data.data,
    });
  } catch (err) {
    console.error(err);
  }
});

exports.getCheckoutSession = catchAsync(async (req, res, next) => {
  // Get the currently booked tour
  const tour = await Tour.findById(req.params.tourId);

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    success_url: `${req.protocol}://${req.get('host')}/?tour=${req.params.tourId}&user=${req.user.id}&price=${tour.price}`,
    cancel_url: `${req.protocol}://${req.get('host')}/tour/${tour.slug}`,
    customer_email: req.user.email,
    mode: 'payment',
    client_reference_id: req.params.tourId,
    line_items: [
      {
        price_data: {
          currency: 'usd',
          product_data: {
            name: `${tour.name} Tour`,
            description: tour.summary,
            images: ['https://natours.dev/img/tours/tour-1-cover.jpg'],
          },
          unit_amount: tour.price * 100,
        },
        quantity: 1,
      },
    ],
  });

  res.status(200).json({
    status: 'success',
    session,
  });
});

exports.createBookingCheckout = catchAsync(async (req, res, next) => {
  const { tour, user, price } = req.query;

  if (!tour && !user && !price) return next();
  await Booking.create({ tour, user, price });
  res.redirect(req.originalUrl.split('?')[0]);
});

exports.getAllBookings = factory.getAll(Booking);
exports.getBooking = factory.getOne(Booking);
exports.createBooking = factory.createOne(Booking);
exports.updateBooking = factory.updateOne(Booking);
exports.deleteBooking = factory.deleteOne(Booking);
