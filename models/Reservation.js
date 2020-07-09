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
  checkin: {
    type: String,
    required: true
  },
  checkout: {
    type: String,
    required: true
  },
  confirmed: {
    type: Boolean,
    default: false
  }
});

module.exports = mongoose.model('reservation', ReservationSchema);
