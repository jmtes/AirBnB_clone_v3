import axios from 'axios';

const getCityCoordinates = async (city, state, region, country) => {
  const { data } = await axios.get('https://us1.locationiq.com/v1/search.php', {
    params: {
      city,
      state,
      region,
      country,
      format: 'json',
      addressdetails: 1,
      limit: 1,
      key: process.env.LOCATION_IQ_API_KEY
    }
  });

  const { lat, lon } = data[0];

  return { latitude: parseInt(lat, 10), longitude: parseInt(lon, 10) };
};

const getCityPhoto = async (city) => {
  const {
    data: { results }
  } = await axios.get('https://api.unsplash.com/search/photos', {
    params: {
      query: `${city} city`,
      orientation: 'landscape',
      page: 1,
      per_page: 1,
      color: 'blue'
    },
    headers: {
      Authorization: `Client-ID ${process.env.UNSPLASH_ACCESS_KEY}`
    }
  });

  const [result] = results;

  const {
    urls: { regular }
  } = result;

  return regular;
};

const createCity = async (prisma, city, state = '', region = '', country) => {
  // Get city coordinates
  const coordinates = await getCityCoordinates(city, state, region, country);

  // Get city card photo
  const photo = await getCityPhoto(city);

  const data = {
    name: city,
    country,
    ...coordinates,
    photo
  };
  if (state) data.state = state;
  if (region) data.region = region;

  return prisma.mutation.createCity({ data });
};

const getCityId = async (locationData, prisma) => {
  const {
    address: { city, state, region, country }
  } = locationData;

  const where = { name: city, country };
  if (state) where.state = state;
  if (region) where.region = region;

  // Check if city exists in DB
  let [dbCity] = await prisma.query.cities({ where });
  if (!dbCity) dbCity = await createCity(prisma, city, state, region, country);

  // Return city id
  return dbCity.id;
};

export default getCityId;
