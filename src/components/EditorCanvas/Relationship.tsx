import React, { useRef, useState } from "react";
import { ObjectType, Tab, Action, } from "../../data/constants";
import { useDiagram, useSettings, useLayout, useSelect, useCanvas, useUndoRedo, useForceUpdate } from "../../hooks";
import { useTranslation } from "react-i18next";
import { IWaypoint, RelationshipProps } from "../../types";
import { useRelationshipOffsets } from "../../hooks/useRelationshipOffsets";
import { useRelationshipStatus } from "../../hooks/useRelationshipStatus";
import { useRelationshipPath } from "../../hooks/useRelationshipPath";
import { useWaypointInteraction } from "../../hooks/useWaypointInteraction";
import { RelationshipSymbols } from "./RelationshipSymbols";
import RelationshipLabels from "./RelationshipLabels";
import WaypointMarkers from "./WaypointMarkers";
import RelationshipPath from "./RelationshipPath";
import RelationshipEditSideSheet from "./RelationshipEditSideSheet";


/**
 * A component that renders a relationship line between two tables.
 * Handles waypoints, cardinality symbols, labels, and interactions.
 * 
 * @param {RelationshipProps} props - The component props.
 * @returns {JSX.Element | null} The rendered relationship.
 */
function Relationship({ data, onPointerDown }: RelationshipProps) {
  const { settings } = useSettings();
  const { tables, relationships, xorGroups, orGroups, updateRelationship } = useDiagram();
  const { layout } = useLayout();
  const { selectedElement, setSelectedElement, bulkSelectedElements, setBulkSelectedElements } = useSelect();
  const { setUndoStack, setRedoStack } = useUndoRedo();
  const { pointer } = useCanvas();
  const { t } = useTranslation();
  const forceUpdate = useForceUpdate();
  const [isHovered, setIsHovered] = useState(false);
  const [dragging, setDragging] = useState<{
    id?: string | number;
    type: number;
    waypointIndex?: number;
    grabOffset?: { x: number; y: number };
    isLabel?: boolean;
    labelOffset?: { x: number; y: number };
    labelRatio?: number;
    initialLabelPos?: { ratio: number };
  }>({ type: ObjectType.NONE });

  const { startYOffset, endYOffset } = useRelationshipOffsets(
    data,
    relationships,
    tables,
    xorGroups,
    orGroups,
    settings,
    t
  );

  const { isAnimated, isHighlighted, isSelected, startTable, endTable, pathValues } = useRelationshipStatus(
    data,
    selectedElement,
    bulkSelectedElements,
    isHovered,
    tables
  );

  const measurePathRef = useRef<SVGPathElement>(null);
  const labelRef = useRef<SVGTextElement>(null);

  const {
    pathD,
    pathLength,
    cardinalityStartX,
    cardinalityStartY,
    cardinalityEndX,
    cardinalityEndY,
    angleStart,
    angleEnd,
    labelX,
    labelY,
    labelAnchorX,
    labelAnchorY,
    cardinalityStart,
    cardinalityEnd,
    sideLabelStart,
    sideLabelEnd,
    sideLabelStartX,
    sideLabelStartY,
    sideLabelEndX,
    sideLabelEndY,
    dividerWp,
    dividerRatio,
    cardinalityOffset,
    pathSegments,
  } = useRelationshipPath(
    data,
    pathValues,
    startTable,
    endTable,
    startYOffset,
    endYOffset,
    settings,
    measurePathRef,
    labelRef,
    t,
    forceUpdate
  );

  useWaypointInteraction(
    data,
    dragging,
    setDragging,
    pointer,
    measurePathRef,
    updateRelationship,
    setUndoStack,
    setRedoStack,
    selectedElement,
    t,
    forceUpdate,
    pathD,
    tables
  );

  const edit = (e: React.MouseEvent) => {
    // Prevent opening edit if clicking on labels or markers
    if ((e.target as HTMLElement).closest("g")?.classList.contains("cursor-move")) {
      return;
    }

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


  const handleWaypointPointerDown = (e: React.PointerEvent, index: number) => {
    if (layout.readOnly) return;
    if (e.button === 2) return;
    
    // If clicking on label, we only want to drag the label, not select the relationship or open edit
    const isLabel = (e.target as HTMLElement).closest("g")?.classList.contains("cursor-move");
    
    if (!isLabel) {
      onPointerDown(e);
    }

    e.stopPropagation();
    e.preventDefault();

    if (!isLabel) {
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
    } else {
      // If label is clicked, select the relationship in bulk to enable toolbar actions (like rotate)
      // but don't set it as the primary selected element to avoid opening the edit sidebar
      const elementInBulk = { id: data.id, type: ObjectType.RELATIONSHIP };
      if (!(e.ctrlKey || e.metaKey)) {
        setBulkSelectedElements([elementInBulk]);
        setSelectedElement((prev) => ({
          ...prev,
          element: ObjectType.RELATIONSHIP,
          id: data.id,
          open: false,
        }));
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
    }

    setDragging({
      id: data.id,
      type: ObjectType.WAYPOINT,
      waypointIndex: index,
      isLabel: isLabel,
      grabOffset: isLabel ? { x: 0, y: 0 } : {
        x: pointer.spaces.diagram.x - (data.waypoints?.[index]?.x ?? 0),
        y: pointer.spaces.diagram.y - (data.waypoints?.[index]?.y ?? 0),
      },
      labelOffset: {
        x: data.labelOffsetX ?? 0,
        y: data.labelOffsetY ?? 0
      },
      labelRatio: data.labelRatio ?? 0.5,
      initialLabelPos: {
        ratio: data.labelRatio ?? 0.5
      }
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
        <RelationshipPath
          data={data}
          pathD={pathD}
          pathSegments={pathSegments}
          pathLength={pathLength}
          isAnimated={isAnimated}
          isHovered={isHovered}
          isSelected={isSelected}
          startTable={startTable}
          settings={settings}
          cardinalityOffset={cardinalityOffset}
          dividerWp={dividerWp}
          dividerRatio={dividerRatio}
          t={t}
          measurePathRef={measurePathRef}
          selectedElement={selectedElement}
          setSelectedElement={setSelectedElement}
          bulkSelectedElements={bulkSelectedElements}
          setBulkSelectedElements={setBulkSelectedElements}
          onPointerDown={onPointerDown}
        />

        {(settings.showRelationshipLabels || settings.showRelationshipNames) &&
          pathLength > 0 && (
          <RelationshipLabels
            name={data.name}
            labelX={labelX}
            labelY={labelY}
            labelRef={labelRef}
            isAnimated={isAnimated}
            isHovered={isHovered}
            mode={settings.mode}
            sideLabelStartX={sideLabelStartX}
            sideLabelStartY={sideLabelStartY}
            sideLabelStart={sideLabelStart}
            sideLabelEndX={sideLabelEndX}
            sideLabelEndY={sideLabelEndY}
            sideLabelEnd={sideLabelEnd}
            relationshipNameFontSize={settings.relationshipNameFontSize}
            relationshipSideLabelFontSize={settings.relationshipSideLabelFontSize}
            showRelationshipNames={settings.showRelationshipNames}
            showRelationshipLabels={settings.showRelationshipLabels}
            nameRotation={data.nameRotation}
            handleWaypointPointerDown={handleWaypointPointerDown}
            dividerIndex={data.waypoints?.findIndex(wp => wp.mode === "divider")}
            isSelected={isSelected}
          />
        )}
        {pathLength > 0 && settings.showCardinality && (
          <RelationshipSymbols
            settings={settings}
            cardinalityStartX={cardinalityStartX}
            cardinalityStartY={cardinalityStartY}
            angleStart={angleStart}
            cardinalityStart={cardinalityStart}
            cardinalityEndX={cardinalityEndX}
            cardinalityEndY={cardinalityEndY}
            angleEnd={angleEnd}
            cardinalityEnd={cardinalityEnd}
            isSelected={isSelected}
          />
        )}

        <WaypointMarkers
          data={data}
          isHighlighted={isHighlighted}
          selectedElement={selectedElement}
          bulkSelectedElements={bulkSelectedElements}
          measurePathRef={measurePathRef}
          updateRelationship={updateRelationship}
          removeWaypoint={removeWaypoint}
          handleWaypointPointerDown={handleWaypointPointerDown}
          pathD={pathD}
        />
      </g>
      <RelationshipEditSideSheet
        data={data}
        selectedElement={selectedElement}
        setSelectedElement={setSelectedElement}
        layout={layout}
      />
    </>
  );
}

export default React.memo(Relationship);

