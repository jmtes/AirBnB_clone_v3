import axios from 'axios';

import keys from '../../config/keys';

import City from '../../models/City';

export default async (city, state, region, country) => {
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

  const photoRes = await axios.get('https://api.unsplash.com/search/photos', {
    params: {
      query: `${city} city`,
      orientation: 'landscape',
      page: 1,
      per_page: 1,
      color: 'blue'
    },
    headers: {
      Authorization: `Client-ID ${keys.unsplashAccessKey}`
    }
  });

  const { regular } = photoRes.data.results[0].urls;

  let newCity = new City({
    name: city,
    state: state || '',
    region: region || '',
    country,
    latitude: lat,
    longitude: lon,
    photo: regular
  });

  newCity = await newCity.save();
  return newCity;
};
