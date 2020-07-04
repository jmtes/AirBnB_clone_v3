module.exports = {
  mongoURI: `mongodb+srv://${process.env.BEARBNB_DB_USER}:${process.env.BEARBNB_DB_PWD}@bearbnb-pztuf.mongodb.net/test?retryWrites=true&w=majority`,
  jwtSecret: process.env.BEARBNB_JWT_SECRET,
  locationIQAPIKey: process.env.BEARBNB_LOCATIONIQ_API_KEY,
  unsplashAccessKey: process.env.BEARBNB_UNSPLASH_ACCESS_KEY
};
