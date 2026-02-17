import React, { useRef, useState, useMemo } from "react";
import { ObjectType, Tab, Action, Cardinality } from "@data/constants";
import { useDiagram, useSettings, useLayout, useSelect, useCanvas, useUndoRedo } from "@hooks";
import useForceUpdate from "./Relationship/hooks/useForceUpdate";
import { useTranslation } from "react-i18next";
import { Toast } from "@douyinfe/semi-ui";
import { IRelationship, IWaypoint, RelationshipProps } from "@types";
import { useRelationshipOffsets } from "./Relationship/hooks/useRelationshipOffsets";
import { useRelationshipStatus } from "./Relationship/hooks/useRelationshipStatus";
import { useRelationshipPath } from "./Relationship/hooks/useRelationshipPath";
import { useWaypointInteraction } from "./Relationship/hooks/useWaypointInteraction";
import { RelationshipSymbols } from "./RelationshipSymbols";
import RelationshipLabels from "./RelationshipLabels";
import WaypointMarkers from "./WaypointMarkers";
import RelationshipPath from "./RelationshipPath";
import RelationshipEditSideSheet from "./RelationshipEditSideSheet";
import { CanvasObject } from "./common/CanvasObject";
import RelationshipInfo from "../EditorSidePanel/RelationshipsTab/RelationshipInfo";


/**
 * A component that renders a relationship line between two tables.
 * Handles waypoints, cardinality symbols, labels, and interactions.
 * 
 * @param {RelationshipProps} props - The component props.
 * @returns {JSX.Element | null} The rendered relationship.
 */
function Relationship({ data, onPointerDown }: RelationshipProps) {
  const { layout } = useLayout();
  const { 
    settings 
  } = useSettings();
  const { 
    tables, 
    relationships, 
    xorGroups, 
    orGroups, 
    updateRelationship, 
    waypointMode,
  } = useDiagram();
  const { selectedElement, setSelectedElement, bulkSelectedElements, setBulkSelectedElements, emitSelect } = useSelect();
  const { setUndoStack, setRedoStack } = useUndoRedo();
  const { pointer } = useCanvas();
  const { t } = useTranslation();
  const forceUpdate = useForceUpdate();
  const [labelBbox, setLabelBbox] = useState<{ x: number; y: number; width: number; height: number } | null>(null);
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

    if (waypointMode === "divider") {
      const isOneToMany =
        data.cardinality === Cardinality.ONE_TO_MANY ||
        data.cardinality === "one_to_many";
      const isManyToOne =
        data.cardinality === Cardinality.MANY_TO_ONE ||
        data.cardinality === "many_to_one";
      if (!isOneToMany && !isManyToOne) {
        Toast.info("Divider can only be added to 1:n or n:1 relationships");
        return;
      }
    }

    let currentWaypoints = data.waypoints || [];
    if (waypointMode === "divider") {
      currentWaypoints = currentWaypoints.map((wp) =>
        wp.mode === "divider" ? { ...wp, mode: "floating" as any } : wp
      );
    }

    const newWaypoints: IWaypoint[] = [
      ...currentWaypoints,
      {
        x: pointer.spaces.diagram.x,
        y: pointer.spaces.diagram.y,
        mode: waypointMode as any,
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
      emitSelect(data.id, ObjectType.RELATIONSHIP, e);
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
        open: false,
      }));

      const elementInBulk = {
        id: data.id,
        type: ObjectType.WAYPOINT,
        waypointIndex: index,
      };

      if (!(e.ctrlKey || e.metaKey)) {
        setBulkSelectedElements([elementInBulk]);
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
          setSelectedElement((prev) => ({
            ...prev,
            element: ObjectType.NONE,
            id: "",
            open: false,
          }));
        } else {
          setBulkSelectedElements((prev) => [
            ...prev,
            elementInBulk,
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

  const relationshipLabel = (
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
      dividerIndex={data.waypoints?.findIndex((wp) => wp.mode === "divider")}
      isSelected={isSelected}
      labelOffsetX={data.labelOffsetX}
      labelOffsetY={data.labelOffsetY}
    />
  );

  return (
    <>
      <g
        className="select-none group"
        data-rel-id={data.id}
        onContextMenu={handleContextMenu}
        onPointerEnter={() => setIsHovered(true)}
        onPointerLeave={() => setIsHovered(false)}
        onPointerDown={onPointerDown}
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
          edit={edit}
          emitSelect={emitSelect}
        />

        {(settings.showRelationshipLabels || settings.showRelationshipNames) &&
          pathLength > 0 && (
            <>
              {settings.showRelationshipLabels && (
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
                  showRelationshipNames={false}
                  showRelationshipLabels={true}
                  isSelected={isSelected}
                />
              )}
              {settings.showRelationshipNames && (
                <CanvasObject
                  data={{
                    id: data.id,
                    x: labelX - (labelBbox?.width ?? 0) / 2,
                    y: labelY - (labelBbox?.height ?? 0) / 2,
                    width: labelBbox?.width ?? 0,
                    height: labelBbox?.height ?? 0,
                    rotation: data.nameRotation,
                  }}
                  objectType={ObjectType.RELATIONSHIP}
                  tab={Tab.RELATIONSHIPS}
                  scrollIdPrefix="scroll_rel_"
                  updateCallback={(id, values: any) => {
                    const updates: any = {};
                    if (values.text !== undefined) updates.name = values.text;
                    if (values.name !== undefined) updates.name = values.name;
                    if (values.rotation !== undefined) updates.nameRotation = values.rotation;
                    if (values.x !== undefined || values.y !== undefined) {
                      const width = labelBbox?.width ?? 0;
                      const height = labelBbox?.height ?? 0;
                      if (values.x !== undefined) updates.labelOffsetX = values.x + width / 2 - labelAnchorX;
                      if (values.y !== undefined) updates.labelOffsetY = values.y + height / 2 - labelAnchorY;
                    }
                    if (Object.keys(updates).length > 0) {
                      updateRelationship(id, updates);
                    }
                  }}
                  popoverContent={<RelationshipInfo data={data} />}
                  showResizeHandles={false}
                  showRotationHandle={true}
                >
                  {({ edit }) => (
                    <g onDoubleClick={edit}>
                      <RelationshipLabels
                        name={data.name}
                        labelX={labelX}
                        labelY={labelY}
                        labelRef={labelRef}
                        isAnimated={isAnimated}
                        isHovered={isHovered}
                        mode={settings.mode}
                        relationshipNameFontSize={settings.relationshipNameFontSize}
                        showRelationshipNames={true}
                        showRelationshipLabels={false}
                        nameRotation={data.nameRotation}
                        handleWaypointPointerDown={handleWaypointPointerDown}
                        dividerIndex={data.waypoints?.findIndex((wp) => wp.mode === "divider")}
                        isSelected={isSelected}
                        labelOffsetX={data.labelOffsetX}
                        labelOffsetY={data.labelOffsetY}
                        onDoubleClick={edit}
                        setBbox={setLabelBbox}
                      />
                    </g>
                  )}
                </CanvasObject>
              )}
            </>
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

