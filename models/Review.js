const mongoose = require('mongoose');

const ReviewSchema = mongoose.Schema({
  userName: {
    type: String,
    default: 'Anonymous User'
  },
  userID: {
    type: String,
    required: true
  },
  placeID: {
    type: String,
    required: true
  },
  stars: {
    type: Number,
    required: true,
    validate: {
      validator: (val) => Number.isInteger(val) && val >= 0 && val <= 5
    }
  },
  title: {
    type: String,
    required: true,
    maxlength: 32
  },
  body: {
    type: String,
    required: true,
    maxlength: 1000
  },
  date: {
    type: Date,
    default: new Date()
  }
});

module.exports = mongoose.model('review', ReviewSchema);
