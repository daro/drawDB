import { useRef, useState, useCallback } from "react";
import {
  ObjectType,
  THEME_CONFIG,
} from "@data/constants";

import {
  useCanvas,
  useSettings,
  useTransform,
  useDiagram,
  useUndoRedo,
  useSelect,
  useAreas,
  useNotes,
  useLayout,
  useSaveState,
  useTexts,
} from "@hooks";
import { useCanvasPanning } from "./Canvas/hooks/useCanvasPanning";
import { useBulkSelection } from "./Canvas/hooks/useBulkSelection";
import { useLinkingLogic } from "./Canvas/hooks/useLinkingLogic";
import { useCanvasInteraction } from "./Canvas/hooks/useCanvasInteraction";
import { IAreaResize, IAreaInitDimensions } from "@types";
import { useTranslation } from "react-i18next";
import { getDebugLogs } from "@utils/debug";
import { useEventListener } from "usehooks-ts";
import { getRectFromEndpoints } from "@utils/rect";
import { State, GRID_CONFIG } from "@data/constants";
import GridBackground from "./GridBackground";
import LinkingLayer from "./LinkingLayer";
import DebugOverlays from "./DebugOverlays";
import EditorSideSheets from "./EditorSideSheets";
import ObjectsLayer from "./ObjectsLayer";
import RelationshipsLayer from "./RelationshipsLayer";

/**
 * Main Canvas component for the diagram editor.
 * It manages the SVG workspace, user interactions (panning, zooming, dragging, selection),
 * and coordinates various rendering layers and overlays.
 *
 * @returns The rendered diagram editor canvas.
 */
