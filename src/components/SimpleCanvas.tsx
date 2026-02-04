/**
 * SimpleCanvas.tsx
 * 
 * To jest uproszczona, lekka wersja płótna (canvas) edytora, stworzona specjalnie na potrzeby
 * strony lądowania (Landing Page).
 * 
 * Różnice względem głównego edytora:
 * - Brak zaawansowanego zarządzania stanem (Undo/Redo, Contexts).
 * - Obsługuje tylko podstawowe renderowanie tabel i relacji.
 * - Nie zawiera narzędzi do edycji (dodawanie tabel, edycja pól, obszary, notatki).
 * - Idealny do prezentacji interaktywnych schematów bez obciążania strony pełnym kodem edytora.
 */

import { useEffect, useState, useRef, useMemo } from "react";
import {
  ObjectType,
  tableColorStripHeight,
  tableFieldHeight,
  tableHeaderHeight,
  tableWidth,
  Tab,
  State,
} from "../data/constants";
import { SimpleCanvasProps, ITable, IRelationship } from "../types";
import OriginalRelationship from "./EditorCanvas/Relationship";
import OriginalTable from "./EditorCanvas/Table";
import { DiagramContext } from "../context/DiagramContext";
import { SettingsContext } from "../context/SettingsContext";
import { LayoutContext } from "../context/LayoutContext";
import { SelectContext } from "../context/SelectContext";
import { CanvasContext } from "../context/CanvasContext";
import { UndoRedoContext } from "../context/UndoRedoContext";
import { SaveStateContext } from "../context/SaveStateContext";
import { TransformContext } from "../context/TransformContext";

function SimpleRelationshipWrapper({
  relationship,
  tables,
  mode = "light",
  relationshipStyle = "default",
}: {
  relationship: IRelationship;
  tables: ITable[];
  mode?: "light" | "dark";
  relationshipStyle?: "default" | "erd";
}) {
  const diagramContextValue = useMemo(
    () => ({
      tables,
      relationships: [relationship],
      setTables: () => {},
      addTable: () => {},
      updateTable: () => {},
      updateField: () => {},
      deleteField: () => {},
      deleteTable: () => {},
      setRelationships: () => {},
      addRelationship: () => {},
      deleteRelationship: () => {},
      updateRelationship: () => {},
      xorGroups: [],
      setXorGroups: () => {},
      addXorGroup: () => {},
      deleteXorGroup: () => {},
      updateXorGroup: () => {},
      orGroups: [],
      setOrGroups: () => {},
      addOrGroup: () => {},
      deleteOrGroup: () => {},
      updateOrGroup: () => {},
      convertXorToOr: () => {},
      convertOrToXor: () => {},
      database: "generic",
      setDatabase: () => {},
      tablesCount: tables.length,
      relationshipsCount: 1,
      linking: false,
      setLinking: () => {},
      linkingLine: {
        startX: 0,
        startY: 0,
        endX: 0,
        endY: 0,
        startTableId: "",
        startFieldId: "",
      },
      setLinkingLine: () => {},
      hoveredTable: { tableId: null, fieldId: null },
      setHoveredTable: () => {},
    }),
    [relationship, tables]
  );

  const settingsContextValue = useMemo(
    () => ({
      settings: {
        strictMode: false,
        showFieldSummary: true,
        showGrid: true,
        snapToGrid: false,
        showDataTypes: true,
        mode: mode,
        autosave: false,
        showCardinality: true,
        relationshipStyle: relationshipStyle,
        showRelationshipLabels: true,
        tableWidth: tableWidth,
        showDebugCoordinates: false,
        tableNamesUppercase: false,
        showPKIcons: false,
        showFKIcons: false,
        sideMargin: 20,
        spreadRelations: false,
        tableColors: [],
        outboundRelationsInTableColor: false,
        relationAnimationsInTableColor: false,
        settingsPosition: { x: 0, y: 0 },
      },
      setSettings: () => {},
    }),
    [mode, relationshipStyle]
  );

  const layoutContextValue = useMemo(
    () => ({
      layout: {
        header: false,
        sidebar: false,
        issues: false,
        toolbar: false,
        dbmlEditor: false,
        readOnly: true,
      },
      setLayout: () => {},
    }),
    []
  );

  const selectContextValue = useMemo(
    () => ({
      selectedElement: {
        element: ObjectType.NONE,
        id: "",
        openDialogue: false,
        openCollapse: false,
        currentTab: Tab.TABLES,
        open: false,
      },
      setSelectedElement: () => {},
      bulkSelectedElements: [],
      setBulkSelectedElements: () => {},
    }),
    []
  );

  const canvasContextValue = useMemo(
    () => ({
      canvas: {
        screenSize: { x: 0, y: 0 },
        viewBox: new DOMRect(),
      },
      coords: {
        toDiagramSpace: (coords: any) => coords,
        toScreenSpace: (coords: any) => coords,
      },
      pointer: {
        spaces: {
          screen: { x: 0, y: 0 },
          diagram: { x: 0, y: 0 },
        },
        style: "default",
        setStyle: () => {},
      },
    }),
    []
  );

  const undoRedoContextValue = useMemo(
    () => ({
      undoStack: [],
      setUndoStack: () => {},
      redoStack: [],
      setRedoStack: () => {},
    }),
    []
  );

  return (
    <DiagramContext.Provider value={diagramContextValue as any}>
      <SettingsContext.Provider value={settingsContextValue as any}>
        <LayoutContext.Provider value={layoutContextValue as any}>
          <SelectContext.Provider value={selectContextValue as any}>
            <CanvasContext.Provider value={canvasContextValue as any}>
              <UndoRedoContext.Provider value={undoRedoContextValue as any}>
                <OriginalRelationship
                  data={relationship}
                  onPointerDown={() => {}}
                />
              </UndoRedoContext.Provider>
            </CanvasContext.Provider>
          </SelectContext.Provider>
        </LayoutContext.Provider>
      </SettingsContext.Provider>
    </DiagramContext.Provider>
  );
}

