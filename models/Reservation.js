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
  endDate: {
    type: Date,
    required: true
  },
  confirmed: {
    type: Boolean,
    required: true
  }
});
