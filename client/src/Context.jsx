import { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const Context = createContext();

export const ContextProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [boardsObjects, setBoardsObjects] = useState([]);
  const [vendorsObjects, setVendorsObjects] = useState([]);
  const [activeBoardObject, setActiveBoardObject] = useState(null);
  const [tasksPerBoard, setTasksPerBoard] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchUser = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(
        'http://localhost:4000/api/user/profile',
        { withCredentials: true }
      );

      // Store user, boards, and vendors from response
      setUser(data.user);
      setVendorsObjects(data.vendors);
      setBoardsObjects(data.boards);
    } catch (err) {
      console.error(err);
      setUser(null);
      setVendorsObjects([]);
      setBoardsObjects([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  console.log(activeBoardObject);
  console.log(tasksPerBoard);

  // Store tasks per board
  const fetchTasksPerBoard = async () => {
    try {
      const { data } = await axios.get(
        `http://localhost:4000/api/task/board/${activeBoardObject._id}`,
        { withCredentials: true }
      );
      setTasksPerBoard(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (boardsObjects.length > 0) {
      fetchTasksPerBoard();
    }
  }, [boardsObjects, activeBoardObject]);

  return (
    <Context.Provider
      value={{
        user,
        setUser,
        fetchUser,
        loading,
        boardsObjects,
        setBoardsObjects,
        activeBoardObject,
        setActiveBoardObject,
        vendorsObjects,
        setVendorsObjects,
        tasksPerBoard,
        setTasksPerBoard,
        fetchTasksPerBoard,
      }}
    >
      {children}
    </Context.Provider>
  );
};
