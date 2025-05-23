import React, { useEffect, useState, useContext } from 'react';
import { Context } from '../Context';
import socket from '../utils/socket';
import axios from 'axios';

const GlobalChat = () => {
  const [messages, setMessages] = useState([]);
  const [newMsg, setNewMsg] = useState('');
  const { user } = useContext(Context);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const res = await axios.get('http://localhost:4000/api/message');
        setMessages(res.data.messages);
      } catch (error) {
        console.error('Failed to fetch messages:', error);
      }
    };

    fetchMessages();
    socket.on('newMessage', (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

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
    <div className="min-h-full w-full text-black p-4 flex justify-center shadow-neumorphism-inset items-center">
      <div className="h-[70vh] w-[70vw] flex flex-col rounded-4xl shadow-lg shadow-neumorphism-inset p-10">
        <h1 className="text-xl sm:text-3xl font-bold mb-4 text-center pb-2">💬 Messages</h1>

        <div className="flex-1 overflow-y-auto rounded-lg p-6 mb-4 text-sm sm:text-base border-1 border-gray-400">
          {messages.length > 0 ? (
            messages.map((msg, i) => (
              <div key={i} className="mb-4">
                <p>
                  <strong className="text-blue-600">
                    {msg.sender ? `${msg.sender.firstName} ${msg.sender.lastName}` : 'Unknown'}:
                  </strong>{' '}
                  {msg.content}
                </p>
                <p className="text-gray-500 text-[10px] ml-2">
                  {new Date(msg.createdAt).toLocaleString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: true,
                  })}
                </p>
              </div>
            ))
          ) : (
            <p className="text-gray-500 text-center mt-2">No messages yet. Start chatting!</p>
          )}
        </div>

        <div className="flex gap-2 flex-col sm:flex-row">
          <input
            type="text"
            value={newMsg}
            onChange={(e) => setNewMsg(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSend();
            }}
            placeholder="Type your message..."
            className="flex-1 border-1 border-gray-500 px-3 py-2 rounded-lg text-black placeholder-gray-400 focus:outline-none text-sm sm:text-base"
          />
          <button
            onClick={handleSend}
            className="border-[#5050509d] border-1 text-black px-4 py-2 rounded-lg hover:bg-[#565a47] hover:text-white cursor-pointer transition-all duration-300 text-sm"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default GlobalChat;
