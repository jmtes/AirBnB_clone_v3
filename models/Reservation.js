import mongoose from 'mongoose';

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
    type: Date,
    required: true
  },
  checkout: {
    type: Date,
    required: true,
    expires: 7200
  }
});

export default mongoose.model('reservation', ReservationSchema);