function SimpleTableWrapper({
  table,
  grab,
  mode = "light",
  zoom,
  pan,
}: {
  table: ITable;
  grab: (e: React.PointerEvent) => void;
  mode?: "light" | "dark";
  zoom: number;
  pan: { x: number; y: number };
}) {
  const diagramContextValue = useMemo(
    () => ({
      tables: [table],
      relationships: [],
      setTables: () => {},
      addTable: () => {},
      updateTable: () => {},
      updateField: () => {},
      deleteField: () => {},
      deleteTable: () => {},
      setRelationships: () => {},
      addRelationship: () => {},
      deleteRelationship: () => {},
      updateRelationship: () => {},
      xorGroups: [],
      setXorGroups: () => {},
      addXorGroup: () => {},
      deleteXorGroup: () => {},
      updateXorGroup: () => {},
      orGroups: [],
      setOrGroups: () => {},
      addOrGroup: () => {},
      deleteOrGroup: () => {},
      updateOrGroup: () => {},
      convertXorToOr: () => {},
      convertOrToXor: () => {},
      database: "generic",
      setDatabase: () => {},
      tablesCount: 1,
      relationshipsCount: 0,
      linking: false,
      setLinking: () => {},
      linkingLine: {
        startX: 0,
        startY: 0,
        endX: 0,
        endY: 0,
        startTableId: "",
        startFieldId: "",
      },
      setLinkingLine: () => {},
      hoveredTable: { tableId: null, fieldId: null },
      setHoveredTable: () => {},
    }),
    [table]
  );

  const settingsContextValue = useMemo(
    () => ({
      settings: {
        strictMode: false,
        showFieldSummary: true,
        showGrid: true,
        snapToGrid: false,
        showDataTypes: true,
        mode: mode,
        autosave: false,
        showCardinality: true,
        relationshipStyle: "default",
        showRelationshipLabels: true,
        tableWidth: tableWidth,
        showDebugCoordinates: false,
        tableNamesUppercase: false,
        showPKIcons: true,
        showFKIcons: true,
        sideMargin: 20,
        spreadRelations: false,
        tableColors: [],
        outboundRelationsInTableColor: false,
        relationAnimationsInTableColor: false,
        settingsPosition: { x: 0, y: 0 },
      },
      setSettings: () => {},
    }),
    [mode]
  );

  const layoutContextValue = useMemo(
    () => ({
      layout: {
        header: false,
        sidebar: false,
        issues: false,
        toolbar: false,
        dbmlEditor: false,
        readOnly: true,
      },
      setLayout: () => {},
    }),
    []
  );

  const selectContextValue = useMemo(
    () => ({
      selectedElement: {
        element: ObjectType.NONE,
        id: "",
        openDialogue: false,
        openCollapse: false,
        currentTab: Tab.TABLES,
        open: false,
      },
      setSelectedElement: () => {},
      bulkSelectedElements: [],
      setBulkSelectedElements: () => {},
    }),
    []
  );

  const canvasContextValue = useMemo(
    () => ({
      canvas: {
        screenSize: { x: 0, y: 0 },
        viewBox: new DOMRect(),
      },
      coords: {
        toDiagramSpace: (coords: any) => coords,
        toScreenSpace: (coords: any) => coords,
      },
      pointer: {
        spaces: {
          screen: { x: 0, y: 0 },
          diagram: { x: 0, y: 0 },
        },
        style: "default",
        setStyle: () => {},
      },
    }),
    []
  );

  const undoRedoContextValue = useMemo(
    () => ({
      undoStack: [],
      setUndoStack: () => {},
      redoStack: [],
      setRedoStack: () => {},
    }),
    []
  );

  const saveStateContextValue = useMemo(
    () => ({
      saveState: State.NONE,
      setSaveState: () => {},
    }),
    []
  );

  const transformContextValue = useMemo(
    () => ({
      transform: { zoom: zoom, pan: pan },
      setTransform: () => {},
    }),
    [zoom, pan]
  );

  return (
    <DiagramContext.Provider value={diagramContextValue as any}>
      <SettingsContext.Provider value={settingsContextValue as any}>
        <LayoutContext.Provider value={layoutContextValue as any}>
          <SelectContext.Provider value={selectContextValue as any}>
            <CanvasContext.Provider value={canvasContextValue as any}>
              <UndoRedoContext.Provider value={undoRedoContextValue as any}>
                <SaveStateContext.Provider value={saveStateContextValue as any}>
                  <TransformContext.Provider value={transformContextValue as any}>
                    <OriginalTable
                      tableData={table}
                      onPointerDown={grab}
                      handleGripField={() => {}}
                    />
                  </TransformContext.Provider>
                </SaveStateContext.Provider>
              </UndoRedoContext.Provider>
            </CanvasContext.Provider>
          </SelectContext.Provider>
        </LayoutContext.Provider>
      </SettingsContext.Provider>
    </DiagramContext.Provider>
  );
}


