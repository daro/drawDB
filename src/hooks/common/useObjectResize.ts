import { useState, useRef } from "react";
import { Action, ObjectType, State, GRID_CONFIG } from "@data/constants";
import { useUndoRedo, useSaveState, useCanvas, useSettings, useLayout } from "@hooks";
import { useTranslation } from "react-i18next";

interface ResizeConfig {
  minWidth?: number;
  minHeight?: number;
  gridSize?: number;
}

/**
 * Generyczny hook do obsługi zmiany rozmiaru obiektów na płótnie.
 * Obsługuje wiele kierunków i snap-to-grid.
 */
export const useObjectResize = <T extends { id: string | number; x: number; y: number; width: number; height: number; name?: string; title?: string }>(
  data: T,
  objectType: number,
  updateCallback: (id: string | number, updates: Partial<T>) => void,
  config: ResizeConfig = {}
) => {
  const { minWidth = 100, minHeight = 100, gridSize = GRID_CONFIG.SIZE } = config;
  const { setUndoStack, setRedoStack } = useUndoRedo();
  const { setSaveState } = useSaveState();
  const { pointer } = useCanvas();
  const { settings } = useSettings();
  const { layout } = useLayout();
  const { t } = useTranslation();

  const [resizingDir, setResizingDir] = useState<string | null>(null);
  const initialDataRef = useRef<{ x: number; y: number; width: number; height: number } | null>(null);

  const startResize = (e: React.PointerEvent, dir: string) => {
    if (layout.readOnly) return;
    e.stopPropagation();
    e.preventDefault();
    (e.currentTarget as Element).setPointerCapture(e.pointerId);
    
    setResizingDir(dir);
    initialDataRef.current = {
      x: data.x,
      y: data.y,
      width: data.width,
      height: data.height,
    };
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!resizingDir) return;

    const dir = resizingDir;
    const initial = initialDataRef.current;
    if (!initial) return;

    let { x, y } = { x: pointer.spaces.diagram.x!, y: pointer.spaces.diagram.y! };

    if (settings.snapToGrid) {
      x = Math.round(x / gridSize) * gridSize;
      y = Math.round(y / gridSize) * gridSize;
    }

    const updates: Partial<T> = {};

    if (dir.includes("r")) {
      updates.width = Math.max(minWidth, x - initial.x) as any;
    }
    if (dir.includes("b")) {
      updates.height = Math.max(minHeight, y - initial.y) as any;
    }
    if (dir.includes("l")) {
      const deltaX = x - initial.x;
      const newWidth = initial.width - deltaX;
      if (newWidth >= minWidth) {
        updates.x = x as any;
        updates.width = newWidth as any;
      } else {
        updates.width = minWidth as any;
        updates.x = (initial.x + initial.width - minWidth) as any;
      }
    }
    if (dir.includes("t")) {
      const deltaY = y - initial.y;
      const newHeight = initial.height - deltaY;
      if (newHeight >= minHeight) {
        updates.y = y as any;
        updates.height = newHeight as any;
      } else {
        updates.height = minHeight as any;
        updates.y = (initial.y + initial.height - minHeight) as any;
      }
    }

    if (Object.keys(updates).length > 0) {
      updateCallback(data.id, updates);
    }
  };

  const stopResize = (e: React.PointerEvent) => {
    if (!resizingDir) return;
    (e.currentTarget as Element).releasePointerCapture(e.pointerId);

    const init = initialDataRef.current;
    if (init && (data.x !== init.x || data.y !== init.y || 
        data.width !== init.width || data.height !== init.height)) {
      
      const objectName = data.name || data.title || "";
      let translationKey = "edit_area";
      let nameParam: any = { areaName: objectName };

      if (objectType === ObjectType.TABLE) {
        translationKey = "edit_table";
        nameParam = { tableName: objectName };
      } else if (objectType === ObjectType.NOTE) {
        translationKey = "edit_note";
        nameParam = { noteTitle: objectName };
      }

      setUndoStack((prev) => [
        ...prev,
        {
          action: Action.EDIT,
          element: objectType,
          id: data.id,
          ...(objectType === ObjectType.AREA
            ? { aid: data.id }
            : objectType === ObjectType.NOTE
            ? { nid: data.id }
            : { tid: data.id }),
          undo: {
            x: init.x,
            y: init.y,
            width: init.width,
            height: init.height,
          },
          redo: {
            x: data.x,
            y: data.y,
            width: data.width,
            height: data.height,
          },
          message: t(translationKey, {
            ...nameParam,
            extra: "[resize]",
          }),
        },
      ]);
      setRedoStack([]);
      setSaveState(State.SAVING);
    }

    setResizingDir(null);
    initialDataRef.current = null;
  };

  return {
    isResizing: !!resizingDir,
    startResize,
    onPointerMove,
    stopResize,
  };
};
