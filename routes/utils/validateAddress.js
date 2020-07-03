const axios = require('axios');

const keys = require('../../config/keys');

module.exports = async (address) => {
  // Validate address with Location IQ
  const locRes = await axios.get('https://us1.locationiq.com/v1/search.php', {
    params: {
      q: address,
      format: 'json',
      addressdetails: 1,
      limit: 1,
      key: keys.locationIQAPIKey
    }
  });

  const locData = locRes.data[0];

  // Make sure place is residential
  if (locData.class !== 'place' || locData.type !== 'house') {
    throw Error('Not a valid residential address');
  }

  return locData;
};
