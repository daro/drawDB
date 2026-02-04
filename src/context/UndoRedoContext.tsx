import { createContext, useState, ReactNode, Dispatch, SetStateAction } from "react";

export interface IUndoRedoAction {
  action: number;
  element: number;
  message?: string;
  data?: unknown;
  undo?: unknown;
  redo?: unknown;
  tid?: string | number;
  fid?: string | number;
  nid?: string | number;
  aid?: string | number;
  rid?: string | number;
  eid?: string | number;
  tyid?: string | number;
  iid?: string | number;
  id?: string | number;
  component?: string;
  bulk?: boolean;
  elements?: unknown[];
  updatedFields?: Record<string, unknown>[];
  x?: number;
  y?: number;
}

interface UndoRedoContextType {
  undoStack: IUndoRedoAction[];
  setUndoStack: Dispatch<SetStateAction<IUndoRedoAction[]>>;
  redoStack: IUndoRedoAction[];
  setRedoStack: Dispatch<SetStateAction<IUndoRedoAction[]>>;
}

export const UndoRedoContext = createContext<UndoRedoContextType>({
  undoStack: [],
  setUndoStack: () => {},
  redoStack: [],
  setRedoStack: () => {},
});

export default function UndoRedoContextProvider({ children }: { children: ReactNode }) {
  const [undoStack, setUndoStack] = useState<IUndoRedoAction[]>([]);
  const [redoStack, setRedoStack] = useState<IUndoRedoAction[]>([]);

  return (
    <UndoRedoContext.Provider
      value={{ undoStack, redoStack, setUndoStack, setRedoStack }}
    >
      {children}
    </UndoRedoContext.Provider>
  );
}