export default function Canvas() {
  const { t } = useTranslation();

  const canvasRef = useRef<SVGSVGElement>(null);
  const canvasContextValue = useCanvas();
  const {
    canvas: { viewBox },
    pointer,
  } = canvasContextValue;

  const {
    tables,
    setTables,
    updateTable,
    relationships,
    addRelationship,
    updateField,
    database,
    xorGroups,
    orGroups,
    linking,
    setLinking,
    linkingLine,
    setLinkingLine,
    hoveredTable,
    setHoveredTable,
    relationshipType,
  } = useDiagram();
  const { texts, updateText } = useTexts();
  const { setSaveState } = useSaveState();
  const { areas, updateArea } = useAreas();
  const { notes, updateNote } = useNotes();
  const { layout } = useLayout();
  const { settings, setSettings } = useSettings();
  const { setUndoStack, setRedoStack } = useUndoRedo();
  const { transform, setTransform } = useTransform();
  const {
    selectedElement,
    setSelectedElement,
    bulkSelectedElements,
    setBulkSelectedElements,
  } = useSelect();

  const {
    panning,
    startPanning,
    stopPanning,
    handlePointerMovePanning
  } = useCanvasPanning(canvasRef, transform, setTransform, pointer, setSaveState, selectedElement, layout, State);

  const setAreaResizeCallback = useCallback((val: IAreaResize) => setAreaResize(val), []);
  const setAreaInitDimensionsCallback = useCallback((val: IAreaInitDimensions) => setAreaInitDimensions(val), []);

  const {
    bulkSelectRect,
    setBulkSelectRect,
    collectSelectedElements,
    startSelection,
    updateSelection,
    finalizeSelection,
    isSameElement
  } = useBulkSelection(tables, areas, notes, texts, bulkSelectedElements, setBulkSelectedElements, pointer);

  const {
    handleLinking,
    handlePointerMoveLinking
  } = useLinkingLogic(
    tables, setTables, updateTable, addRelationship, updateField, linking, setLinking, linkingLine, setLinkingLine,
    hoveredTable, setHoveredTable, relationshipType, settings, setUndoStack, setRedoStack, pointer, t, database, relationships
  );

  const {
    dragging,
    handlePointerDownOnElement,
    handlePointerMoveDragging,
    finalizeDragging,
    isDragging
  } = useCanvasInteraction(
    pointer, selectedElement, setSelectedElement, bulkSelectedElements, setBulkSelectedElements, tables,
    updateTable, updateArea, updateNote, updateText, setUndoStack, setRedoStack, settings, layout, t,
    startSelection, startPanning, isSameElement, GRID_CONFIG, areas, notes, texts, relationships,
    xorGroups, orGroups
  );

  useEventListener("element-select", (e: any) => {
    const { id, type, event, isModifierPressed } = e.detail;
    console.log("[Canvas] element-select event received:", { id, type, isModifierPressed });
    console.log("[Canvas] Current bulkSelectedElements:", bulkSelectedElements);
    
    // We override ctrlKey and metaKey if isModifierPressed is true
    // this ensures that central logic knows if it should toggle selection
    const modifiedEvent = new Proxy(event, {
      get(target, prop) {
        console.log("[Canvas] get(target, prop) ", prop);
        if (prop === 'ctrlKey' || prop === 'metaKey') {
          return isModifierPressed;
        }
        return (target as any)[prop];
      }
    });
    console.log("[Canvas] modifiedEvent ", modifiedEvent);
    handlePointerDownOnElement(modifiedEvent as any, { id, type });
  });

  const [areaResize, setAreaResize] = useState<IAreaResize>({ id: "", dir: "none" });
  const [areaInitDimensions, setAreaInitDimensions] = useState<IAreaInitDimensions>({
    x: 0,
    y: 0,
    width: 0,
    height: 0,
  });

  const setElementPointerDown = useCallback((element: any, type: number) => (e: React.PointerEvent) => {
    if (e.defaultPrevented) return;
    elementPointerDown.current = {
      element,
      type,
    };
  }, []);

  // this is used to store the element that is clicked on
  // at the moment, and shouldn't be a part of the state
  const elementPointerDown = useRef<{ element: any; type: number } | null>(null);

  const [debugLogs, setDebugLogs] = useState(getDebugLogs());
  const [filterLine, setFilterLine] = useState<string>("");

  useEventListener("debug-console-update", (e: any) => {
    setDebugLogs([...e.detail]);
  });

  /**
   * @param {PointerEvent} e
   */
  const handlePointerMove = useCallback((e: React.PointerEvent | PointerEvent) => {
    if (selectedElement.open && !layout.sidebar) return;
    if (!('isPrimary' in e) || !e.isPrimary) return;

    if (handlePointerMovePanning()) return;
    if (layout.readOnly) return;
    if (handlePointerMoveLinking()) return;
    if (handlePointerMoveDragging()) return;

    if (areaResize.id !== "") return;

    updateSelection();
  }, [selectedElement.open, layout.sidebar, layout.readOnly, handlePointerMovePanning, handlePointerMoveLinking, handlePointerMoveDragging, areaResize.id, updateSelection]);

  /**
   * Handles the pointer down event on the SVG canvas.
   * Coordinates starting of selection, panning, or element interaction.
   *
   * @param e - Pointer down event.
   */
  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    if (!e.isPrimary) return;
    if (e.defaultPrevented) return;

    const isElementClick = elementPointerDown.current !== null;
    if (selectedElement.element === ObjectType.TABLE && selectedElement.open && !layout.sidebar && isElementClick) return;

    const isMouseLeftButton = e.button === 0;
    const isMouseMiddleButton = e.button === 1;

    if (linking) {
      if (isMouseLeftButton) {
        pointer.setStyle("crosshair");
        handleLinking();
        setLinking(false);
        pointer.setStyle("default");
      }
      elementPointerDown.current = null;
      return;
    }

    if (isMouseLeftButton) {
      if (elementPointerDown.current !== null) {
        handlePointerDownOnElement(e, elementPointerDown.current);
      } else {
        startSelection(e);
      }
      pointer.setStyle("crosshair");
    } else if (isMouseMiddleButton) {
      startPanning(pointer.spaces.screen);
    }
  }, [selectedElement.element, selectedElement.open, layout.sidebar, linking, pointer, handleLinking, setLinking, startSelection, handlePointerDownOnElement, startPanning]);

  /**
   * Handles the pointer up event on the SVG canvas.
   * Finalizes dragging, selection, or linking operations.
   *
   * @param e - Pointer up event.
   */
  const handlePointerUp = useCallback((e: React.PointerEvent) => {
    const startedOnElement = elementPointerDown.current !== null;
    if (selectedElement.open && !layout.sidebar && startedOnElement) return;
    if (!e.isPrimary) return;

    if (linking) {
      handleLinking();
      setLinking(false);
      pointer.setStyle("default");
      return;
    }

    finalizeDragging();

    if (finalizeSelection()) {
      const isClick =
        Math.abs(bulkSelectRect.x1 - pointer.spaces.diagram.x) < 5 &&
        Math.abs(bulkSelectRect.y1 - pointer.spaces.diagram.y) < 5;

      const isBackgroundClick = !startedOnElement;

      if (isClick && isBackgroundClick) {
        setSelectedElement((prev) => ({
          ...prev,
          element: ObjectType.NONE,
          id: "",
          open: false,
        }));
        setBulkSelectedElements([]);
        // Reset hovered and linking states when clicking on empty canvas
        setHoveredTable({ tableId: null, fieldId: null } as any);
        setLinking(false);
        setLinkingLine({
          startX: 0,
          startY: 0,
          endX: 0,
          endY: 0,
          startTableId: "",
          startFieldId: "",
        } as any);
      } else {
        collectSelectedElements();
      }
    }

    stopPanning();
    setAreaResize({ id: "", dir: "none" });
    elementPointerDown.current = null; // ensure cleared after click/drag cycle
    setAreaInitDimensions({
      x: 0,
      y: 0,
      width: 0,
      height: 0,
    });
  }, [selectedElement.open, layout.sidebar, linking, handleLinking, setLinking, pointer, finalizeDragging, finalizeSelection, bulkSelectRect, setSelectedElement, setBulkSelectedElements, collectSelectedElements, stopPanning]);

  const handleGripField = useCallback(() => {
    stopPanning();
    finalizeDragging();
    setLinking(true);
  }, [stopPanning, finalizeDragging, setLinking]);

  return (
    <div className="grow h-full touch-none" id="canvas">
      <div
        className="w-full h-full"
        style={{
          cursor: pointer.style,
          backgroundColor: settings.mode === "dark" ? THEME_CONFIG.DARK_BG : "white",
        }}
      >
        <svg
          id="diagram"
          ref={canvasRef}
          onPointerMove={handlePointerMove}
          onPointerDown={handlePointerDown}
          onPointerUp={handlePointerUp}
          className="absolute w-full h-full touch-none"
          viewBox={`${viewBox.left} ${viewBox.top} ${viewBox.width} ${viewBox.height}`}
        >
          <rect
            x={viewBox.left}
            y={viewBox.top}
            width={viewBox.width}
            height={viewBox.height}
            fill="transparent"
            pointerEvents="all"
          />
          <GridBackground show={settings.showGrid} viewBox={viewBox} />
          <RelationshipsLayer
            relationships={relationships}
            xorGroups={xorGroups}
            orGroups={orGroups}
            setElementPointerDown={setElementPointerDown}
          />
          <ObjectsLayer
            tables={tables}
            areas={areas}
            notes={notes}
            texts={texts}
            setElementPointerDown={setElementPointerDown}
            handleGripField={handleGripField}
            setAreaResizeCallback={setAreaResizeCallback}
            setAreaInitDimensionsCallback={setAreaInitDimensionsCallback}
          />
          <LinkingLayer
            linking={linking}
            linkingLine={linkingLine}
            tables={tables}
            pointer={pointer}
            hoveredTable={hoveredTable}
          />
          {bulkSelectRect.show && (
            <rect
              {...getRectFromEndpoints(bulkSelectRect)}
              stroke="grey"
              fill="grey"
              fillOpacity={0.15}
              strokeDasharray={10}
            />
          )}
        </svg>
      </div>
      <EditorSideSheets
        selectedElement={selectedElement}
        setSelectedElement={setSelectedElement}
        xorGroups={xorGroups}
        orGroups={orGroups}
        layout={layout}
      />
      <DebugOverlays
        showDebugCoordinates={settings.showDebugCoordinates}
        showDebugConsole={settings.showDebugConsole}
        transform={transform}
        viewBox={viewBox}
        pointer={pointer}
        debugLogs={debugLogs}
        filterLine={filterLine}
        setFilterLine={setFilterLine}
        setSettings={setSettings}
      />
    </div>
  );
}
