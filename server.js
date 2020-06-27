const express = require('express');

// Import routes
const cityRoutes = require('./routes/cities');
const placeRoutes = require('./routes/places');
const reviewRoutes = require('./routes/reviews');

const app = express();

// Set routes
app.use('/api/cities', cityRoutes);
app.use('/api/places', placeRoutes);
app.use('/api/reviews', reviewRoutes);

const PORT = process.env.BEARBNB_PORT || 5000;

app.get('/', (req, res) => {
  res.send('Hello');
});

app.listen(PORT, () => {
  console.log(`Server started on Port ${PORT}`);
});
