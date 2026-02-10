import { useState, useCallback } from "react";
import { ObjectType, Action, TABLE_CONFIG } from "../data/constants";
import { getTableHeight, getTableWidth } from "../utils/utils";
import { ICanvasContext } from "../context/CanvasContext";
import { ISelectedElement, IBulkSelectedElement } from "../context/SelectContext";
import { ITable, IArea, INote, IText } from "../types";

/**
 * Hook to handle interactions on the canvas, such as dragging elements and selection.
 *
 * @param pointer - Pointer state from CanvasContext.
 * @param selectedElement - Currently selected element.
 * @param setSelectedElement - Function to update selected element.
 * @param bulkSelectedElements - Array of bulk selected elements.
 * @param setBulkSelectedElements - Function to update bulk selected elements.
 * @param tables - Array of table objects.
 * @param updateTable - Function to update a specific table.
 * @param updateArea - Function to update a specific area.
 * @param updateNote - Function to update a specific note.
 * @param updateText - Function to update a specific text element.
 * @param setUndoStack - Function to update the undo stack.
 * @param setRedoStack - Function to update the redo stack.
 * @param settings - Application settings.
 * @param layout - Current layout configuration.
 * @param t - Translation function.
 * @param startSelection - Function to start a selection rectangle.
 * @param startPanning - Function to start canvas panning.
 * @param isSameElement - Utility to compare two elements.
 * @param GRID_CONFIG - Grid configuration.
 * @returns Object containing interaction state and handlers.
 */
