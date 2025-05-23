import { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const Context = createContext();

export const ContextProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [boardsObjects, setBoardsObjects] = useState([]);
  const [vendorsObjects, setVendorsObjects] = useState([]);
  const [vendorsObjectsPerUser, setVendorsObjectsPerUser] = useState([]);
  const [activeBoardObject, setActiveBoardObject] = useState(null);
  const [tasksPerBoard, setTasksPerBoard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [guestsObjects, setGuestsObjects] = useState([]);

  const fetchUser = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(
        'http://localhost:4000/api/user/profile',
        { withCredentials: true }
      );

      // Store user, boards, and vendors from response
      setUser(data.user);

      setBoardsObjects(data.boards);
    } catch (err) {
      console.error(err);
      setUser(null);

      setBoardsObjects([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  // Store tasks per board
  const fetchTasksPerBoard = async (boardId) => {
    if (!boardId) return;
    try {
      const { data } = await axios.get(
        `http://localhost:4000/api/task/board/${boardId}`,
        { withCredentials: true }
      );
      setTasksPerBoard(data);
    } catch (err) {
      console.error(err);
      setTasksPerBoard({ tasks: [] });
    }
  };

  const fetchVendorsPerBoard = async (boardId) => {
    try {
      const { data } = await axios.get(
        `http://localhost:4000/api/vendor/vendorsPerBoard?boardId=${boardId}`,
        { withCredentials: true }
      );
      setVendorsObjects(data.vendors);
    } catch (err) {
      console.error(err);
      setVendorsObjects([]);
    }
  };

  useEffect(() => {
    if (activeBoardObject?._id) {
      fetchVendorsPerBoard(activeBoardObject._id);
    }
  }, [activeBoardObject]);

  const fetchVendorsPerUser = async () => {
    try {
      const { data } = await axios.get(
        'http://localhost:4000/api/vendor/vendorsPerUser',
        { withCredentials: true }
      );
      setVendorsObjectsPerUser(data.vendors);
    } catch (err) {
      console.error(err);
      setVendorsObjectsPerUser([]);
    }
  };

  useEffect(() => {
    fetchVendorsPerUser();
  }, []);

  const addMemberToBoardInContext = (boardId, addedMember) => {
    setBoardsObjects((prevBoards) =>
      prevBoards.map((board) =>
        board._id === boardId
          ? {
              ...board,
              members: [...board.members, addedMember],
            }
          : board
      )
    );
  };

  const fetchGuestsPerUser = async () => {
    try {
      const { data } = await axios.get(
        'http://localhost:4000/api/guest/getGuestList',
        { withCredentials: true }
      );
      setGuestsObjects(data.guests);
    } catch (err) {
      console.error(err);
      setGuestsObjects([]);
    }
  };

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
        fetchVendorsPerBoard,
        fetchVendorsPerUser,
        addMemberToBoardInContext,
        vendorsObjectsPerUser,
        setVendorsObjectsPerUser,
        guestsObjects,
        setGuestsObjects,
        fetchGuestsPerUser,
      }}
    >
      {children}
    </Context.Provider>
  );
};
