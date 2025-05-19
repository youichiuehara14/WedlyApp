import { createContext, useContext, useState } from 'react';

const TaskUpdateContext = createContext();

export const TaskUpdateProvider = ({ children }) => {
  const [taskUpdated, setTaskUpdated] = useState(false);

  const triggerTaskUpdate = () => setTaskUpdated((prev) => !prev);

  return (
    <TaskUpdateContext.Provider value={{ taskUpdated, triggerTaskUpdate }}>
      {children}
    </TaskUpdateContext.Provider>
  );
};

export const useTaskUpdate = () => useContext(TaskUpdateContext);
