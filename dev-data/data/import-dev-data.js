const mongoose = require('mongoose');
const dotenv = require('dotenv');
const fs = require('fs');
const Tour = require('./../../models/tourModel');

dotenv.config({
  path: './config.env',
});

const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD,
);

const DB_LOCAL = process.env.DATABASE_LOCAL;

mongoose
  .connect(DB_LOCAL, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
  })
  .then((con) => {
    console.log('The bluetooth device connected succesfully');
  });

//   Read Data
const tours = JSON.parse(fs.readFileSync(`${__dirname}/tours.json`), 'utf-8');
async function importData() {
  try {
    await Tour.create(tours);
    console.log('Succesfully inserted data');
  } catch (err) {
    console.log(err.message);
  }
  process.exit();
}
async function deleteData() {
  try {
    await Tour.deleteMany();
    console.log('Succesfully deleted data');
  } catch (err) {
    console.log(err.message);
  }
  process.exit();
}
// console.log(process.argv);
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
