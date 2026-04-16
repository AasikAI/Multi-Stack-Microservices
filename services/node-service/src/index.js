require('dotenv').config();

const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const userRoutes = require('./routes/userRoutes');
const healthRoutes = require('./routes/healthRoutes');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.use('/api/users', userRoutes);
app.use('/health', healthRoutes);

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Node User Service running on port ${PORT}`);
  });
});
