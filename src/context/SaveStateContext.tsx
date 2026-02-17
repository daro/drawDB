import { createContext, useState, ReactNode, Dispatch, SetStateAction } from "react";
import { State } from "@data/constants";

interface SaveStateContextType {
  saveState: number;
  setSaveState: Dispatch<SetStateAction<number>>;
}

export const SaveStateContext = createContext<SaveStateContextType>({
  saveState: State.NONE,
  setSaveState: () => {},
});

export default function SaveStateContextProvider({ children }: { children: ReactNode }) {
  const [saveState, setSaveState] = useState<number>(State.NONE);

  return (
    <SaveStateContext.Provider value={{ saveState, setSaveState }}>
      {children}
    </SaveStateContext.Provider>
  );
}
