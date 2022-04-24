const mongoose = require('mongoose');
const dotenv = require('dotenv');
const fs = require('fs');
const Tour = require('../../models/tourModel');

dotenv.config({ path: './config.env' });

const db = process.env.DATABASE.replace('<password>', process.env.DB_PASSWORD);

mongoose.connect(db).then(() => {
  console.log('DB connection successful');
});

const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/tours-simple.json`, 'utf8')
);

const importData = async () => {
  try {
    await Tour.create(tours);
    console.log('Data successfully loaded');
  } catch (err) {
    console.log(err);
  }
  process.exit();
};

const deleteData = async () => {
  try {
    await Tour.deleteMany();
    console.log('Data successfully deleted');
  } catch (err) {
    console.log(err);
  }
  process.exit();
};

switch (process.argv[2]) {
  case '--import':
    importData();
    break;

  case '--delete':
    deleteData();
    break;
  default:
    process.exit();
}
