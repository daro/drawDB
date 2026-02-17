import { useState, useRef, useCallback } from "react";
import { Action } from "@data/constants";
import { useUndoRedo } from "@hooks";
import { useTranslation } from "react-i18next";

/**
 * Generyczny hook do obsługi edycji koloru obiektu z historią Undo/Redo.
 */
export const useObjectColorEdit = <T extends { id: string | number; color: string; name?: string; title?: string }>(
  data: T,
  objectType: number,
  updateCallback: (id: string | number, updates: Partial<T>) => void
) => {
  const { setUndoStack, setRedoStack } = useUndoRedo();
  const { t } = useTranslation();
  const initialColorRef = useRef(data.color);

  const handleColorPick = useCallback((color: string) => {
    setUndoStack((prev) => {
      let undoColor = initialColorRef.current;
      const lastColorChange = prev.findLast(
        (e) =>
          e.element === objectType &&
          (e.aid === data.id || e.nid === data.id || e.id === data.id) &&
          e.action === Action.EDIT &&
          (e.redo as { color?: string })?.color,
      );
      if (lastColorChange) {
        undoColor = (lastColorChange.redo as { color: string }).color;
      }

      if (color === undoColor) return prev;

      const objectName = data.name || data.title || "";
      const translationKey = objectType === 2 ? "edit_area" : "edit_note";
      const nameParam = objectType === 2 ? { areaName: objectName } : { noteTitle: objectName };

      return [
        ...prev,
        {
          action: Action.EDIT,
          element: objectType,
          ...(objectType === 2 ? { aid: data.id } : { nid: data.id }),
          undo: { color: undoColor },
          redo: { color: color },
          message: t(translationKey, {
            ...nameParam,
            extra: "[color]",
          }),
        },
      ];
    });
    setRedoStack([]);
  }, [data.id, data.name, data.title, objectType, updateCallback, setUndoStack, setRedoStack, t]);

  const updateColor = useCallback((color: string) => {
    updateCallback(data.id, { color } as Partial<T>);
  }, [data.id, updateCallback]);

  return {
    handleColorPick,
    updateColor,
  };
};
