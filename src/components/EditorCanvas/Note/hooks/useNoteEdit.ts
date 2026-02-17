import { useState, useRef, useCallback } from "react";
import { Action, ObjectType } from "@data/constants";
import { useNotes, useUndoRedo, useObjectColorEdit } from "@hooks";
import { INote } from "@types";
import { useTranslation } from "react-i18next";

export const useNoteEdit = (data: INote) => {
  const [editField, setEditField] = useState<{ title?: string; content?: string; height?: number }>({});
  const { updateNote } = useNotes();
  const { setUndoStack, setRedoStack } = useUndoRedo();
  const { t } = useTranslation();

  const { handleColorPick, updateColor } = useObjectColorEdit(
    data,
    ObjectType.NOTE,
    updateNote
  );

  const handleChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const textarea = document.getElementById(`note_${data.id}`) as HTMLTextAreaElement;
    if (!textarea) return;
    textarea.style.height = "0";
    textarea.style.height = textarea.scrollHeight + "px";
    const newHeight = textarea.scrollHeight + 42;
    const updates: Partial<INote> = { content: e.target.value };
    if (newHeight !== data.height) {
      updates.height = newHeight;
    }
    updateNote(data.id, updates);
  }, [data.id, data.height, updateNote]);

  const handleBlur = useCallback((e: React.FocusEvent<HTMLTextAreaElement>) => {
    if (e.target.value === editField.content) return;
    const textarea = document.getElementById(`note_${data.id}`) as HTMLTextAreaElement;
    if (!textarea) return;
    textarea.style.height = "0";
    textarea.style.height = textarea.scrollHeight + "px";
    const newHeight = textarea.scrollHeight + 16 + 20 + 4;
    setUndoStack((prev) => [
      ...prev,
      {
        action: Action.EDIT,
        element: ObjectType.NOTE,
        nid: data.id,
        undo: editField,
        redo: { content: e.target.value, height: newHeight },
        message: t("edit_note", {
          noteTitle: e.target.value,
          extra: "[content]",
        }),
      },
    ]);
    setRedoStack([]);
  }, [data.id, editField, setUndoStack, setRedoStack, t]);

  const handleTitleBlur = useCallback((e: React.FocusEvent<HTMLInputElement>) => {
    if (e.target.value === editField.title) return;
    setUndoStack((prev) => [
      ...prev,
      {
        action: Action.EDIT,
        element: ObjectType.NOTE,
        nid: data.id,
        undo: { title: editField.title },
        redo: { title: e.target.value },
        message: t("edit_note", {
          noteTitle: e.target.value,
          extra: "[title]",
        }),
      },
    ]);
    setRedoStack([]);
  }, [data.id, editField.title, setUndoStack, setRedoStack, t]);

  return {
    editField,
    setEditField,
    updateColor,
    handleChange,
    handleBlur,
    handleTitleBlur,
    updateNote,
  };
};
