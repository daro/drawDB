import { useMemo, useRef, useState, useEffect, useLayoutEffect, ReactNode } from "react";
import {
  Cardinality,
  ObjectType,
  Tab,
  Action,
} from "../../data/constants";
import { calcPath, findClosestPoint } from "../../utils/calcPath";
import { useDiagram, useSettings, useLayout, useSelect, useCanvas, useUndoRedo } from "../../hooks";
import { useTranslation } from "react-i18next";
import { SideSheet, Dropdown } from "@douyinfe/semi-ui";
import RelationshipInfo from "../EditorSidePanel/RelationshipsTab/RelationshipInfo";
import { IRelationship, IWaypoint, ITable, RelationshipProps } from "../../types";

const labelFontSize = 16;

/**
 * A component that renders a relationship line between two tables.
 * Handles waypoints, cardinality symbols, labels, and interactions.
 * 
 * @param {RelationshipProps} props - The component props.
 * @returns {JSX.Element | null} The rendered relationship.
 */
export default function Relationship({ data, onPointerDown }: RelationshipProps) {
  const { settings } = useSettings();
  const { tables, relationships, xorGroups, orGroups, updateRelationship } = useDiagram();
  const { layout } = useLayout();
  const { selectedElement, setSelectedElement, bulkSelectedElements, setBulkSelectedElements } = useSelect();
  const { setUndoStack, setRedoStack } = useUndoRedo();
  const { pointer } = useCanvas();
  const { t } = useTranslation();
  const [isHovered, setIsHovered] = useState(false);
  const [dragging, setDragging] = useState<{ id?: string | number; type: number; waypointIndex?: number; grabOffset?: { x: number; y: number } }>({ type: ObjectType.NONE });

  const { startYOffset, endYOffset } = useMemo(() => {
    const group =
      xorGroups.find((g) => g.childRelationshipIds.includes(data.id)) ||
      orGroups.find((g) => g.childRelationshipIds.includes(data.id));

    if (group) {
      const sameFieldRels = group.childRelationshipIds
        .map((rid) => relationships.find((rel) => rel.id === rid))
        .filter((r) => {
          if (!r) return false;
          const rIsParentStart = r.startTableId === group.parentTableId;
          const dataIsParentStart = data.startTableId === group.parentTableId;

          if (rIsParentStart !== dataIsParentStart) return false;

          if (rIsParentStart) {
            return r.startFieldId === data.startFieldId;
          } else {
            return r.endFieldId === data.endFieldId;
          }
        })
        .sort((a, b) => {
          if (!a || !b) return 0;
          const aSubtypeTableId =
            a.startTableId === group.parentTableId
              ? a.endTableId
              : a.startTableId;
          const bSubtypeTableId =
            b.startTableId === group.parentTableId
              ? b.endTableId
              : b.startTableId;
          const aTable = tables.find((t) => t.id === aSubtypeTableId);
          const bTable = tables.find((t) => t.id === bSubtypeTableId);
          return (aTable?.y ?? 0) - (bTable?.y ?? 0);
        })
        .map((r) => r?.id);

      if (sameFieldRels.length <= 1) return { startYOffset: 0, endYOffset: 0 };

      const index = sameFieldRels.indexOf(data.id);
      if (index === -1) return { startYOffset: 0, endYOffset: 0 };

      const spacing = 100;
      const offset = index * spacing;

      if (data.startTableId === group.parentTableId) {
        return { startYOffset: offset, endYOffset: 0 };
      } else {
        return { startYOffset: 0, endYOffset: offset };
      }
    }

    if (settings.spreadRelations) {
      const isERD = settings.relationshipStyle === "erd";

      const getOffsetForSide = (isStart: boolean) => {
        const tableId = isStart ? data.startTableId : data.endTableId;
        const fieldId = isStart ? data.startFieldId : data.endFieldId;
        const cardinality = data.cardinality;

        // Check if this side has many (crow's foot)
        let hasMany = false;
        if (isERD) {
          if (isStart) {
            hasMany =
              cardinality === Cardinality.MANY_TO_ONE ||
              cardinality === t(Cardinality.MANY_TO_ONE);
          } else {
            hasMany =
              cardinality === Cardinality.ONE_TO_MANY ||
              cardinality === t(Cardinality.ONE_TO_MANY);
          }
        }

        if (hasMany) return 0;

        const sameFieldRels = relationships
          .filter((r) => {
            const rStart = r.startTableId === tableId && r.startFieldId === fieldId;
            const rEnd = r.endTableId === tableId && r.endFieldId === fieldId;
            if (!rStart && !rEnd) return false;

            // Check if OTHER side of r has many
            let rHasManyOnThisSide = false;
            if (isERD) {
              if (rStart) {
                rHasManyOnThisSide =
                  r.cardinality === Cardinality.MANY_TO_ONE ||
                  r.cardinality === t(Cardinality.MANY_TO_ONE);
              } else {
                rHasManyOnThisSide =
                  r.cardinality === Cardinality.ONE_TO_MANY ||
                  r.cardinality === t(Cardinality.ONE_TO_MANY);
              }
            }
            return !rHasManyOnThisSide;
          })
          .sort((a, b) => {
            const aOtherId = a.startTableId === tableId ? a.endTableId : a.startTableId;
            const bOtherId = b.startTableId === tableId ? b.endTableId : b.startTableId;
            const aTable = tables.find((t) => t.id === aOtherId);
            const bTable = tables.find((t) => t.id === bOtherId);
            return (aTable?.y ?? 0) - (bTable?.y ?? 0);
          });

        if (sameFieldRels.length <= 1) return 0;

        const index = sameFieldRels.findIndex((r) => r.id === data.id);
        if (index === -1) return 0;

        const fieldHeight = 36;
        const padding = 4;
        const availableHeight = fieldHeight - 2 * padding;
        const step = availableHeight / (sameFieldRels.length + 1);
        return (index + 1) * step - fieldHeight / 2 + padding;
      };

      return {
        startYOffset: getOffsetForSide(true),
        endYOffset: getOffsetForSide(false),
      };
    }

    return { startYOffset: 0, endYOffset: 0 };
  }, [xorGroups, orGroups, data, relationships, settings.spreadRelations, settings.relationshipStyle, tables, t]);

  const isAnimated = useMemo(() => {
    const isTableSelected = (id: string | number) =>
      (selectedElement.id == id &&
        selectedElement.element === ObjectType.TABLE) ||
      bulkSelectedElements.some(
        (e) => e.type === ObjectType.TABLE && e.id === id,
      );

    const isRelationshipEdited =
      selectedElement.id == data.id &&
      selectedElement.element === ObjectType.RELATIONSHIP &&
      selectedElement.open;

    const isRelationshipSelectedInBulk = bulkSelectedElements.some(
      (e) => e.type === ObjectType.RELATIONSHIP && e.id == data.id,
    );

    const isWaypointSelected =
      selectedElement.id == data.id &&
      selectedElement.element === ObjectType.WAYPOINT;

    const isWaypointSelectedInBulk = bulkSelectedElements.some(
      (e) => e.type === ObjectType.WAYPOINT && e.id == data.id,
    );

    return (
      isTableSelected(data.startTableId) ||
      isTableSelected(data.endTableId) ||
      isRelationshipEdited ||
      isRelationshipSelectedInBulk ||
      isWaypointSelected ||
      isWaypointSelectedInBulk
    );
  }, [
    selectedElement.id,
    selectedElement.element,
    selectedElement.open,
    bulkSelectedElements,
    data.startTableId,
    data.endTableId,
    data.id,
  ]);

  const isHighlighted = useMemo(() => {
    const isRelationshipEdited =
      selectedElement.id == data.id &&
      selectedElement.element === ObjectType.RELATIONSHIP &&
      selectedElement.open;

    const isRelationshipSelectedInBulk = bulkSelectedElements.some(
      (e) => e.type === ObjectType.RELATIONSHIP && e.id == data.id,
    );

    const isWaypointSelected =
      selectedElement.id == data.id &&
      selectedElement.element === ObjectType.WAYPOINT;

    const isWaypointSelectedInBulk = bulkSelectedElements.some(
      (e) => e.type === ObjectType.WAYPOINT && e.id == data.id,
    );

    return (
      isHovered ||
      isRelationshipEdited ||
      isRelationshipSelectedInBulk ||
      isWaypointSelected ||
      isWaypointSelectedInBulk
    );
  }, [isHovered, selectedElement.id, selectedElement.element, selectedElement.open, bulkSelectedElements, data.id]);

  const { startTable, endTable, pathValues } = useMemo(() => {
    const sTable = tables.find((t) => t.id === data.startTableId);
    const eTable = tables.find((t) => t.id === data.endTableId);

    if (!sTable || !eTable || sTable.hidden || eTable.hidden)
      return { startTable: null, endTable: null, pathValues: null };

    return {
      startTable: sTable,
      endTable: eTable,
      pathValues: {
        startFieldIndex: sTable.fields.findIndex(
          (f) => f.id === data.startFieldId,
        ),
        endFieldIndex: eTable.fields.findIndex((f) => f.id === data.endFieldId),
        startTable: { x: sTable.x, y: sTable.y },
        endTable: { x: eTable.x, y: eTable.y },
      },
    };
  }, [tables, data]);

  const measurePathRef = useRef<SVGPathElement>(null);
  const labelRef = useRef<SVGTextElement>(null);

  let cardinalityStart = "1";
  let cardinalityEnd = "1";

  switch (data.cardinality) {
    // the translated values are to ensure backwards compatibility
    case t(Cardinality.MANY_TO_ONE):
    case Cardinality.MANY_TO_ONE:
      cardinalityStart = data.manyLabel || "n";
      cardinalityEnd = "1";
      break;
    case t(Cardinality.ONE_TO_MANY):
    case Cardinality.ONE_TO_MANY:
      cardinalityStart = "1";
      cardinalityEnd = data.manyLabel || "n";
      break;
    case t(Cardinality.ONE_TO_ONE):
    case Cardinality.ONE_TO_ONE:
      cardinalityStart = "1";
      cardinalityEnd = "1";
      break;
    default:
      break;
  }

  let cardinalityStartX = 0;
  let cardinalityEndX = 0;
  let cardinalityStartY = 0;
  let cardinalityEndY = 0;
  let angleStart = 0;
  let angleEnd = 0;
  let labelX = 0;
  let labelY = 0;

  let labelWidth = labelRef.current?.getBBox().width ?? 0;
  let labelHeight = labelRef.current?.getBBox().height ?? 0;

  const cardinalityOffset =
    settings.relationshipStyle === "default" ? 28 : 12;

  const dividerWp = useMemo(
    () => (data.waypoints || []).find((wp) => wp.mode === "divider"),
    [data.waypoints],
  );

  const dividerRatio = useMemo(() => {
    const raw = dividerWp?.pathRatio;
    if (typeof raw !== "number" || Number.isNaN(raw)) return 0.5;
    return Math.min(0.999, Math.max(0.001, raw));
  }, [dividerWp?.pathRatio]);

  const pathD = useMemo(
    () =>
      calcPath(
        pathValues,
        startTable?.width,
        endTable?.width,
        1,
        startYOffset,
        endYOffset,
        data.waypoints || [],
        settings.sideMargin ?? 20,
        data.startXOffset ?? 0,
        data.endXOffset ?? 0,
        data.startYCorrection ?? 0,
        data.endYCorrection ?? 0,
      ),
    [
      pathValues,
      startTable?.width,
      endTable?.width,
      startYOffset,
      endYOffset,
      data.waypoints,
      settings.sideMargin,
      data.startXOffset,
      data.endXOffset,
      data.startYCorrection,
      data.endYCorrection,
    ],
  );

  const [pathLength, setPathLength] = useState(0);

  useLayoutEffect(() => {
    if (!measurePathRef.current) return;
    try {
      setPathLength(measurePathRef.current.getTotalLength());
    } catch {
      setPathLength(0);
    }
  }, [pathD]);

  const getPointAtLengthSafe = (len: number) => {
    if (!measurePathRef.current) return { x: 0, y: 0 };
    try {
      return measurePathRef.current.getPointAtLength(len);
    } catch (e) {
      return { x: 0, y: 0 };
    }
  };

  if (pathLength > 0) {
    const labelPoint = getPointAtLengthSafe(pathLength / 2);

    labelX = labelPoint.x - (labelWidth ?? 0) / 2;
    labelY = labelPoint.y + (labelHeight ?? 0) / 2;

    const point1 = getPointAtLengthSafe(cardinalityOffset);
    cardinalityStartX = point1.x;
    cardinalityStartY = point1.y;

    const point1_2 = getPointAtLengthSafe(cardinalityOffset + 1);
    angleStart =
      (Math.atan2(point1_2.y - point1.y, point1_2.x - point1.x) * 180) /
      Math.PI;

    const point2 = getPointAtLengthSafe(
      pathLength - cardinalityOffset,
    );
    cardinalityEndX = point2.x;
    cardinalityEndY = point2.y;

    const point2_2 = getPointAtLengthSafe(
      pathLength - cardinalityOffset - 1,
    );
    angleEnd =
      (Math.atan2(point2_2.y - point2.y, point2_2.x - point2.x) * 180) /
      Math.PI;
  }

  const edit = () => {
    if (!layout.sidebar) {
      setSelectedElement((prev) => ({
        ...prev,
        element: ObjectType.RELATIONSHIP,
        id: data.id,
        open: true,
      }));
    } else {
      setSelectedElement((prev) => ({
        ...prev,
        currentTab: Tab.RELATIONSHIPS,
        element: ObjectType.RELATIONSHIP,
        id: data.id,
        open: true,
      }));
      if (selectedElement.currentTab !== Tab.RELATIONSHIPS) return;
      document
        .getElementById(`scroll_ref_${data.id}`)
        ?.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    if (layout.readOnly) return;
    e.preventDefault();
    e.stopPropagation();

    const newWaypoints: IWaypoint[] = [
      ...(data.waypoints || []),
      {
        x: pointer.spaces.diagram.x,
        y: pointer.spaces.diagram.y,
        mode: "waypoint",
      },
    ];

    setUndoStack((prev) => [
      ...prev,
      {
        action: Action.EDIT,
        element: ObjectType.RELATIONSHIP,
        rid: data.id,
        undo: { waypoints: data.waypoints || [] },
        redo: { waypoints: newWaypoints },
        message: t("edit_relationship", {
          refName: data.name,
          extra: `[${t("add_waypoint")}]`,
        }),
      },
    ]);
    setRedoStack([]);

    updateRelationship(data.id, { waypoints: newWaypoints });
  };


  useEffect(() => {
    if (dragging.type !== ObjectType.WAYPOINT) return;

    const handlePointerMove = () => {
      const { x, y } = pointer.spaces.diagram;
      const newWaypoints = [...(data.waypoints || [])];
      if (dragging.waypointIndex === undefined || dragging.grabOffset === undefined) return;

      const targetX = x - dragging.grabOffset.x;
      const targetY = y - dragging.grabOffset.y;

      if (
        newWaypoints[dragging.waypointIndex].mode === "floating" ||
        newWaypoints[dragging.waypointIndex].mode === "divider"
      ) {
        if (measurePathRef.current) {
          const closest = findClosestPoint(measurePathRef.current, {
            x: targetX,
            y: targetY,
          });
          newWaypoints[dragging.waypointIndex] = {
            ...newWaypoints[dragging.waypointIndex],
            x: closest.x,
            y: closest.y,
            pathRatio: closest.ratio,
          };
        } else {
          newWaypoints[dragging.waypointIndex] = {
            ...newWaypoints[dragging.waypointIndex],
            x: targetX,
            y: targetY,
          };
        }
      } else {
        newWaypoints[dragging.waypointIndex] = {
          ...newWaypoints[dragging.waypointIndex],
          x: targetX,
          y: targetY,
        };
      }
      updateRelationship(data.id, { waypoints: newWaypoints });
    };

    const handlePointerUp = () => {
      setUndoStack((prev) => [
        ...prev,
        {
          action: Action.EDIT,
          element: ObjectType.RELATIONSHIP,
          rid: data.id,
          undo: { waypoints: selectedElement.initialWaypoints },
          redo: { waypoints: data.waypoints },
          message: t("edit_relationship", {
            refName: data.name,
            extra: `[${t("move_waypoint") || "Move waypoint"}]`,
          }),
        },
      ]);
      setRedoStack([]);
      setDragging({ type: ObjectType.NONE });
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
    };
  }, [dragging, pointer.spaces.diagram, data.waypoints, data.id, data.name, updateRelationship, setUndoStack, setRedoStack, t, selectedElement.initialWaypoints]);

  useEffect(() => {
    if (!measurePathRef.current) return;
    const pathNode = measurePathRef.current;
    const pathLength = pathNode.getTotalLength();
    let changed = false;

    const hasFloatingWaypoints = (data.waypoints || []).some(
      (wp) => wp.mode === "floating" || wp.mode === "divider",
    );

    if (!hasFloatingWaypoints) return;

    let newWaypoints = (data.waypoints || []).map((wp) => {
      if (wp.mode === "floating" || wp.mode === "divider") {
        if (wp.pathRatio !== undefined) {
          const point = pathNode.getPointAtLength(wp.pathRatio * pathLength);
          if (
            Math.abs(point.x - wp.x) > 0.1 ||
            Math.abs(point.y - wp.y) > 0.1
          ) {
            changed = true;
            return { ...wp, x: point.x, y: point.y };
          }
        } else {
          // Initialize pathRatio if missing
          const ratio = findClosestPoint(pathNode, { x: wp.x, y: wp.y }).ratio;
          const point = pathNode.getPointAtLength(ratio * pathLength);
          changed = true;
          return { ...wp, x: point.x, y: point.y, pathRatio: ratio };
        }
      }
      return wp;
    });

    if (changed) {
      updateRelationship(data.id, {
        waypoints: newWaypoints,
      });
    }
  }, [
    data.id,
    data.startTableId,
    data.endTableId,
    data.startXOffset,
    data.endXOffset,
    data.startYCorrection,
    data.endYCorrection,
    data.waypoints,
    tables,
    updateRelationship,
    pathD,
  ]);


  const handleWaypointPointerDown = (e: React.PointerEvent, index: number) => {
    if (layout.readOnly) return;
    if (e.button === 2) return;
    e.stopPropagation();
    e.preventDefault();

    setSelectedElement((prev) => ({
      ...prev,
      element: ObjectType.WAYPOINT,
      id: data.id,
      waypointIndex: index,
      initialWaypoints: data.waypoints,
    }));

    if (!(e.ctrlKey || e.metaKey)) {
      setBulkSelectedElements([
        {
          id: data.id,
          type: ObjectType.WAYPOINT,
          waypointIndex: index,
        },
      ]);
    } else {
      const isAlreadyInBulk = bulkSelectedElements.some(
        (el) =>
          el.type === ObjectType.WAYPOINT &&
          el.id === data.id &&
          el.waypointIndex === index,
      );
      if (isAlreadyInBulk) {
        setBulkSelectedElements((prev) =>
          prev.filter(
            (el) =>
              !(
                el.type === ObjectType.WAYPOINT &&
                el.id === data.id &&
                el.waypointIndex === index
              ),
          ),
        );
      } else {
        setBulkSelectedElements((prev) => [
          ...prev,
          {
            id: data.id,
            type: ObjectType.WAYPOINT,
            waypointIndex: index,
          },
        ]);
      }
    }

    setDragging({
      id: data.id,
      type: ObjectType.WAYPOINT,
      waypointIndex: index,
      grabOffset: {
        x: pointer.spaces.diagram.x - (data.waypoints ? data.waypoints[index].x : 0),
        y: pointer.spaces.diagram.y - (data.waypoints ? data.waypoints[index].y : 0),
      },
    });
  };

  const removeWaypoint = (index: number) => {
    const newWaypoints = (data.waypoints || []).filter((_, i) => i !== index);
    
    setUndoStack((prev) => [
      ...prev,
      {
        action: Action.EDIT,
        element: ObjectType.RELATIONSHIP,
        rid: data.id,
        undo: { waypoints: data.waypoints || [] },
        redo: { waypoints: newWaypoints },
        message: t("edit_relationship", {
          refName: data.name,
          extra: `[${t("delete_waypoint") || "Delete waypoint"}]`,
        }),
      },
    ]);
    setRedoStack([]);
    
    updateRelationship(data.id, { waypoints: newWaypoints });
  };

  if (!pathValues || !startTable || !endTable) return null;

  if (
    startTable.supertypeId === endTable.id ||
    endTable.supertypeId === startTable.id
  )
    return null;

  return (
    <>
      <g
        className="select-none group"
        data-rel-id={data.id}
        onDoubleClick={edit}
        onContextMenu={handleContextMenu}
        onPointerEnter={() => setIsHovered(true)}
        onPointerLeave={() => setIsHovered(false)}
        onPointerDown={(e) => {
          if (e.defaultPrevented) return;
          onPointerDown(e);
        }}
      >
        {/* invisible wider path for better hover ux */}
        <path
          d={pathD}
          fill="none"
          stroke="transparent"
          strokeWidth={12}
          cursor="pointer"
        />

        {/* hidden path for measurement */}
        <path ref={measurePathRef} d={pathD} fill="none" stroke="none" pointerEvents="none" />

        {(isAnimated || isHovered) && data.identifying !== false && (
          <path
            d={pathD}
            fill="none"
            className="relationship-path pointer-events-none"
            style={{
              stroke: settings.relationAnimationsInTableColor
                ? startTable?.color || "#0084d1"
                : "#0084d1",
            }}
          />
        )}

        {/* base path */}
        <path
          d={pathD}
          style={{
            stroke: settings.outboundRelationsInTableColor
              ? startTable?.color
              : undefined,
          }}
          className={`relationship-path ${
            isAnimated || isHovered
              ? data.identifying !== false
                ? "animated-path"
                : "non-identifying-animated"
              : ""
          }`}
          fill="none"
          cursor="pointer"
          strokeLinecap={(isAnimated || isHovered) && data.identifying !== false ? "round" : "butt"}
          strokeDasharray={
            !isAnimated &&
            !isHovered &&
            dividerWp &&
            pathLength > 0
              ? `${pathLength * dividerRatio} 1000000`
              : isAnimated || isHovered
                ? data.identifying !== false
                  ? "0 30"
                  : "12 8"
                : data.identifying === false
                  ? "8,8"
                  : "0"
          }
          onPointerDown={(e) => {
            e.stopPropagation();
            const elementInBulk = { id: data.id, type: ObjectType.RELATIONSHIP };
            if (!(e.ctrlKey || e.metaKey)) {
              setBulkSelectedElements([elementInBulk]);
              setSelectedElement({
                ...selectedElement,
                id: data.id,
                element: ObjectType.RELATIONSHIP,
                open: false,
              });
            } else {
              const isAlreadyInBulk = bulkSelectedElements.some(
                (el) => el.type === ObjectType.RELATIONSHIP && el.id === data.id,
              );
              if (isAlreadyInBulk) {
                setBulkSelectedElements((prev) =>
                  prev.filter(
                    (el) => !(el.type === ObjectType.RELATIONSHIP && el.id === data.id),
                  ),
                );
              } else {
                setBulkSelectedElements((prev) => [...prev, elementInBulk]);
              }
            }
          }}
        />

        {/* Path from divider to end (dashed), visible only when not hovered/animated */}
        {!isAnimated && !isHovered && dividerWp && pathLength > 0 && (
          <path
            d={pathD}
            fill="none"
            style={{
              stroke: settings.outboundRelationsInTableColor
                ? startTable?.color
                : undefined,
            }}
            className="relationship-path"
            strokeDasharray={`0, ${pathLength * dividerRatio}, ${new Array(Math.ceil((pathLength * (1 - dividerRatio)) / 16) + 1).fill("8, 8").join(", ")}`}
            pointerEvents="none"
          />
        )}

        {settings.showRelationshipLabels &&
          data.reverseName &&
          dividerWp &&
          pathLength > 0 &&
          !(isAnimated || isHovered) && (
          <>
            <text
              x={labelX}
              y={data.reverseName ? labelY - 10 : labelY}
              fill={settings.mode === "dark" ? "lightgrey" : "#333"}
              fontSize={labelFontSize}
              fontWeight={500}
              ref={labelRef}
              className="group-hover:fill-sky-600"
            >
              {data.name}
            </text>
            {data.reverseName && (
              <text
                x={labelX}
                y={labelY + 10}
                fill={settings.mode === "dark" ? "lightgrey" : "#333"}
                fontSize={labelFontSize}
                fontWeight={500}
                className="group-hover:fill-sky-600"
              >
                {data.reverseName}
              </text>
            )}
          </>
        )}
        {pathLength > 0 && settings.showCardinality && (
          <>
            {settings.relationshipStyle === "erd" && (
  <>
    <ERDCardinality
      x={cardinalityStartX}
      y={cardinalityStartY}
      angle={angleStart}
      isMany={cardinalityStart !== "1"}
      mode={settings.mode}
    />
    <ERDCardinality
      x={cardinalityEndX}
      y={cardinalityEndY}
      angle={angleEnd + 180}
      isMany={cardinalityEnd !== "1"}
      mode={settings.mode}
    />
  </>
)}

{settings.relationshipStyle === "uml" && (
  <>
    <UMLCardinality
      x={cardinalityStartX}
      y={cardinalityStartY}
      angle={angleStart}
      isMany={cardinalityStart !== "1"}
      mode={settings.mode}
    />
    <UMLCardinality
      x={cardinalityEndX}
      y={cardinalityEndY}
      angle={angleEnd}
      isMany={cardinalityEnd !== "1"}
      mode={settings.mode}
    />
  </>
)}
            {settings.relationshipStyle === "idef1x" && (
              <>
                <IDEF1XCardinality
                  x={cardinalityStartX}
                  y={cardinalityStartY}
                  angle={angleStart}
                  isMany={cardinalityStart !== "1"}
                  mode={settings.mode}
                />
                <IDEF1XCardinality
                  x={cardinalityEndX}
                  y={cardinalityEndY}
                  angle={angleEnd}
                  isMany={cardinalityEnd !== "1"}
                  mode={settings.mode}
                />
              </>
            )}
            {settings.relationshipStyle === "default" && (
              <>
                <CardinalityLabel
                  x={cardinalityStartX}
                  y={cardinalityStartY}
                  text={cardinalityStart}
                />
                <CardinalityLabel
                  x={cardinalityEndX}
                  y={cardinalityEndY}
                  text={cardinalityEnd}
                />
              </>
            )}
          </>
        )}

        {isHighlighted &&
          (data.waypoints || []).map((wp, i) => {
            const isWpSelected = bulkSelectedElements.some(
              (el) =>
                el.type === ObjectType.WAYPOINT &&
                el.id === data.id &&
                el.waypointIndex === i,
            );
            return (
              <Dropdown
                key={`wp-${i}`}
                trigger="contextMenu"
                position="bottomLeft"
                render={
                  <Dropdown.Menu>
                    <Dropdown.Item
                      onClick={() => {
                        const isFloating = wp.mode === "floating";
                        const isDivider = wp.mode === "divider";
                        let newMode: "floating" | "divider" | "waypoint";
                        if (isDivider) {
                          newMode = "waypoint";
                        } else if (isFloating) {
                          newMode = "divider";
                        } else {
                          newMode = "floating";
                        }
                        
                        let pathRatio = wp.pathRatio;
                        let x = wp.x;
                        let y = wp.y;

                        if ((newMode === "floating" || newMode === "divider") && measurePathRef.current) {
                          const pathNode = measurePathRef.current;
                          const closest = findClosestPoint(pathNode, {
                            x: wp.x,
                            y: wp.y,
                          });
                          x = closest.x;
                          y = closest.y;
                          pathRatio = closest.ratio;
                        }

                        // Ensure only one divider exists
                        let updatedWaypoints = [...(data.waypoints || [])];
                        if (newMode === "divider") {
                          updatedWaypoints = updatedWaypoints.map((w) => ({
                            ...w,
                            mode: w.mode === "divider" ? "floating" : w.mode,
                          })) as IWaypoint[];
                        }

                        updatedWaypoints[i] = {
                          ...updatedWaypoints[i],
                          mode: newMode,
                          x,
                          y,
                          pathRatio
                        };
                        updateRelationship(data.id, {
                          waypoints: updatedWaypoints,
                        });
                      }}
                    >
                      {wp.mode === "floating"
                        ? t("set_as_divider") || "Set as divider"
                        : wp.mode === "divider"
                        ? t("set_as_waypoint") || "Set as waypoint"
                        : t("set_as_floating") || "Set as floating"}
                    </Dropdown.Item>
                    <Dropdown.Item
                      type="danger"
                      onClick={() => removeWaypoint(i)}
                    >
                      {t("delete")}
                    </Dropdown.Item>
                  </Dropdown.Menu>
                }
              >
                <g>
                  <circle
                    cx={wp.x}
                    cy={wp.y}
                    r={6}
                    fill={
                      isWpSelected
                        ? "red"
                        : wp.mode === "floating" || wp.mode === "divider"
                        ? "#ff9800"
                        : "#0084d1"
                    }
                    stroke="white"
                    strokeWidth={isWpSelected ? 3 : 2}
                    cursor="move"
                    onPointerDown={(e) => handleWaypointPointerDown(e, i)}
                    onContextMenu={(e) => e.stopPropagation()}
                  />
                  {wp.mode === "divider" && !isWpSelected && (
                    <circle
                      cx={wp.x}
                      cy={wp.y}
                      r={2.5}
                      fill="black"
                      className="pointer-events-none"
                    />
                  )}
                </g>
              </Dropdown>
            );
          })}
      </g>
      <SideSheet
        title={t("edit")}
        size="small"
        visible={
          selectedElement.element === ObjectType.RELATIONSHIP &&
          selectedElement.id === data.id &&
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
          <RelationshipInfo data={data} />
        </div>
      </SideSheet>
    </>
  );
}

interface CardinalityLabelProps {
  x: number;
  y: number;
  text: string;
  r?: number;
  padding?: number;
}

function CardinalityLabel({ x, y, text, r = 12, padding = 14 }: CardinalityLabelProps) {
  const [textWidth, setTextWidth] = useState(0);
  const textRef = useRef<SVGTextElement>(null);

  useEffect(() => {
    if (textRef.current) {
      const bbox = textRef.current.getBBox();
      setTextWidth(bbox.width);
    }
  }, [text]);

  return (
    <g>
      <rect
        x={x - textWidth / 2 - padding / 2}
        y={y - r}
        rx={r}
        ry={r}
        width={textWidth + padding}
        height={r * 2}
        fill="grey"
        className="group-hover:fill-sky-600"
      />
      <text
        ref={textRef}
        x={x}
        y={y}
        fill="white"
        strokeWidth="0.5"
        textAnchor="middle"
        alignmentBaseline="middle"
      >
        {text}
      </text>
    </g>
  );
}

interface CardinalitySymbolProps {
  x: number;
  y: number;
  angle: number;
  isMany: boolean;
  mode: "light" | "dark";
  color?: string;
}

function IDEF1XCardinality({ x, y, angle, isMany, mode, color }: CardinalitySymbolProps) {
  const strokeColor = color || (mode === "dark" ? "lightgrey" : "#333");
  const size = 6;

  return (
    <g
      transform={`translate(${x}, ${y}) rotate(${angle + 180})`}
      className="group-hover:stroke-sky-600 group-hover:fill-sky-600"
    >
      {isMany && (
        <circle
          cx={-size}
          cy={0}
          r={size}
          fill={strokeColor}
          stroke={strokeColor}
          strokeWidth={1}
        />
      )}
    </g>
  );
}

function UMLCardinality({ x, y, angle, isMany, mode, color }: CardinalitySymbolProps) {
  const strokeColor = color || (mode === "dark" ? "lightgrey" : "#333");
  const size = 10;

  return (
    <g
      transform={`translate(${x}, ${y}) rotate(${angle + 180})`}
      className="group-hover:stroke-sky-600 group-hover:fill-sky-600"
    >
      {isMany && (
        <path
          d={`M 0 0 L ${-size} ${-size / 2} L ${-size} ${size / 2} Z`}
          fill={strokeColor}
          stroke={strokeColor}
          strokeWidth={2}
        />
      )}
    </g>
  );
}

function ERDCardinality({ x, y, angle, isMany, mode, color }: CardinalitySymbolProps) {
  const strokeColor = color || (mode === "dark" ? "lightgrey" : "#333");
  const size = 15;

  return (
    <g
      transform={`translate(${x}, ${y}) rotate(${angle})`}
      className="group-hover:stroke-sky-600"
    >
      {isMany && (
        <>
          <line
            x1={0}
            y1={0}
            x2={-size}
            y2={0}
            stroke={strokeColor}
            strokeWidth={2}
          />
          <line
            x1={0}
            y1={0}
            x2={-size}
            y2={-size}
            stroke={strokeColor}
            strokeWidth={2}
          />
          <line
            x1={0}
            y1={0}
            x2={-size}
            y2={size}
            stroke={strokeColor}
            strokeWidth={2}
          />
        </>
      )}
    </g>
  );
}
