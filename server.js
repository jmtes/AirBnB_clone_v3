const express = require('express');

// Import routes
const cityRoutes = require('./routes/cities');

const app = express();

// Set routes
app.use('/api/cities', cityRoutes);

const PORT = process.env.BEARBNB_PORT || 5000;

app.get('/', (req, res) => {
  res.send('Hello');
});

app.listen(PORT, () => {
  console.log(`Server started on Port ${PORT}`);
});
