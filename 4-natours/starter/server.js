const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config({ path: './config.env' });

const db = process.env.DATABASE.replace('<password>', process.env.DB_PASSWORD);

mongoose.connect(db).then(() => {
  console.log('DB connection successful');
});

// const testTour = new Tour({
//   name: 'Test',
//   price: 25,
//   rating: 5,
// });

// testTour
//   .save()
//   .then((doc) => {
//     console.log(doc);
//   })
//   .catch((err) => console.log('!!!ERROR:', err));

const app = require('./app');

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`listening on port: ${port}`));
