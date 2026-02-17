import { useState, useRef } from "react";
import { Action, State } from "@data/constants";
import { useUndoRedo, useSaveState, useCanvas, useSettings, useLayout } from "@hooks";
import { useTranslation } from "react-i18next";

/**
 * Generic hook for handling object rotation on the canvas.
 */
export const useObjectRotation = <T extends { 
  id: string | number; 
  x: number; 
  y: number; 
  width: number; 
  height: number; 
  rotation?: number;
  name?: string; 
  title?: string 
}>(
  data: T,
  objectType: number,
  updateCallback: (id: string | number, updates: Partial<T>) => void
) => {
  const { setUndoStack, setRedoStack } = useUndoRedo();
  const { setSaveState } = useSaveState();
  const { pointer } = useCanvas();
  const { settings } = useSettings();
  const { layout } = useLayout();
  const { t } = useTranslation();

  const [isRotating, setIsRotating] = useState(false);
  const initialRotationRef = useRef<number>(0);

  const startRotation = (e: React.PointerEvent) => {
    if (layout.readOnly) return;
    e.stopPropagation();
    e.preventDefault();
    (e.currentTarget as Element).setPointerCapture(e.pointerId);
    
    setIsRotating(true);
    initialRotationRef.current = data.rotation || 0;
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!isRotating) return;

    const centerX = data.x + data.width / 2;
    const centerY = data.y + data.height / 2;
    
    const { x, y } = pointer.spaces.diagram;
    if (x === undefined || y === undefined) return;

    const angle = Math.atan2(y - centerY, x - centerX) * (180 / Math.PI);
    
    // Adjust by 90 degrees because the rotation handle is usually at the top (0 degrees in atan2 is to the right)
    let rotation = (angle + 90) % 360;
    if (rotation < 0) rotation += 360;

    if (settings.snapToGrid) {
      rotation = Math.round(rotation / 45) * 45;
    } else {
      rotation = Math.round(rotation);
    }

    updateCallback(data.id, { rotation } as any);
  };

  const stopRotation = (e: React.PointerEvent) => {
    if (!isRotating) return;
    (e.currentTarget as Element).releasePointerCapture(e.pointerId);

    const init = initialRotationRef.current;
    if (init !== (data.rotation || 0)) {
      const objectName = data.name || data.title || "";
      
      setUndoStack((prev) => [
        ...prev,
        {
          action: Action.EDIT,
          element: objectType,
          id: data.id,
          undo: { rotation: init },
          redo: { rotation: data.rotation },
          message: t("edit_text", {
            extra: "[rotation]",
          }),
        },
      ]);
      setRedoStack([]);
      setSaveState(State.SAVING);
    }

    setIsRotating(false);
  };

  return {
    isRotating,
    startRotation,
    onPointerMove,
    stopRotation,
  };
};
