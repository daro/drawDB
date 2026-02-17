import { useState, useCallback } from "react";
import { ObjectType, NOTE_CONFIG } from "@data/constants";
import { getRectFromEndpoints, isInsideRect } from "@utils/rect";
import { ITable, IArea, INote, IText } from "@types";
import { IBulkSelectedElement } from "@context/SelectContext";
import { ICanvasContext } from "@context/CanvasContext";

/**
 * Hook to handle bulk selection of elements on the canvas using a selection rectangle.
 *
 * @param tables - Array of table objects.
 * @param areas - Array of subject area objects.
 * @param notes - Array of note objects.
 * @param texts - Array of text objects.
 * @param bulkSelectedElements - Current array of bulk selected elements.
 * @param setBulkSelectedElements - Function to update bulk selected elements.
 * @param pointer - Pointer state from CanvasContext.
 * @returns Object containing selection rectangle state and handlers.
 */
export function useBulkSelection(
  tables: ITable[],
  areas: IArea[],
  notes: INote[],
  texts: IText[],
  bulkSelectedElements: IBulkSelectedElement[],
  setBulkSelectedElements: (val: IBulkSelectedElement[] | ((prev: IBulkSelectedElement[]) => IBulkSelectedElement[])) => void,
  pointer: ICanvasContext["pointer"]
) {
  const [bulkSelectRect, setBulkSelectRect] = useState({
    x1: 0,
    y1: 0,
    x2: 0,
    y2: 0,
    show: false,
    ctrlKey: false,
    metaKey: false,
  });

  const isSameElement = useCallback((el1: IBulkSelectedElement, el2: IBulkSelectedElement) => {
    if (el1.type !== el2.type || el1.id !== el2.id) return false;
    if (el1.type === ObjectType.WAYPOINT) {
      return el1.waypointIndex === el2.waypointIndex;
    }
    return true;
  }, []);

  const collectSelectedElements = useCallback(() => {
    const rect = getRectFromEndpoints(bulkSelectRect);
    const elements: IBulkSelectedElement[] = [];
    const shouldAddElement = (elementRect: { x: number; y: number; width: number; height: number }, element: IBulkSelectedElement) => {
      return (
        isInsideRect(elementRect, rect) &&
        ((!bulkSelectRect.ctrlKey && !bulkSelectRect.metaKey) ||
          !bulkSelectedElements.some((el) => isSameElement(el, element)))
      );
    };

    tables.forEach((table) => {
      if (table.locked) return;
      const element: IBulkSelectedElement = {
        id: table.id,
        type: ObjectType.TABLE,
        currentCoords: { x: table.x, y: table.y },
        initialCoords: { x: table.x, y: table.y },
      };
      const tableRect = {
        x: table.x,
        y: table.y,
        width: table.width,
        height: table.height,
      };
      if (shouldAddElement(tableRect, element)) {
        elements.push(element);
      }
    });

    areas.forEach((area) => {
      if (area.locked) return;
      const element: IBulkSelectedElement = {
        id: area.id,
        type: ObjectType.AREA,
        currentCoords: { x: area.x, y: area.y },
        initialCoords: { x: area.x, y: area.y },
      };
      const areaRect = {
        x: area.x,
        y: area.y,
        width: area.width,
        height: area.height,
      };
      if (shouldAddElement(areaRect, element)) {
        elements.push(element);
      }
    });

    notes.forEach((note) => {
      if (note.locked) return;
      const element: IBulkSelectedElement = {
        id: note.id,
        type: ObjectType.NOTE,
        currentCoords: { x: note.x, y: note.y },
        initialCoords: { x: note.x, y: note.y },
      };
      const noteRect = {
        x: note.x,
        y: note.y,
        width: note.width ?? NOTE_CONFIG.WIDTH,
        height: note.height,
      };
      if (shouldAddElement(noteRect, element)) {
        elements.push(element);
      }
    });

    texts.forEach((text) => {
      if (text.locked) return;
      const element: IBulkSelectedElement = {
        id: text.id,
        type: ObjectType.TEXT,
        currentCoords: { x: text.x, y: text.y },
        initialCoords: { x: text.x, y: text.y },
      };
      const textRect = {
        x: text.x - 5,
        y: text.y - text.fontSize,
        width: text.text.length * (text.fontSize * 0.6) + 10,
        height: text.fontSize + 10,
      };
      if (shouldAddElement(textRect, element)) {
        elements.push(element);
      }
    });

    if (bulkSelectRect.ctrlKey || bulkSelectRect.metaKey) {
      setBulkSelectedElements([...bulkSelectedElements, ...elements]);
    } else {
      setBulkSelectedElements(elements);
    }
  }, [bulkSelectRect, tables, areas, notes, texts, bulkSelectedElements, isSameElement, setBulkSelectedElements]);

  const startSelection = useCallback((e: React.PointerEvent | PointerEvent) => {
    setBulkSelectRect({
      x1: pointer.spaces.diagram.x,
      y1: pointer.spaces.diagram.y,
      x2: pointer.spaces.diagram.x,
      y2: pointer.spaces.diagram.y,
      show: true,
      ctrlKey: e.ctrlKey,
      metaKey: e.metaKey,
    });
  }, [pointer.spaces.diagram]);

  const updateSelection = useCallback(() => {
    if (bulkSelectRect.show) {
      setBulkSelectRect((prev) => ({
        ...prev,
        x2: pointer.spaces.diagram.x,
        y2: pointer.spaces.diagram.y,
      }));
    }
  }, [bulkSelectRect.show, pointer.spaces.diagram]);

  const finalizeSelection = useCallback(() => {
    if (bulkSelectRect.show) {
      setBulkSelectRect((prev) => ({
        ...prev,
        x2: pointer.spaces.diagram.x,
        y2: pointer.spaces.diagram.y,
        show: false,
      }));
      return true;
    }
    return true;
  }, [bulkSelectRect.show, pointer.spaces.diagram]);

  return {
    bulkSelectRect,
    setBulkSelectRect,
    collectSelectedElements,
    startSelection,
    updateSelection,
    finalizeSelection,
    isSameElement
  };
}
