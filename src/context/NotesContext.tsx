import { createContext, useState, useCallback, ReactNode, Dispatch, SetStateAction } from "react";
import { Action, ObjectType, NOTE_CONFIG } from "../data/constants";
import { useUndoRedo, useTransform, useSelect } from "../hooks";
import { Toast } from "@douyinfe/semi-ui";
import { useTranslation } from "react-i18next";
import { INote } from "../types";
import { nanoid } from "nanoid";

interface NotesContextType {
  notes: INote[];
  setNotes: Dispatch<SetStateAction<INote[]>>;
  updateNote: (id: string | number, values: Partial<INote>) => void;
  addNote: (data?: { note: INote; index: number }, addToHistory?: boolean) => void;
  deleteNote: (id: string | number, addToHistory?: boolean) => void;
  notesCount: number;
}

export const NotesContext = createContext<NotesContextType>({
  notes: [],
  setNotes: () => {},
  updateNote: () => {},
  addNote: () => {},
  deleteNote: () => {},
  notesCount: 0,
});

export default function NotesContextProvider({ children }: { children: ReactNode }) {
  const { t } = useTranslation();
  const [notes, setNotes] = useState<INote[]>([]);
  const { transform } = useTransform();
  const { setUndoStack, setRedoStack } = useUndoRedo();
  const { selectedElement, setSelectedElement } = useSelect();

  const addNote = (data?: { note: INote; index: number }, addToHistory: boolean = true) => {
    if (data) {
      setNotes((prev) => {
        const temp = prev.slice();
        temp.splice(data.index, 0, data.note);
        return temp;
      });
    } else {
      const height = 88;
      const newNote: INote = {
        id: nanoid(),
        x: transform.pan.x,
        y: transform.pan.y - height / 2,
        title: `note_${notes.length}`,
        content: "",
        locked: false,
        color: NOTE_CONFIG.DEFAULT_THEME,
        height,
        width: NOTE_CONFIG.WIDTH,
      };
      setNotes((prev) => [...prev, newNote]);
    }
    if (addToHistory) {
      setUndoStack((prev) => [
        ...prev,
        {
          action: Action.ADD,
          element: ObjectType.NOTE,
          message: t("add_note"),
        },
      ]);
      setRedoStack([]);
    }
  };

  const deleteNote = (id: string | number, addToHistory: boolean = true) => {
    if (addToHistory) {
      const deletedNote = notes.find((n) => n.id === id);
      const deletedIndex = notes.findIndex((n) => n.id === id);
      if (deletedNote) {
        Toast.success(t("note_deleted"));
        setUndoStack((prev) => [
          ...prev,
          {
            action: Action.DELETE,
            element: ObjectType.NOTE,
            data: { note: deletedNote, index: deletedIndex },
            message: t("delete_note", { noteTitle: deletedNote.title }),
          },
        ]);
        setRedoStack([]);
      }
    }
    setNotes((prev) => prev.filter((e) => e.id !== id));
    if (id === selectedElement.id) {
      setSelectedElement((prev) => ({
        ...prev,
        element: ObjectType.NONE,
        id: "",
        open: false,
      }));
    }
  };

  const updateNote = useCallback((id: string | number, values: Partial<INote>) => {
    setNotes((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...values } : t)),
    );
  }, []);

  return (
    <NotesContext.Provider
      value={{
        notes,
        setNotes,
        updateNote,
        addNote,
        deleteNote,
        notesCount: notes.length,
      }}
    >
      {children}
    </NotesContext.Provider>
  );
}
