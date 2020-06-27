const mongoose = require('mongoose');

const CitySchema = mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  country: {
    type: String,
    required: true
  },
  state: {
    type: String,
    default: null
  }
});

module.exports = mongoose.model('city', CitySchema);