export function useCanvasInteraction(
  pointer: ICanvasContext["pointer"],
  selectedElement: ISelectedElement,
  setSelectedElement: (val: ISelectedElement | ((prev: ISelectedElement) => ISelectedElement)) => void,
  bulkSelectedElements: IBulkSelectedElement[],
  setBulkSelectedElements: (val: IBulkSelectedElement[] | ((prev: IBulkSelectedElement[]) => IBulkSelectedElement[])) => void,
  tables: ITable[],
  updateTable: (id: string | number, values: Partial<ITable>, history?: boolean) => void,
  updateArea: (id: string | number, values: Partial<IArea>) => void,
  updateNote: (id: string | number, values: Partial<INote>) => void,
  updateText: (id: string | number, values: Partial<IText>) => void,
  setUndoStack: (val: any | ((prev: any) => any)) => void,
  setRedoStack: (val: any[]) => void,
  settings: any,
  layout: any,
  t: (key: string) => string,
  startSelection: (e: any) => void,
  startPanning: (cursor: { x: number; y: number }) => void,
  isSameElement: (el1: any, el2: any) => boolean,
  GRID_CONFIG: { SIZE: number }
) {
  const notDragging = {
    id: "",
    type: ObjectType.NONE,
    grabOffset: { x: 0, y: 0 },
  };
  const [dragging, setDragging] = useState<any>(notDragging);

  const isDragging = useCallback(() => {
    return dragging.type !== ObjectType.NONE && dragging.id !== "";
  }, [dragging]);

  const didDrag = useCallback(() => {
    if (!isDragging() || bulkSelectedElements.length === 0) return false;
    const { currentCoords, initialCoords } = bulkSelectedElements[0];
    return (
      currentCoords.x !== initialCoords.x || currentCoords.y !== initialCoords.y
    );
  }, [isDragging, bulkSelectedElements]);

  const coordinatesAfterSnappingToGrid = useCallback(({ x, y }: { x: number; y: number }) => {
    if (settings.snapToGrid) {
      return {
        x: Math.round(x / GRID_CONFIG.SIZE) * GRID_CONFIG.SIZE,
        y: Math.round(y / GRID_CONFIG.SIZE) * GRID_CONFIG.SIZE,
      };
    }
    return { x, y };
  }, [settings.snapToGrid, GRID_CONFIG.SIZE]);

  const handlePointerDownOnElement = useCallback((e: React.PointerEvent | PointerEvent, { element, type }: { element: any, type: number }) => {
    if (selectedElement.open && !layout.sidebar) return;
    if (!e.isPrimary) return;

    if (!element.locked || !(e.ctrlKey || e.metaKey)) {
      setSelectedElement((prev: any) => ({
        ...prev,
        element: type,
        id: element.id,
        open: false,
      }));
    }

    if (element.locked) {
      if (!(e.ctrlKey || e.metaKey)) {
        setBulkSelectedElements([]);
      }
      return;
    }

    const elementInBulk: IBulkSelectedElement = {
      id: element.id,
      type,
      currentCoords:
        type === ObjectType.RELATIONSHIP
          ? { x: 0, y: 0 }
          : { x: element.x, y: element.y },
      initialCoords:
        type === ObjectType.RELATIONSHIP
          ? { x: 0, y: 0 }
          : { x: element.x, y: element.y },
    };

    const isSelected = bulkSelectedElements.some((el) =>
      isSameElement(el, elementInBulk),
    );

    if (e.ctrlKey || e.metaKey) {
      if (isSelected) {
        if (bulkSelectedElements.length > 1) {
          setBulkSelectedElements(
            bulkSelectedElements.filter(
              (el) => !isSameElement(el, elementInBulk),
            ),
          );
          setSelectedElement((prev: any) => ({
            ...prev,
            element: ObjectType.NONE,
            id: "",
            open: false,
          }));
        }
      } else {
        setBulkSelectedElements([...bulkSelectedElements, elementInBulk]);
      }
      setDragging(notDragging);
      return;
    }

    if (!isSelected) {
      setBulkSelectedElements([elementInBulk]);
    }

    if (type === ObjectType.RELATIONSHIP) {
      setDragging(notDragging);
      return;
    }

    setDragging({
      id: element.id,
      type,
      grabOffset: {
        x: pointer.spaces.diagram.x - element.x,
        y: pointer.spaces.diagram.y - element.y,
      },
    });
  }, [selectedElement, layout.sidebar, setSelectedElement, setBulkSelectedElements, bulkSelectedElements, isSameElement, pointer.spaces.diagram]);

  const handlePointerMoveDragging = useCallback(() => {
    if (isDragging()) {
      const { x: mainElementFinalX, y: mainElementFinalY } =
        coordinatesAfterSnappingToGrid({
          x: pointer.spaces.diagram.x! - dragging.grabOffset.x,
          y: pointer.spaces.diagram.y! - dragging.grabOffset.y,
        });

      const elementInBulk = bulkSelectedElements.find((el) =>
        isSameElement(el, dragging),
      );

      if (!elementInBulk) {
        setDragging(notDragging);
        return true;
      }

      const { currentCoords } = elementInBulk;
      const deltaX = mainElementFinalX - currentCoords.x;
      const deltaY = mainElementFinalY - currentCoords.y;

      if (deltaX === 0 && deltaY === 0) return true;

      const newBulkSelectedElements: IBulkSelectedElement[] = [];
      bulkSelectedElements.forEach((el) => {
        const elementFinalCoords = {
          x: (el.currentCoords?.x ?? 0) + deltaX,
          y: (el.currentCoords?.y ?? 0) + deltaY,
        };
        if (el.type === ObjectType.TABLE) {
          const table = tables.find((t) => t.id === el.id);
          let finalX = elementFinalCoords.x;
          let finalY = elementFinalCoords.y;

          if (table?.supertypeId) {
            const supertype = tables.find((t) => t.id === table.supertypeId);
            const isSupertypeInBulk = bulkSelectedElements.some(
              (bse) => bse.id === table.supertypeId && bse.type === ObjectType.TABLE,
            );

            if (supertype && !isSupertypeInBulk) {
              const baseHeight =
                supertype.fields.length * TABLE_CONFIG.FIELD_HEIGHT +
                TABLE_CONFIG.HEADER.HEIGHT +
                TABLE_CONFIG.HEADER.COLOR_STRIP_HEIGHT;

              const minX = supertype.x + 10;
              const minY = supertype.y + baseHeight;

              finalX = Math.max(minX, finalX);
              finalY = Math.max(minY, finalY);

              const currentSubtypes = tables
                .filter((t) => t.supertypeId === supertype.id)
                .map((t) => (t.id === table.id ? { ...t, x: finalX, y: finalY } : t));

              const newHeight = getTableHeight(supertype, currentSubtypes);
              const newWidth = getTableWidth(supertype, currentSubtypes);

              updateTable(
                supertype.id,
                { height: newHeight, width: newWidth },
                false,
              );
            }
          }

          const moveDeltaX = finalX - el.currentCoords.x;
          const moveDeltaY = finalY - el.currentCoords.y;

          updateTable(el.id, { x: finalX, y: finalY });

          const subtypes = tables.filter((t) => t.supertypeId === el.id);
          subtypes.forEach((st) => {
            if (!bulkSelectedElements.some(bse => bse.id === st.id && bse.type === ObjectType.TABLE)) {
              updateTable(st.id, {
                x: st.x + moveDeltaX,
                y: st.y + moveDeltaY,
              });
            }
          });

          newBulkSelectedElements.push({
            ...el,
            currentCoords: { x: finalX, y: finalY },
          });
          return;
        }
        if (el.type === ObjectType.AREA) {
          updateArea(el.id, { ...elementFinalCoords });
        }
        if (el.type === ObjectType.NOTE) {
          updateNote(el.id, { ...elementFinalCoords });
        }
        if (el.type === ObjectType.TEXT) {
          updateText(el.id, { ...elementFinalCoords });
        }
        newBulkSelectedElements.push({
          ...el,
          currentCoords: elementFinalCoords,
        });
      });

      setBulkSelectedElements(newBulkSelectedElements);
      return true;
    }
    return false;
  }, [isDragging, coordinatesAfterSnappingToGrid, pointer.spaces.diagram, dragging, bulkSelectedElements, isSameElement, tables, updateTable, updateArea, updateNote, updateText, setBulkSelectedElements]);

  const finalizeDragging = useCallback(() => {
    if (didDrag()) {
      setUndoStack((prev: any) => [
        ...prev,
        {
          action: Action.MOVE,
          bulk: true,
          message: t("bulk_update"),
          elements: bulkSelectedElements.map((el) => ({
            id: el.id,
            type: el.type,
            undo: el.initialCoords,
            redo: el.currentCoords,
          })),
        },
      ]);
      setRedoStack([]);
      setBulkSelectedElements((prev: any[]) =>
        prev.map((el) => ({
          ...el,
          initialCoords: { ...el.currentCoords },
        })),
      );
    }
    setDragging(notDragging);
  }, [didDrag, setUndoStack, t, bulkSelectedElements, setRedoStack, setBulkSelectedElements]);

  return { dragging, handlePointerDownOnElement, handlePointerMoveDragging, finalizeDragging, isDragging };
}
