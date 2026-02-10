import { createContext, useState, ReactNode, Dispatch, SetStateAction } from "react";
import { ITodo } from "../types";

interface TasksContextType {
  tasks: ITodo[];
  setTasks: Dispatch<SetStateAction<ITodo[]>>;
  updateTask: (id: number, values: Partial<ITodo>) => void;
}

export const TasksContext = createContext<TasksContextType>({
  tasks: [],
  setTasks: () => {},
  updateTask: () => {},
});

export default function TasksContextProvider({ children }: { children: ReactNode }) {
  const [tasks, setTasks] = useState<ITodo[]>([]);

  const updateTask = (id: number, values: Partial<ITodo>) =>
    setTasks((prev) =>
      prev.map((task, i) => (id === i ? { ...task, ...values } : task))
    );

  return (
    <TasksContext.Provider value={{ tasks, setTasks, updateTask }}>
      {children}
    </TasksContext.Provider>
  );
}
