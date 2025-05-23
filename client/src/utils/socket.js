import { io } from 'socket.io-client';

const socket = io(
  process.env.NODE_ENV === 'production' ? 'https://wedlyapp.onrender.com' : 'http://localhost:4000',
  {
    withCredentials: true,
    autoConnect: true,
  }
);

export default socket;
