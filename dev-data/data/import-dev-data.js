const mongoose = require('mongoose');
const dotenv = require('dotenv');
const fs = require('fs');
const Tour = require('./../../models/tourModel');
const User = require('./../../models/userModel');
const Review = require('./../../models/reviewModel');

dotenv.config({
  path: './config.env',
});

const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD,
);

const DB_LOCAL = process.env.DATABASE_LOCAL;

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
  })
  .then((con) => {
    console.log('The bluetooth device connected succesfully');
  });

//   Read Data
const tours = JSON.parse(fs.readFileSync(`${__dirname}/tours.json`), 'utf-8');
const users = JSON.parse(fs.readFileSync(`${__dirname}/users.json`), 'utf-8');
const reviews = JSON.parse(
  fs.readFileSync(`${__dirname}/reviews.json`),
  'utf-8',
);
async function importData() {
  try {
    await Tour.create(tours);
    await User.create(users, { validateBeforeSave: false });
    await Review.create(reviews);
    console.log('Succesfully inserted data');
  } catch (err) {
    console.log(err.message);
  }
  process.exit();
}
async function deleteData() {
  try {
    await Tour.deleteMany();
    await User.deleteMany();
    await Review.deleteMany();
    console.log('Succesfully deleted data');
  } catch (err) {
    console.log(err.message);
  }
  process.exit();
}
if (process.argv[2] === '--import') {
  importData();
} else if (process.argv[2] === '--delete') {
  deleteData();
}
// tours.forEach(async (tour) => {
//
// });
// tours.forEach((tour) => {
//   console.log(tour);
// });
