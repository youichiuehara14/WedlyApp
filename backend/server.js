const dotenv = require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const http = require('http');
const { Server } = require('socket.io');

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
const server = http.createServer(app); // Required for socket.io
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST'],
    credentials: true,
  },
});
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
app.use('/api/message', messageRoutes);
app.use('/api/guest', guestRoutes);

// Socket.io required code
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

      const populatedMsg = await newMsg.populate(
        'sender',
        'firstName lastName'
      );
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
