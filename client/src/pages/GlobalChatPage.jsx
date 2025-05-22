// src/components/GlobalChat.js
import React, { useEffect, useState, useContext } from 'react';
import { Context } from '../Context';
import socket from '../utils/socket';
import axios from 'axios';

const GlobalChat = () => {
  const [messages, setMessages] = useState([]);
  const [newMsg, setNewMsg] = useState('');
  const { user } = useContext(Context);

  useEffect(() => {
    // Fetch existing messages on load
    const fetchMessages = async () => {
      try {
        const res = await axios.get('http://localhost:4000/api/message');
        setMessages(res.data.messages);
      } catch (error) {
        console.error('Failed to fetch messages:', error);
      }
    };

    fetchMessages();

    // Listen for incoming messages
    socket.on('newMessage', (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    // Cleanup
    return () => {
      socket.off('newMessage');
    };
  }, []);

  const handleSend = async () => {
    if (!newMsg.trim()) return;

    const userId = user?._id;
    if (!userId) return;

    socket.emit('sendMessage', {
      senderId: userId,
      content: newMsg,
    });

    setNewMsg('');
  };

  return (
    <div className="p-4 border rounded-md max-w-md mx-auto">
      <h2 className="text-lg font-bold mb-2">💬 Global Chat</h2>
      <div className="h-64 overflow-y-auto border p-2 mb-2 bg-gray-50">
        {messages.map((msg, i) => (
          <p key={i}>
            <strong>
              {msg.sender
                ? `${msg.sender.firstName} ${msg.sender.lastName}`
                : 'Unknown'}
              :
            </strong>{' '}
            {msg.content}
          </p>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          type="text"
          value={newMsg}
          onChange={(e) => setNewMsg(e.target.value)}
          placeholder="Type your message..."
          className="flex-1 border px-2 py-1 rounded"
        />
        <button
          onClick={handleSend}
          className="bg-blue-500 text-white px-3 py-1 rounded"
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default GlobalChat;
