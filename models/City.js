const mongoose = require('mongoose');

const CitySchema = mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  state: {
    type: String
  },
  region: {
    type: String
  },
  country: {
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
  photo: {
    type: String,
    required: true
  }
});

module.exports = mongoose.model('city', CitySchema);
