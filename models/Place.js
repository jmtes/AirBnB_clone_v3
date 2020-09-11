const mongoose = require('mongoose');

const PlaceSchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
    maxlength: 32
  },
  desc: {
    type: String,
    required: true,
    maxlength: 1000
  },
  ownerID: {
    type: String,
    required: true
  },
  cityID: {
    type: String,
    required: true
  },
  address: {
    type: String,
    required: true
  },
  latitude: {
    type: String,
    required: true
  },
  longitude: {
    type: String,
    required: true
  },
  beds: {
    type: Number,
    required: true,
    validate: {
      validator: Number.isInteger
    }
  },
  baths: {
    type: Number,
    required: true,
    validate: {
      validator: Number.isInteger
    }
  },
  maxGuests: {
    type: Number,
    validate: {
      validator: Number.isInteger
    }
  },
  price: {
    type: Number,
    required: true,
    validate: {
      validator: Number.isInteger
    }
  },
  amenities: {
    type: Array,
    default: []
  },
  photos: {
    type: Array,
    default: []
  },
  reservations: {
    type: Array,
    default: []
  },
  reviews: {
    type: Array,
    default: []
  }
});

module.exports = mongoose.model('place', PlaceSchema);
