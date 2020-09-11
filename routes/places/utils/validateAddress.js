const axios = require('axios');

const keys = require('../../../config/keys');

module.exports = async (address) => {
  // Make sure address starts with building number
  const buildingNumber = address.split(' ', 1)[0];
  if (Number.isNaN(parseInt(buildingNumber, 10)))
    throw Error('Not a valid street address');

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

  // Sometimes the LocationIQ response will not include a house number.
  // This sets the house number to the previously parsed building number.
  if (!locData.address.house_number)
    locData.address.house_number = buildingNumber;

  return locData;
};
