import express from 'express';
import connectDB from '../config/db';

// Import routes
import cityRoutes from '../routes/cities';
import placeRoutes from '../routes/places';
import reviewRoutes from '../routes/reviews';
import reservationRoutes from '../routes/reservations';
import userRoutes from '../routes/users';
import authRoutes from '../routes/auth';

const app = express();

// Initialize middleware
app.use(express.json({ extended: false }));

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
