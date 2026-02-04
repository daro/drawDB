import { useRef, useState } from "react";
import {
  Action,
  Cardinality,
  Constraint,
  darkBgTheme,
  ObjectType,
  gridSize,
  gridCircleRadius,
  minAreaSize,
  tableFieldHeight,
  tableHeaderHeight,
  tableColorStripHeight,
} from "../../data/constants";
import { Toast } from "@douyinfe/semi-ui";
import Table from "./Table";
import Area from "./Area";
import Relationship from "./Relationship";
import XorGroup from "./XorGroup";
import OrGroup from "./OrGroup";
import XorGroupInfo from "../EditorSidePanel/RelationshipsTab/XorGroupInfo";
import OrGroupInfo from "../EditorSidePanel/RelationshipsTab/OrGroupInfo";
import Note from "./Note";
import Text from "./Text";
import { SideSheet } from "@douyinfe/semi-ui";
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
} from "../../hooks";
import { IRelationship, IWaypoint, ITable, RelationshipProps } from "../../types";
import { useTranslation } from "react-i18next";
import { useEventListener } from "usehooks-ts";
import { areFieldsCompatible, getTableHeight } from "../../utils/utils";
import { getRectFromEndpoints, isInsideRect, isPointInsideRect } from "../../utils/rect";
import { State, noteWidth } from "../../data/constants";
import { nanoid } from "nanoid";
import { IDragging, IPanning, IAreaResize, IAreaInitDimensions } from "../../types";

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
    database,
    xorGroups,
    orGroups,
    linking,
    setLinking,
    linkingLine,
    setLinkingLine,
    hoveredTable,
    setHoveredTable,
  } = useDiagram();
  const { texts, updateText } = useTexts();
  const { setSaveState } = useSaveState();
  const { areas, updateArea } = useAreas();
  const { notes, updateNote } = useNotes();
  const { layout } = useLayout();
  const { settings } = useSettings();
  const { setUndoStack, setRedoStack } = useUndoRedo();
  const { transform, setTransform } = useTransform();
  const {
    selectedElement,
    setSelectedElement,
    bulkSelectedElements,
    setBulkSelectedElements,
  } = useSelect();
  const notDragging: IDragging = {
    id: "",
    type: ObjectType.NONE,
    grabOffset: { x: 0, y: 0 },
  };
  const [dragging, setDragging] = useState<IDragging>(notDragging);
  const [panning, setPanning] = useState<IPanning>({
    isPanning: false,
    panStart: { x: 0, y: 0 },
    cursorStart: { x: 0, y: 0 },
  });
  const [areaResize, setAreaResize] = useState<IAreaResize>({ id: "", dir: "none" });
  const [areaInitDimensions, setAreaInitDimensions] = useState<IAreaInitDimensions>({
    x: 0,
    y: 0,
    width: 0,
    height: 0,
  });
  const [bulkSelectRect, setBulkSelectRect] = useState({
    x1: 0,
    y1: 0,
    x2: 0,
    y2: 0,
    show: false,
    ctrlKey: false,
    metaKey: false,
  });
  // this is used to store the element that is clicked on
  // at the moment, and shouldn't be a part of the state
  let elementPointerDown = null;

  const isSameElement = (el1, el2) => {
    return el1.id === el2.id && el1.type === el2.type;
  };

  const collectSelectedElements = () => {
    const rect = getRectFromEndpoints(bulkSelectRect);
    const elements = [];
    const shouldAddElement = (elementRect, element) => {
      // if ctrl key is pressed, only add the elements that are not already selected
      // can theoretically be optimized later if the selected elements is
      // a map from id to element (after the ids are made unique)
      return (
        isInsideRect(elementRect, rect) &&
        ((!bulkSelectRect.ctrlKey && !bulkSelectRect.metaKey) ||
          !bulkSelectedElements.some((el) => isSameElement(el, element)))
      );
    };


    tables.forEach((table) => {
      if (table.locked) return;

      const element = {
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

      const element = {
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

      const element = {
        id: note.id,
        type: ObjectType.NOTE,
        currentCoords: { x: note.x, y: note.y },
        initialCoords: { x: note.x, y: note.y },
      };
      const noteRect = {
        x: note.x,
        y: note.y,
        width: note.width ?? noteWidth,
        height: note.height,
      };
      if (shouldAddElement(noteRect, element)) {
        elements.push(element);
      }
    });
    
    texts.forEach((text) => {
      if (text.locked) return;

      const element = {
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
  };

  const handlePointerDownOnElement = (e, { element, type }) => {
    if (selectedElement.open && !layout.sidebar) return;

    if (!e.isPrimary) return;

    if (!element.locked || !(e.ctrlKey || e.metaKey)) {
      setSelectedElement((prev) => ({
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

    setBulkSelectRect((prev) => ({
      ...prev,
      show: false,
    }));

    // this is the object that will be added to the bulk selected elements
    // if necessary
    const elementInBulk = {
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
          setSelectedElement({
            ...selectedElement,
            element: ObjectType.NONE,
            id: "",
            open: false,
          });
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
  };

  const coordinatesAfterSnappingToGrid = ({ x, y }: { x: number; y: number }) => {
    if (settings.snapToGrid) {
      return {
        x: Math.round(x / gridSize) * gridSize,
        y: Math.round(y / gridSize) * gridSize,
      };
    }
    return { x, y };
  };

  /**
   * @param {PointerEvent} e
   */
  const handlePointerMove = (e: any) => {
    if (selectedElement.open && !layout.sidebar) return;

    if (!e.isPrimary) return;

    if (panning.isPanning) {
      setTransform((prev) => ({
        ...prev,
        pan: {
          x:
            panning.panStart.x +
            (panning.cursorStart.x - pointer.spaces.screen.x!) / transform.zoom,
          y:
            panning.panStart.y +
            (panning.cursorStart.y - pointer.spaces.screen.y!) / transform.zoom,
        },
      }));
      return;
    }

    if (layout.readOnly) return;

  if (linking) {
    if (linkingLine.startFieldId !== "") {
      setLinkingLine((prev) => ({
        ...prev,
        endX: pointer.spaces.diagram.x!,
        endY: pointer.spaces.diagram.y!,
      }));
    } else {
      const table = tables.find((t) =>
        isPointInsideRect(
          { x: pointer.spaces.diagram.x!, y: pointer.spaces.diagram.y! },
          {
            x: t.x - 10,
            y: t.y - 10,
            width: t.width + 20,
            height: (t.height || 0) + 20,
          },
        ),
      );
      if (table) {
        setHoveredTable({ tableId: table.id, fieldId: null });
      } else {
        setHoveredTable({ tableId: null, fieldId: null });
      }
      setLinkingLine((prev) => ({
        ...prev,
        endX: pointer.spaces.diagram.x!,
        endY: pointer.spaces.diagram.y!,
      }));
    }
    pointer.setStyle("crosshair");
    return;
  }

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
        return;
      }

      const { currentCoords } = elementInBulk;

      const deltaX = mainElementFinalX - currentCoords.x;
      const deltaY = mainElementFinalY - currentCoords.y;

      if (deltaX === 0 && deltaY === 0) return;

      const newBulkSelectedElements = [];
      bulkSelectedElements.forEach((el) => {
        const elementFinalCoords = {
          x: el.currentCoords.x + deltaX,
          y: el.currentCoords.y + deltaY,
        };
        if (el.type === ObjectType.TABLE) {
          const table = tables.find((t) => t.id === el.id);
          let finalX = elementFinalCoords.x;
          let finalY = elementFinalCoords.y;

          if (table?.supertypeId) {
            const supertype = tables.find((t) => t.id === table.supertypeId);
            if (supertype) {
              const baseHeight =
                supertype.fields.length * tableFieldHeight +
                tableHeaderHeight +
                tableColorStripHeight;

              const minX = supertype.x + 10;
              const maxX = supertype.x + supertype.width - table.width - 10;
              const minY = supertype.y + baseHeight;

              finalX = Math.max(minX, Math.min(finalX, maxX));
              finalY = Math.max(minY, finalY);

              // Update height of supertype if we moved the subtype and it's near the bottom
              const newHeight = getTableHeight(
                supertype,
                tables
                  .filter((t) => t.supertypeId === supertype.id)
                  .map((t) => (t.id === table.id ? { ...t, x: finalX, y: finalY } : t)),
              );
              updateTable(supertype.id, { height: newHeight }, false);
            }
          }

          const moveDeltaX = finalX - el.currentCoords.x;
          const moveDeltaY = finalY - el.currentCoords.y;

          updateTable(el.id, { x: finalX, y: finalY });

          const subtypes = tables.filter((t) => t.supertypeId === el.id);
          subtypes.forEach((st) => {
            updateTable(st.id, {
              x: st.x + moveDeltaX,
              y: st.y + moveDeltaY,
            });
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
      return;
    }

    if (areaResize.id !== "") {
      if (areaResize.dir === "none") return;
      const newDims = { ...areaInitDimensions };
      setPanning((old) => ({ ...old, isPanning: false }));
      const { x, y } = coordinatesAfterSnappingToGrid({
        x: pointer.spaces.diagram.x!,
        y: pointer.spaces.diagram.y!,
      });

      switch (areaResize.dir) {
        case "br":
          newDims.width = x - areaInitDimensions.x;
          newDims.height = y - areaInitDimensions.y;
          break;
        case "tl":
          newDims.x = x;
          newDims.y = y;
          newDims.width = areaInitDimensions.width - (x - areaInitDimensions.x);
          newDims.height =
            areaInitDimensions.height - (y - areaInitDimensions.y);
          break;
        case "tr":
          newDims.y = y;
          newDims.width = x - areaInitDimensions.x;
          newDims.height =
            areaInitDimensions.height - (y - areaInitDimensions.y);
          break;
        case "bl":
          newDims.x = x;
          newDims.width = areaInitDimensions.width - (x - areaInitDimensions.x);
          newDims.height = y - areaInitDimensions.y;
          break;
      }

      if (newDims.width <= minAreaSize) {
        newDims.width = minAreaSize;
        if (areaResize.dir === "tl" || areaResize.dir === "bl") {
          newDims.x =
            areaInitDimensions.x + areaInitDimensions.width - minAreaSize;
        }
      }

      if (newDims.height <= minAreaSize) {
        newDims.height = minAreaSize;
        if (areaResize.dir === "tl" || areaResize.dir === "tr") {
          newDims.y =
            areaInitDimensions.y + areaInitDimensions.height - minAreaSize;
        }
      }

      updateArea(areaResize.id, { ...newDims });
      return;
    }

    if (bulkSelectRect.show) {
      setBulkSelectRect((prev) => ({
        ...prev,
        x2: pointer.spaces.diagram.x,
        y2: pointer.spaces.diagram.y,
      }));
    }
  };

  /**
   * @param {PointerEvent} e
   */
  const handlePointerDown = (e) => {
    if (!e.isPrimary) return;

    if (e.defaultPrevented) return;

    // don't pan if the sidesheet for editing a table is open
    if (
      selectedElement.element === ObjectType.TABLE &&
      selectedElement.open &&
      !layout.sidebar
    )
      return;

    const isMouseLeftButton = e.button === 0;
    const isMouseMiddleButton = e.button === 1;

    if (linking) {
      if (isMouseLeftButton) {
        pointer.setStyle("crosshair");
        handleLinking();
        setLinking(false);
        pointer.setStyle("default");
      }
      elementPointerDown = null;
      return;
    }

    if (isMouseLeftButton) {
      setBulkSelectRect({
        x1: pointer.spaces.diagram.x,
        y1: pointer.spaces.diagram.y,
        x2: pointer.spaces.diagram.x,
        y2: pointer.spaces.diagram.y,
        show: elementPointerDown === null || !elementPointerDown.element.locked,
        ctrlKey: e.ctrlKey,
        metaKey: e.metaKey,
      });
      if (elementPointerDown !== null) {
        handlePointerDownOnElement(e, elementPointerDown);
      }
      pointer.setStyle("crosshair");
    } else if (isMouseMiddleButton) {
      setPanning({
        isPanning: true,
        panStart: transform.pan,
        // Diagram space depends on the current panning.
        // Use screen space to avoid circular dependencies and undefined behavior.
        cursorStart: pointer.spaces.screen,
      });
      pointer.setStyle("grabbing");
    }
  };

  const isDragging = () => {
    return dragging.type !== ObjectType.NONE && dragging.id !== "";
  };

  const didDrag = () => {
    if (!isDragging()) return false;
    // checking any element is sufficient
    const { currentCoords, initialCoords } = bulkSelectedElements[0];
    return (
      currentCoords.x !== initialCoords.x || currentCoords.y !== initialCoords.y
    );
  };

  const didResize = (id) => {
    return !(
      areas[id].x === areaInitDimensions.x &&
      areas[id].y === areaInitDimensions.y &&
      areas[id].width === areaInitDimensions.width &&
      areas[id].height === areaInitDimensions.height
    );
  };

  const didPan = () =>
    !(
      transform.pan.x === panning.panStart.x &&
      transform.pan.y === panning.panStart.y
    );

  /**
   * @param {PointerEvent} e
   */
  const handlePointerUp = (e) => {
    if (selectedElement.open && !layout.sidebar) return;

    if (!e.isPrimary) return;

    if (linking) {
      if (linkingLine.startFieldId !== "") {
        handleLinking();
        setLinking(false);
        pointer.setStyle("default");
      }
      return;
    }

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
      setBulkSelectedElements((prev) =>
        prev.map((el) => ({
          ...el,
          initialCoords: { ...el.currentCoords },
        })),
      );
    }

    if (bulkSelectRect.show) {
      setBulkSelectRect((prev) => ({
        ...prev,
        x2: pointer.spaces.diagram.x,
        y2: pointer.spaces.diagram.y,
        show: false,
      }));
      if (!isDragging()) {
        const isClick =
          Math.abs(bulkSelectRect.x1 - pointer.spaces.diagram.x) < 2 &&
          Math.abs(bulkSelectRect.y1 - pointer.spaces.diagram.y) < 2;

        if (isClick && elementPointerDown === null) {
          setSelectedElement((prev) => ({
            ...prev,
            element: ObjectType.NONE,
            id: "",
            open: false,
          }));
          setBulkSelectedElements([]);
        } else {
          collectSelectedElements();
        }
      }
    }
    setDragging(notDragging);

    if (panning.isPanning && didPan()) {
      setSaveState(State.SAVING);
    }
    setPanning((old) => ({ ...old, isPanning: false }));
    pointer.setStyle("default");

    if (areaResize.id !== "" && didResize(areaResize.id)) {
      setUndoStack((prev: any) => [
        ...prev,
        {
          action: Action.EDIT,
          element: ObjectType.AREA,
          aid: areaResize.id,
          undo: {
            ...areas.find(a => a.id === areaResize.id),
            x: areaInitDimensions.x,
            y: areaInitDimensions.y,
            width: areaInitDimensions.width,
            height: areaInitDimensions.height,
          },
          redo: areas.find(a => a.id === areaResize.id),
          message: t("edit_area", {
            areaName: areas.find(a => a.id === areaResize.id)?.name,
            extra: "[resize]",
          }),
        },
      ]);
      setRedoStack([]);
    }
    setAreaResize({ id: "", dir: "none" });
    setAreaInitDimensions({
      x: 0,
      y: 0,
      width: 0,
      height: 0,
    });
  };

  const handleGripField = () => {
    setPanning((old) => ({ ...old, isPanning: false }));
    setDragging(notDragging);
    setLinking(true);
  };

  const getCardinality = (startField, endField) => {
    const startIsUnique = startField.unique || startField.primary;
    const endIsUnique = endField.unique || endField.primary;

    if (startIsUnique && endIsUnique) {
      return Cardinality.ONE_TO_ONE;
    }

    if (startIsUnique && !endIsUnique) {
      return Cardinality.ONE_TO_MANY;
    }

    if (!startIsUnique && endIsUnique) {
      return Cardinality.MANY_TO_ONE;
    }

    return Cardinality.ONE_TO_ONE;
  };

  const handleLinking = () => {
    if (hoveredTable.tableId === null) {
      if (linkingLine.startFieldId === "") {
        Toast.info("Click on a table to assign it as supertype");
      }
      return;
    }

    if (linkingLine.startFieldId === "") {
      // Supertype linking
      const subtypeId = linkingLine.startTableId;
      const supertypeId = hoveredTable.tableId;

      if (subtypeId === supertypeId) return;

      const subtype = tables.find((t) => t.id === subtypeId);
      const supertype = tables.find((t) => t.id === supertypeId);

      if (!subtype || !supertype) return;

      // Ensure no cycles and only 1 level
      if (supertype.supertypeId) {
        Toast.info("A subtype cannot be a supertype");
        return;
      }

      setUndoStack((prev) => [
        ...prev,
        {
          action: Action.EDIT,
          element: ObjectType.TABLE,
          tid: subtypeId,
          undo: {
            supertypeId: subtype.supertypeId,
            x: subtype.x,
            y: subtype.y,
          },
          redo: {
            supertypeId: supertypeId,
            x: supertype.x + 20,
            y:
              supertype.y +
              supertype.fields.length * tableFieldHeight +
              tableHeaderHeight +
              tableColorStripHeight +
              10,
          },
          message: t("edit_table", {
            tableName: subtype.name,
            extra: "[supertype]",
          }),
        },
      ]);
      setRedoStack([]);

      const baseHeight =
        supertype.fields.length * tableFieldHeight +
        tableHeaderHeight +
        tableColorStripHeight;
      const newX = supertype.x + 20;
      const newY = supertype.y + baseHeight + 10;

      const updatedSubtype = {
        ...subtype,
        supertypeId: supertypeId,
        x: newX,
        y: newY,
      };

      const updatedTables = tables.map((t) =>
        t.id === subtypeId ? updatedSubtype : t,
      );

      const newHeight = getTableHeight(
        supertype,
        updatedTables.filter((t) => t.supertypeId === supertypeId),
      );

      setTables((prev) =>
        prev.map((t) => {
          if (t.id === subtypeId) return updatedSubtype;
          if (t.id === supertypeId) return { ...t, height: newHeight };
          return t;
        }),
      );

      return;
    }

    if (hoveredTable.fieldId === null) return;

    const { fields: startTableFields, name: startTableName } = tables.find(
      (t) => t.id === linkingLine.startTableId,
    );
    const startField = startTableFields.find(
      (f) => f.id === linkingLine.startFieldId,
    );
    const { fields: endTableFields, name: endTableName } = tables.find(
      (t) => t.id === hoveredTable.tableId,
    );
    const endField = endTableFields.find((f) => f.id === hoveredTable.fieldId);

    if (!areFieldsCompatible(database, startField.type, endField.type)) {
      Toast.info(t("cannot_connect"));
      return;
    }
    if (
      linkingLine.startTableId === hoveredTable.tableId &&
      linkingLine.startFieldId === hoveredTable.fieldId
    )
      return;

    const cardinality = getCardinality(startField, endField);

    const newRelationship: any = {
      id: nanoid(),
      name: `fk_${startTableName}_${startField.name}_${endTableName}`,
      startTableId: linkingLine.startTableId,
      startFieldId: linkingLine.startFieldId,
      endTableId: hoveredTable.tableId,
      endFieldId: hoveredTable.fieldId,
      cardinality,
      updateConstraint: Constraint.NONE,
      deleteConstraint: Constraint.NONE,
      identifying: startField.primary && endField.primary,
    };
    addRelationship(newRelationship);
  };

  useEventListener(
    "wheel",
    (e) => {
      e.preventDefault();

      if (e.ctrlKey || e.metaKey) {
        // How "eager" the viewport is to
        // center the cursor's coordinates
        const eagernessFactor = 0.05;
        setTransform((prev) => ({
          pan: {
            x:
              prev.pan.x -
              (pointer.spaces.diagram.x - prev.pan.x) *
              eagernessFactor *
              Math.sign(e.deltaY),
            y:
              prev.pan.y -
              (pointer.spaces.diagram.y - prev.pan.y) *
              eagernessFactor *
              Math.sign(e.deltaY),
          },
          zoom: e.deltaY <= 0 ? prev.zoom * 1.05 : prev.zoom / 1.05,
        }));
      } else if (e.shiftKey) {
        setTransform((prev) => ({
          ...prev,
          pan: {
            ...prev.pan,
            x: prev.pan.x + e.deltaY / prev.zoom,
          },
        }));
      } else {
        setTransform((prev) => ({
          ...prev,
          pan: {
            x: prev.pan.x + e.deltaX / prev.zoom,
            y: prev.pan.y + e.deltaY / prev.zoom,
          },
        }));
      }
    },
    canvasRef,
    { passive: false },
  );

  return (
    <div className="grow h-full touch-none" id="canvas">
      <div
        className="w-full h-full"
        style={{
          cursor: pointer.style,
          backgroundColor: settings.mode === "dark" ? darkBgTheme : "white",
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
          {settings.showGrid && (
            <>
              <defs>
                <pattern
                  id="pattern-grid"
                  x={-gridCircleRadius}
                  y={-gridCircleRadius}
                  width={gridSize}
                  height={gridSize}
                  patternUnits="userSpaceOnUse"
                  patternContentUnits="userSpaceOnUse"
                >
                  <circle
                    cx={gridCircleRadius}
                    cy={gridCircleRadius}
                    r={gridCircleRadius}
                    fill="rgb(99, 152, 191)"
                    opacity="1"
                  />
                </pattern>
              </defs>
              <rect
                x={viewBox.left}
                y={viewBox.top}
                width={viewBox.width}
                height={viewBox.height}
                fill="url(#pattern-grid)"
              />
            </>
          )}
          {areas.map((a) => {
            if (!a) return null;
            return (
              <Area
                key={a.id}
                data={a}
                setResize={setAreaResize}
                setInitDimensions={setAreaInitDimensions}
                onPointerDown={(e) => {
                  if (e.defaultPrevented) return;
                  elementPointerDown = {
                    element: a,
                    type: ObjectType.AREA,
                  };
                }}
              />
            );
          })}
          {relationships.map((rel) => {
            if (!rel) return null;
            return (
              <Relationship
                key={rel.id}
                data={rel}
                onPointerDown={(e) => {
                  if (e.defaultPrevented) return;
                  elementPointerDown = {
                    element: rel,
                    type: ObjectType.RELATIONSHIP,
                  };
                }}
              />
            );
          })}
          {xorGroups.map((group) => {
            if (!group) return null;
            return (
              <XorGroup
                key={group.id}
                data={group}
                onPointerDown={(e) => {
                  if (e.defaultPrevented) return;
                  elementPointerDown = {
                    element: group,
                    type: ObjectType.XOR_GROUP,
                  };
                }}
              />
            );
          })}
          {orGroups.map((group) => {
            if (!group) return null;
            return (
              <OrGroup
                key={group.id}
                data={group}
                onPointerDown={(e) => {
                  if (e.defaultPrevented) return;
                  elementPointerDown = {
                    element: group,
                    type: ObjectType.OR_GROUP,
                  };
                }}
              />
            );
          })}
          {tables.map((table) => {
            if (!table) return null;
            return (
              <Table
                key={table.id}
                tableData={table}
                handleGripField={handleGripField}
                onPointerDown={(e) => {
                  if (e.defaultPrevented) return;
                  elementPointerDown = {
                    element: table,
                    type: ObjectType.TABLE,
                  };
                }}
              />
            );
          })}
          {linking && linkingLine.startFieldId !== "" && (
            <path
              d={`M ${linkingLine.startX} ${linkingLine.startY} L ${linkingLine.endX} ${linkingLine.endY}`}
              stroke="red"
              strokeDasharray="8,8"
              className="pointer-events-none touch-none"
            />
          )}
          {linking && linkingLine.startFieldId === "" && (
            <g pointerEvents="none" className="touch-none">
              {(() => {
                const startTable = tables.find(
                  (t) => t?.id === linkingLine.startTableId,
                );
                if (!startTable) return null;
                return (
                  <path
                    d={`M ${startTable.x + startTable.width / 2} ${
                      startTable.y + (startTable.height || 0) / 2
                    } L ${pointer.spaces.diagram.x} ${pointer.spaces.diagram.y}`}
                    stroke="#0084d1"
                    strokeWidth="2"
                    strokeDasharray="4"
                  />
                );
              })()}
              {hoveredTable.tableId && (
                <rect
                  x={tables.find((t) => t?.id === hoveredTable.tableId)?.x - 5}
                  y={tables.find((t) => t?.id === hoveredTable.tableId)?.y - 5}
                  width={
                    tables.find((t) => t?.id === hoveredTable.tableId)?.width + 10
                  }
                  height={
                    (tables.find((t) => t?.id === hoveredTable.tableId)?.height ||
                      0) + 10
                  }
                  fill="none"
                  stroke="#0084d1"
                  strokeWidth="2"
                  strokeDasharray="4"
                  rx="5"
                />
              )}
            </g>
          )}
          {notes.map((n) => {
            if (!n) return null;
            return (
              <Note
                key={n.id}
                data={n}
                onPointerDown={(e) => {
                  if (e.defaultPrevented) return;
                  elementPointerDown = {
                    element: n,
                    type: ObjectType.NOTE,
                  };
                }}
              />
            );
          })}
          {texts.map((t) => {
            if (!t) return null;
            return (
              <Text
                key={t.id}
                data={t}
                onPointerDown={(e) => {
                  if (e.defaultPrevented) return;
                  elementPointerDown = {
                    element: t,
                    type: ObjectType.TEXT,
                  };
                }}
              />
            );
          })}
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
      <SideSheet
        title={t("edit")}
        size="small"
        visible={
          (selectedElement.element === ObjectType.XOR_GROUP ||
            selectedElement.element === ObjectType.OR_GROUP) &&
          selectedElement.open &&
          !layout.sidebar
        }
        onCancel={() => {
          setSelectedElement((prev) => ({
            ...prev,
            open: false,
          }));
        }}
        style={{ paddingBottom: "16px" }}
      >
        <div className="sidesheet-theme">
          {selectedElement.element === ObjectType.XOR_GROUP ? (
            xorGroups.find((g) => g.id === selectedElement.id) && (
              <XorGroupInfo
                data={xorGroups.find((g) => g.id === selectedElement.id)}
              />
            )
          ) : (
            orGroups.find((g) => g.id === selectedElement.id) && (
              <OrGroupInfo
                data={orGroups.find((g) => g.id === selectedElement.id)}
              />
            )
          )}
        </div>
      </SideSheet>
      {settings.showDebugCoordinates && (
        <div className="fixed flex flex-col flex-wrap gap-6 bg-[rgba(var(--semi-grey-1),var(--tw-bg-opacity))]/40 border border-color bottom-4 right-4 p-4 rounded-xl backdrop-blur-xs pointer-events-none select-none">
          <table className="table-auto grow">
            <thead>
              <tr>
                <th className="text-left" colSpan={3}>
                  {t("transform")}
                </th>
              </tr>
              <tr className="italic [&_th]:font-normal [&_th]:text-right">
                <th>pan x</th>
                <th>pan y</th>
                <th>scale</th>
              </tr>
            </thead>
            <tbody className="[&_td]:text-right [&_td]:min-w-[8ch]">
              <tr>
                <td>{transform.pan?.x.toFixed(2)}</td>
                <td>{transform.pan?.y.toFixed(2)}</td>
                <td>{transform.zoom.toFixed(4)}</td>
              </tr>
            </tbody>
          </table>
          <table className="table-auto grow [&_th]:text-left [&_th:not(:first-of-type)]:text-right [&_td:not(:first-of-type)]:text-right [&_td]:min-w-[8ch]">
            <thead>
              <tr>
                <th colSpan={4}>{t("viewbox")}</th>
              </tr>
              <tr className="italic [&_th]:font-normal">
                <th>left</th>
                <th>top</th>
                <th>width</th>
                <th>height</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>{viewBox?.left.toFixed(2)}</td>
                <td>{viewBox?.top.toFixed(2)}</td>
                <td>{viewBox?.width.toFixed(2)}</td>
                <td>{viewBox?.height.toFixed(2)}</td>
              </tr>
            </tbody>
          </table>
          <table className="table-auto grow [&_th]:text-left [&_th:not(:first-of-type)]:text-right [&_td:not(:first-of-type)]:text-right [&_td]:min-w-[8ch]">
            <thead>
              <tr>
                <th colSpan={3}>{t("cursor_coordinates")}</th>
              </tr>
              <tr className="italic [&_th]:font-normal">
                <th>{t("coordinate_space")}</th>
                <th>x</th>
                <th>y</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>{t("coordinate_space_screen")}</td>
                <td>{pointer.spaces?.screen?.x.toFixed(2)}</td>
                <td>{pointer.spaces?.screen?.y.toFixed(2)}</td>
              </tr>
              <tr>
                <td>{t("coordinate_space_diagram")}</td>
                <td>{pointer.spaces?.diagram?.x.toFixed(2)}</td>
                <td>{pointer.spaces?.diagram?.y.toFixed(2)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
