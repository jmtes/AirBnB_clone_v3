const mongoose = require('mongoose');

const ReservationSchema = mongoose.Schema({
  userID: {
    type: String,
    required: true
  },
  placeID: {
    type: String,
    required: true
  },
  ownerID: {
    type: String,
    required: true
  },
  startDate: {
    type: Date,
    required: true
  },
  nights: {
    type: Number,
    required: true,
    validate: {
      validator: Number.isInteger
    }
  },
  confirmed: {
    type: Boolean,
    default: false
  }
});

module.exports = mongoose.model('reservation', ReservationSchema);