export default function SimpleCanvas({
  diagram,
  zoom: initialZoom,
  mode = "light",
  relationshipStyle = "default",
  autoCenter = false,
  x: initialX = 0,
  y: initialY = 0,
  padding: customPadding,
}: {
  diagram: any;
  zoom: number;
  mode?: "light" | "dark";
  relationshipStyle?: "default" | "erd";
  autoCenter?: boolean;
  x?: number;
  y?: number;
  padding?: number;
}) {
  const [tables, setTables] = useState(diagram.tables);
  const [dragging, setDragging] = useState(-1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [viewBox, setViewBox] = useState({ x: initialX, y: initialY, zoom: initialZoom });
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    setTables(diagram.tables);
  }, [diagram]);

  useEffect(() => {
    const handleAutoCenter = () => {
      if (autoCenter && svgRef.current) {
        const padding = customPadding ?? 50;
        let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;

        tables.forEach((t: any) => {
          minX = Math.min(minX, t.x);
          minY = Math.min(minY, t.y);
          const height = t.height || (t.fields.length * tableFieldHeight +
            tableHeaderHeight +
            tableColorStripHeight +
            4);
          maxX = Math.max(maxX, t.x + (t.width || tableWidth));
          maxY = Math.max(maxY, t.y + height);
        });

        const diagramWidth = maxX - minX;
        
        const svgWidth = svgRef.current.clientWidth;
        const svgHeight = svgRef.current.clientHeight;

        if (svgWidth > 0 && svgHeight > 0) {
          const zoomX = (svgWidth - padding * 2) / diagramWidth;
          const diagramHeight = maxY - minY;
          const zoomY = (svgHeight - padding * 2) / diagramHeight;
          const newZoom = Math.min(zoomX, zoomY, 1.0);

          const centerX = (svgWidth - diagramWidth * newZoom) / 2 - minX * newZoom;
          const topY = padding - minY * newZoom;

          setViewBox({ x: centerX, y: topY, zoom: newZoom });
        }
      }
    };

    handleAutoCenter();
    window.addEventListener('resize', handleAutoCenter);
    return () => window.removeEventListener('resize', handleAutoCenter);
  }, [autoCenter, tables, customPadding]);

  const grabTable = (e: any, id: number) => {
    setDragging(id);
    setOffset({
      x: e.clientX - tables[id].x,
      y: e.clientY - tables[id].y,
    });
  };

  const onPointerMove = (e: any) => {
    if (dragging !== -1) {
      const dx = e.clientX - offset.x;
      const dy = e.clientY - offset.y;
      setTables((prev: any[]) =>
        prev.map((table, i) =>
          i === dragging ? { ...table, x: dx, y: dy } : table
        )
      );
    }
  };

  const release = () => {
    setDragging(-1);
    setOffset({ x: 0, y: 0 });
  };

  const isDark = mode === "dark";

  return (
    <svg
      ref={svgRef}
      className={`w-full h-full cursor-grab rounded-3xl ${isDark ? "bg-zinc-950" : ""}`}
      onPointerUp={(e) => e.isPrimary && release()}
      onPointerMove={(e) => e.isPrimary && onPointerMove(e)}
      onPointerLeave={(e) => e.isPrimary && release()}
    >
      <defs>
        <pattern
          id="pattern-circles"
          x={viewBox.x}
          y={viewBox.y}
          width={22 * viewBox.zoom}
          height={22 * viewBox.zoom}
          patternUnits="userSpaceOnUse"
          patternContentUnits="userSpaceOnUse"
        >
          <circle
            id="pattern-circle"
            cx={4 * viewBox.zoom}
            cy={4 * viewBox.zoom}
            r={0.85 * viewBox.zoom}
            fill={isDark ? "rgba(255, 255, 255, 0.2)" : "rgb(99, 152, 191)"}
          ></circle>
        </pattern>
      </defs>
      <rect
        x="0"
        y="0"
        width="100%"
        height="100%"
        fill="url(#pattern-circles)"
      ></rect>
      <g
        style={{
          transform: `translate(${viewBox.x}px, ${viewBox.y}px) scale(${viewBox.zoom})`,
          transformOrigin: "0 0",
        }}
      >
        {(diagram.relationships || diagram.references || []).map((r: any, i: number) => (
          <SimpleRelationshipWrapper
            key={i}
            relationship={r}
            tables={tables}
            mode={mode}
            relationshipStyle={relationshipStyle}
          />
        ))}
        {(tables || []).map((t: any, i: number) => (
          <SimpleTableWrapper
            key={i}
            table={t}
            grab={(e) => grabTable(e, i)}
            mode={mode}
            zoom={viewBox.zoom}
            pan={{ x: viewBox.x, y: viewBox.y }}
          />
        ))}
      </g>
    </svg>
  );
}
