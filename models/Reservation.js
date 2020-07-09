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
  arrival: {
    type: Date,
    required: true
  },
  checkout: {
    type: Date,
    required: true
  },
  confirmed: {
    type: Boolean,
    default: false
  }
});

module.exports = mongoose.model('reservation', ReservationSchema);
