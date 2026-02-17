import { Toast } from "@douyinfe/semi-ui";
import { createContext, useState, ReactNode, Dispatch, SetStateAction } from "react";
import { useTranslation } from "react-i18next";
import { Action, ObjectType, TABLE_CONFIG, GRID_CONFIG } from "@data/constants";
import { useSelect, useTransform, useUndoRedo, useSettings } from "@hooks";
import { IArea } from "@types";
import { nanoid } from "nanoid";

interface AreasContextType {
  areas: IArea[];
  setAreas: Dispatch<SetStateAction<IArea[]>>;
  updateArea: (id: string | number, values: Partial<IArea>) => void;
  addArea: (data?: { area: IArea; index: number }, addToHistory?: boolean) => void;
  deleteArea: (id: string | number, addToHistory?: boolean) => void;
  areasCount: number;
}

export const AreasContext = createContext<AreasContextType>({
  areas: [],
  setAreas: () => {},
  updateArea: () => {},
  addArea: () => {},
  deleteArea: () => {},
  areasCount: 0,
});

export default function AreasContextProvider({ children }: { children: ReactNode }) {
  const { t } = useTranslation();
  const [areas, setAreas] = useState<IArea[]>([]);
  const { transform } = useTransform();
  const { settings } = useSettings();
  const { selectedElement, setSelectedElement } = useSelect();
  const { setUndoStack, setRedoStack } = useUndoRedo();

  const addArea = (data?: { area: IArea; index: number }, addToHistory: boolean = true) => {
    if (data) {
      setAreas((prev) => {
        const temp = prev.slice();
        temp.splice(data.index, 0, data.area);
        return temp;
      });
    } else {
      const width = 200;
      const height = 200;
      let x = transform.pan.x - width / 2;
      let y = transform.pan.y - height / 2;
      if (settings.snapToGrid) {
        x = Math.round(x / GRID_CONFIG.SIZE) * GRID_CONFIG.SIZE;
        y = Math.round(y / GRID_CONFIG.SIZE) * GRID_CONFIG.SIZE;
      }
      const newArea: IArea = {
        id: nanoid(),
        name: `area_${areas.length}`,
        x,
        y,
        width,
        height,
        color: TABLE_CONFIG.DEFAULT_BLUE,
        locked: false,
      };
      setAreas((prev) => [...prev, newArea]);
    }
    if (addToHistory) {
      setUndoStack((prev) => [
        ...prev,
        {
          action: Action.ADD,
          element: ObjectType.AREA,
          message: t("add_area"),
        },
      ]);
      setRedoStack([]);
    }
  };

  const deleteArea = (id: string | number, addToHistory: boolean = true) => {
    if (addToHistory) {
      const deletedArea = areas.find((a) => a.id === id);
      const deletedIndex = areas.findIndex((a) => a.id === id);
      if (deletedArea) {
        Toast.success(t("area_deleted"));
        setUndoStack((prev) => [
          ...prev,
          {
            action: Action.DELETE,
            element: ObjectType.AREA,
            data: { area: deletedArea, index: deletedIndex },
            message: t("delete_area", { areaName: deletedArea.name }),
          },
        ]);
        setRedoStack([]);
      }
    }
    setAreas((prev) => prev.filter((e) => e.id !== id));
    if (id === selectedElement.id) {
      setSelectedElement((prev) => ({
        ...prev,
        element: ObjectType.NONE,
        id: "",
        open: false,
      }));
    }
  };

  const updateArea = (id: string | number, values: Partial<IArea>) => {
    setAreas((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...values } : t)),
    );
  };

  return (
    <AreasContext.Provider
      value={{
        areas,
        setAreas,
        updateArea,
        addArea,
        deleteArea,
        areasCount: areas.length,
      }}
    >
      {children}
    </AreasContext.Provider>
  );
}
