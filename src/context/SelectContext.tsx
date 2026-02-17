import { createContext, useState, ReactNode, Dispatch, SetStateAction } from "react";
import { ObjectType, Tab } from "@data/constants";
import { IWaypoint } from "@types";

export interface ISelectedElement {
  element: number;
  id: string | number;
  openDialogue: boolean;
  openCollapse: boolean;
  currentTab: string;
  open: boolean;
  editFromToolbar?: boolean;
  openFromToolbar?: boolean;
  initialWaypoints?: IWaypoint[];
  waypointIndex?: number;
}

export interface IBulkSelectedElement {
  id: string | number;
  type: number;
  initialCoords?: { x: number; y: number };
  currentCoords?: { x: number; y: number };
  waypointIndex?: number;
}

interface SelectContextType {
  selectedElement: ISelectedElement;
  setSelectedElement: Dispatch<SetStateAction<ISelectedElement>>;
  bulkSelectedElements: IBulkSelectedElement[];
  setBulkSelectedElements: Dispatch<SetStateAction<IBulkSelectedElement[]>>;
  emitSelect: (id: string | number, type: number, event: React.PointerEvent | PointerEvent) => void;
}

export const SelectContext = createContext<SelectContextType>({
  selectedElement: {
    element: ObjectType.NONE,
    id: "",
    openDialogue: false,
    openCollapse: false,
    currentTab: Tab.TABLES,
    open: false,
  },
  setSelectedElement: () => {},
  bulkSelectedElements: [],
  setBulkSelectedElements: () => {},
  emitSelect: () => {},
});

export default function SelectContextProvider({ children }: { children: ReactNode }) {
  const [selectedElement, setSelectedElement] = useState<ISelectedElement>({
    element: ObjectType.NONE,
    id: "",
    openDialogue: false,
    openCollapse: false,
    currentTab: Tab.TABLES,
    open: false,
    openFromToolbar: false,
  });
  const [bulkSelectedElements, setBulkSelectedElements] = useState<IBulkSelectedElement[]>([]);

  const emitSelect = (id: string | number, type: number, event: React.PointerEvent | PointerEvent) => {
    const isModifierPressed = event.ctrlKey || event.metaKey;
    console.log(`[SelectEvent] id: ${id}, type: ${type}, eventType: ${event.type}, modifier: ${isModifierPressed}`);
    const customEvent = new CustomEvent("element-select", {
      detail: { id, type, event, isModifierPressed },
    });
    window.dispatchEvent(customEvent);
  };

  return (
    <SelectContext.Provider
      value={{
        selectedElement,
        setSelectedElement,
        bulkSelectedElements,
        setBulkSelectedElements,
        emitSelect,
      }}
    >
      {children}
    </SelectContext.Provider>
  );
}
