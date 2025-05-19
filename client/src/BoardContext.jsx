import { createContext, useState, useContext, useEffect } from 'react';
import { Context } from './Context';

export const BoardContext = createContext();

export const BoardProvider = ({ children }) => {
  const { user } = useContext(Context);
  const [boardId, setBoardId] = useState('');

  useEffect(() => {
    if (user?.boards?.length > 0) {
      setBoardId(user.boards[0]._id); // Set default boardId if available
    } else {
      setBoardId(''); // Reset to empty string if no boards
    }
  }, [user]);

  return <BoardContext.Provider value={{ boardId, setBoardId }}>{children}</BoardContext.Provider>;
};
