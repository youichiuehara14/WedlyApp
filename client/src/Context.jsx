import { createContext, useState, useEffect } from 'react';
import axios from 'axios';

// Create the Context
export const Context = createContext();

export const ContextProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // <-- Add loading state

  const fetchUser = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(
        'http://localhost:4000/api/user/profile',
        {
          withCredentials: true,
        }
      );
      setUser(data);
    } catch (err) {
      console.error(err);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  return (
    <Context.Provider
      value={{
        user,
        setUser,
        fetchUser,
        loading,
      }}
    >
      {children}
    </Context.Provider>
  );
};
