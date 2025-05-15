const dotenv = require('dotenv').config();

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');

const boardRoutes = require('./Routes/boardRoutes');
const taskRoutes = require('./Routes/taskRoutes');
const userRoutes = require('./Routes/userRoutes');
const checklistRoutes = require('./Routes/checklistRoutes');
const commentRoutes = require('./Routes/commentRoutes');
const vendorRoutes = require('./Routes/vendorRoutes');

const app = express();
const PORT = process.env.PORT || 4000;

// MongoDB connection
mongoose
  .connect(process.env.MONGO_URL)
  .then(() => console.log('MongoDB connected..'))
  .catch((err) => console.log(err));

// Middleware
app.use(
  cors({
    origin: 'http://localhost:5173', //Frontend URL
    credentials: true,
  })
);

app.use(express.static('public'));
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: false }));

// Routes
app.use('/api/user', userRoutes);
app.use('/api/board', boardRoutes);
app.use('/api/task', taskRoutes);
app.use('/api/checklist', checklistRoutes);
app.use('/api/comment', commentRoutes);
app.use('/api/vendor', vendorRoutes);

app.listen(PORT, () => console.log('Listening on port 4000'));
