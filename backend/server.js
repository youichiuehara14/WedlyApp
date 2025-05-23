const path = require('path');
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const http = require('http');
const { Server } = require('socket.io');

// Load .env in development, rely on Render's variables in production
if (process.env.NODE_ENV !== 'production') {
  const dotenvResult = require('dotenv').config({ path: './.env' });
  console.log('dotenv loaded:', dotenvResult);
} else {
  console.log('Running in production, using Render environment variables');
}

// Debug: Verify environment variables and paths
console.log('mongoose:', require('mongoose'));
console.log('MONGO_URL:', process.env.MONGO_URL);
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('PORT:', process.env.PORT);
if (!process.env.MONGO_URL) {
  console.error('Error: MONGO_URL is not defined');
  process.exit(1);
}

const boardRoutes = require('./Routes/boardRoutes');
const taskRoutes = require('./Routes/taskRoutes');
const userRoutes = require('./Routes/userRoutes');
const checklistRoutes = require('./Routes/checklistRoutes');
const commentRoutes = require('./Routes/commentRoutes');
const vendorRoutes = require('./Routes/vendorRoutes');
const messageRoutes = require('./Routes/messageRoutes');
const guestRoutes = require('./Routes/guestRoutes');

const User = require('./Models/users');
const Message = require('./Models/message');

const app = express();
const server = http.createServer(app);
// const io = new Server(server, {
//   cors: {
//     origin: 'http://localhost:5173',
//     methods: ['GET', 'POST'],
//     credentials: true,
//   },
// });

const io = new Server(server, {
  cors: {
    origin: ['http://localhost:5173', 'https://wedlyapp.onrender.com'],
    methods: ['GET', 'POST'],
  },
});
const PORT = process.env.PORT || 4000;

// MongoDB connection
mongoose
  .connect(process.env.MONGO_URL, {
    serverSelectionTimeoutMS: 30000,
    connectTimeoutMS: 30000,
  })
  .then(() => console.log('MongoDB connected..'))
  .catch((err) => {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
  });

// Middleware
app.use(
  cors({
    origin: 'http://localhost:5173',
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
app.use('/api/message', messageRoutes);
app.use('/api/guest', guestRoutes);

// Serve frontend in production
if (process.env.NODE_ENV === 'production') {
  const staticPath = path.join(__dirname, '../client/dist');
  console.log('Serving static files from:', staticPath);
  app.use(express.static(staticPath));
  app.get('/{*splat}', (req, res) => {
    const indexPath = path.resolve(__dirname, '..', 'client', 'dist', 'index.html');
    console.log('Attempting to serve:', indexPath);
    res.sendFile(indexPath, (err) => {
      if (err) {
        console.error('Error serving index.html:', err);
        res.status(500).send('Server error');
      }
    });
  });
}

// Socket.io
io.on('connection', (socket) => {
  console.log('🟢 New client connected:', socket.id);

  socket.on('sendMessage', async (data) => {
    try {
      const { content, senderId } = data;

      if (!senderId || !content) return;

      const User = require('./Models/users');
      const Message = require('./Models/message');

      const user = await User.findById(senderId);
      if (!user) return;

      const newMsg = await Message.create({
        sender: senderId,
        content,
      });

      const populatedMsg = await newMsg.populate('sender', 'firstName lastName');
      console.log('Broadcasting new message:', populatedMsg);

      io.emit('newMessage', populatedMsg);
    } catch (err) {
      console.error('❌ Error saving or broadcasting message:', err.message);
      socket.emit('error', { message: 'Failed to send message' });
    }
  });

  socket.on('disconnect', () => {
    console.log('🔴 Client disconnected:', socket.id);
  });
});

server.listen(PORT, () => console.log('Listening on port 4000'));
