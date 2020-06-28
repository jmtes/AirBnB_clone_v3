const mongoose = require('mongoose');

const keys = require('./keys');

const connectDB = async () => {
  const db = keys.mongoURI;

  try {
    await mongoose.connect(db, {
      useNewUrlParser: true,
      useCreateIndex: true,
      useFindAndModify: false,
      useUnifiedTopology: true
    });

    console.log('Connected to MongoDB');
  } catch (err) {
    console.log(err.message);
    process.exit(1);
  }
};

module.exports = connectDB;
