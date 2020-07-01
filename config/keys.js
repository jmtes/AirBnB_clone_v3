module.exports = {
  mongoURI: `mongodb+srv://${process.env.BEARBNB_DB_USER}:${process.env.BEARBNB_DB_PWD}@bearbnb-pztuf.mongodb.net/test?retryWrites=true&w=majority`,
  jwtSecret: process.env.BEARBNB_JWT_SECRET
};
