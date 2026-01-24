const express = require('express');
const cors = require('cors')
const { PORT } = require('./utils/constants');
const rootRouter = require('./routes');
const { autoCreateAdmin } = require('./controllers/authController');
const connectDB = require('./configs/db');

const app = express();
connectDB();
app.use(cors({
  origin: "*",
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());
app.use(express.urlencoded({ limit: '20mb', extended: true }));

// Serve static files from uploads directory
app.use('/uploads', express.static('uploads'));
app.use('/uploads/menu-images', express.static('uploads/menu-images'));
app.use('/uploads/package-images', express.static('uploads/package-images'));
app.use('/uploads/payment-slips', express.static('uploads/payment-slips'));

autoCreateAdmin()
app.use('/api', rootRouter)

// Root route
app.get('/', (req, res) => {
  res.status(200).json({ message: "Hello World" });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port: ${PORT}`);
});
