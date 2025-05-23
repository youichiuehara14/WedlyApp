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
    <div className="min-h-screen w-full rounded-4xl bg-[#2d2f25] text-white p-4 sm:p-6 flex justify-center ">
      <div className="w-full h-[70vh] flex flex-col bg-[#2d2f25] rounded-xl border border-[#dddddd2d] shadow-lg p-4">
        <h1 className="text-xl sm:text-3xl font-bold mb-4 text-center border-b pb-2 border-[#dddddd2d]">
          💬 Global Chat
        </h1>

        <div className="flex-1 overflow-y-auto bg-[#323529] rounded-lg p-6 mb-4 text-sm sm:text-base ">
          {messages.length > 0 ? (
            messages.map((msg, i) => (
              <p key={i} className="mb-1 last:mb-0">
                <strong className="text-blue-300">
                  {msg.sender ? `${msg.sender.firstName} ${msg.sender.lastName}` : 'Unknown'}:
                </strong>{' '}
                {msg.content}
              </p>
            ))
          ) : (
            <p className="text-gray-400 text-center mt-2">No messages yet. Start chatting!</p>
          )}
        </div>

        <div className="flex gap-2">
          <input
            type="text"
            value={newMsg}
            onChange={(e) => setNewMsg(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSend();
            }}
            placeholder="Type your message..."
            className="flex-1 border border-[#dddddd2d] px-3 py-2 rounded-lg bg-[#323529] text-white placeholder-gray-400 focus:outline-none text-sm sm:text-base"
          />
          <button
            onClick={handleSend}
            className="border-1 border-[#dddddd2d] text-white hover:bg-[#323529] hover:text-white cursor-pointer  px-4 py-2 rounded-lg transition-all duration-300 text-sm"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default GlobalChat;
