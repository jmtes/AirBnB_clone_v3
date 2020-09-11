const City = require('../../models/City');

const getCities = async (req, res) => {
  try {
    const cities = await City.find({}, { __v: 0 });

    res.json({ cities });
  } catch (err) {
    console.log(err.message);
    res.status(500).json({ message: 'Something went wrong. Try again later.' });
  }
};

module.exports = { getCities };
