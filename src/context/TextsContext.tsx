import { createContext, useState, useCallback, ReactNode, Dispatch, SetStateAction } from "react";
import { Action, ObjectType, GRID_CONFIG } from "@data/constants";
import { useUndoRedo, useTransform, useSelect, useSettings } from "@hooks";
import { Toast } from "@douyinfe/semi-ui";
import { useTranslation } from "react-i18next";
import { IText } from "@types";
import { nanoid } from "nanoid";

interface TextsContextType {
  texts: IText[];
  setTexts: Dispatch<SetStateAction<IText[]>>;
  updateText: (id: string | number, values: Partial<IText>) => void;
  addText: (data?: { text: IText; index: number }, addToHistory?: boolean) => void;
  deleteText: (id: string | number, addToHistory?: boolean) => void;
  textsCount: number;
}

export const TextsContext = createContext<TextsContextType>({
  texts: [],
  setTexts: () => {},
  updateText: () => {},
  addText: () => {},
  deleteText: () => {},
  textsCount: 0,
});

export default function TextsContextProvider({ children }: { children: ReactNode }) {
  const { t } = useTranslation();
  const [texts, setTexts] = useState<IText[]>([]);
  const { transform } = useTransform();
  const { settings } = useSettings();
  const { setUndoStack, setRedoStack } = useUndoRedo();
  const { selectedElement, setSelectedElement } = useSelect();

  const addText = (data?: { text: IText; index: number }, addToHistory: boolean = true) => {
    if (data) {
      setTexts((prev) => {
        const temp = prev.slice();
        temp.splice(data.index, 0, data.text);
        return temp;
      });
    } else {
      let x = transform.pan.x;
      let y = transform.pan.y;
      if (settings.snapToGrid) {
        x = Math.round(x / GRID_CONFIG.SIZE) * GRID_CONFIG.SIZE;
        y = Math.round(y / GRID_CONFIG.SIZE) * GRID_CONFIG.SIZE;
      }
      const newText: IText = {
        id: nanoid(),
        x,
        y,
        text: t("new_text") || "New Text",
        color: "#333333",
        fontSize: 16,
        fontWeight: "normal",
      };
      setTexts((prev) => [...prev, newText]);
    }
    if (addToHistory) {
      setUndoStack((prev) => [
        ...prev,
        {
          action: Action.ADD,
          element: ObjectType.TEXT,
          message: t("add_text"),
        },
      ]);
      setRedoStack([]);
    }
  };

  const deleteText = (id: string | number, addToHistory: boolean = true) => {
    if (addToHistory) {
      const deletedText = texts.find((t) => t.id === id);
      const deletedIndex = texts.findIndex((t) => t.id === id);
      if (deletedText) {
        Toast.success(t("text_deleted"));
        setUndoStack((prev) => [
          ...prev,
          {
            action: Action.DELETE,
            element: ObjectType.TEXT,
            data: { text: deletedText, index: deletedIndex },
            message: t("delete_text"),
          },
        ]);
        setRedoStack([]);
      }
    }
    setTexts((prev) => prev.filter((e) => e.id !== id));
    if (id === selectedElement.id && selectedElement.element === ObjectType.TEXT) {
      setSelectedElement((prev) => ({
        ...prev,
        element: ObjectType.NONE,
        id: "",
        open: false,
      }));
    }
  };

  const updateText = useCallback((id: string | number, values: Partial<IText>) => {
    setTexts((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...values } : t)),
    );
  }, []);

  return (
    <TextsContext.Provider
      value={{
        texts,
        setTexts,
        updateText,
        addText,
        deleteText,
        textsCount: texts.length,
      }}
    >
      {children}
    </TextsContext.Provider>
  );
}
