const axios = require('axios');

const keys = require('../../config/keys');

const City = require('../../models/City');

module.exports = async (city, state, region, country) => {
  // Get city coordinates
  const cityRes = await axios.get('https://us1.locationiq.com/v1/search.php', {
    params: {
      city,
      state: state || '',
      region: region || '',
      country: country || '',
      format: 'json',
      addressdetails: 1,
      limit: 1,
      key: keys.locationIQAPIKey
    }
  });

  const { lat, lon } = cityRes.data[0];

  let newCity = new City({
    name: city,
    state: state || '',
    region: region || '',
    country,
    latitude: lat,
    longitude: lon
  });

  newCity = await newCity.save();
  return newCity;
};
