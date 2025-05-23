const Message = require('../Models/message');
const User = require('../Models/users');

// To get all messages
const getAllMessages = async (req, res) => {
  try {
    const allMessages = await Message.find().populate(
      'sender',
      'firstName lastName'
    );
    res.status(200).json({ messages: allMessages });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch messages' });
  }
};

// to post a new message
const postMessage = async (req, res) => {
  try {
    const { senderId, content } = req.body;
    if (!senderId || !content) {
      return res.status(400).json({ message: 'Sender and content required' });
    }

    const user = await User.findById(senderId);
    if (!user) {
      return res.status(404).json({ message: 'Sender not found' });
    }

    const newMessage = await Message.create({
      sender: senderId,
      content,
    });

    const populatedMessage = await newMessage.populate(
      'sender',
      'firstName lastName'
    );

    res.status(201).json(populatedMessage);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getAllMessages,
  postMessage,
};
