import mongoose from 'mongoose';

import keys from './keys';

export default async () => {
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
