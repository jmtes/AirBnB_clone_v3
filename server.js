const express = require('express');
const connectDB = require('./config/db');

// Import routes
const cityRoutes = require('./routes/cities');
const placeRoutes = require('./routes/places');
const reviewRoutes = require('./routes/reviews');
const reservationRoutes = require('./routes/reservations');
const userRoutes = require('./routes/users');
const authRoutes = require('./routes/auth');

const app = express();

// Connect to MongoDB
connectDB();

// Set routes
app.use('/api/cities', cityRoutes);
app.use('/api/places', placeRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/reservations', reservationRoutes);
app.use('/api/users', userRoutes);
app.use('/api/auth', authRoutes);

const PORT = process.env.BEARBNB_PORT || 5000;

app.get('/', (req, res) => {
  res.send('Hello');
});

app.listen(PORT, () => {
  console.log(`Server started on Port ${PORT}`);
});
