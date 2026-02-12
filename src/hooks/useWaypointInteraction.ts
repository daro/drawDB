import { useEffect, RefObject } from "react";
import { IRelationship } from "../types";
import { ObjectType, Action } from "../data/constants";
import { PathCommander } from "../utils/path/PathCommander";
import { findClosestPoint } from "../utils/calcPath";

export function useWaypointInteraction(
  data: IRelationship,
  dragging: any,
  setDragging: (d: any) => void,
  pointer: any,
  measurePathRef: RefObject<SVGPathElement>,
  updateRelationship: (id: string | number, data: Partial<IRelationship>) => void,
  setUndoStack: (fn: (prev: any[]) => any[]) => void,
  setRedoStack: (s: any[]) => void,
  selectedElement: any,
  t: (key: string, options?: any) => string,
  forceUpdate: () => void,
  pathD: string,
  tables: any[]
) {
  useEffect(() => {
    if (dragging.type !== ObjectType.WAYPOINT) return;

    const handlePointerMove = (e: PointerEvent) => {
      const { x, y } = pointer.spaces.diagram;
      const newWaypoints = [...(data.waypoints || [])];
      if (dragging.waypointIndex === undefined || dragging.grabOffset === undefined) return;

      if (dragging.isLabel) {
        // Free movement by default, snap to path with Shift
        if (e.shiftKey) {
          const closest = findClosestPoint(pathD, { x, y });
          updateRelationship(data.id, {
            labelRatio: closest.ratio,
            labelOffsetX: 0,
            labelOffsetY: 0
          });
        } else {
          // Calculate anchor based on current labelRatio
          const commander = new PathCommander(pathD);
          const currentPathLength = commander.getTotalLength();
          const labelRatio = data.labelRatio ?? 0.5;
          const anchor = commander.getPointAtLength(labelRatio * currentPathLength);
          
          updateRelationship(data.id, {
            labelOffsetX: x - anchor.x,
            labelOffsetY: y - anchor.y
          });
        }
        forceUpdate();
        return;
      }

      const targetX = x - dragging.grabOffset.x;
      const targetY = y - dragging.grabOffset.y;

      if (
        newWaypoints[dragging.waypointIndex].mode === "floating" ||
        newWaypoints[dragging.waypointIndex].mode === "divider"
      ) {
        const closest = findClosestPoint(pathD, {
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
      updateRelationship(data.id, { waypoints: newWaypoints });
    };

    const handlePointerUp = () => {
      if (dragging.isLabel) {
        setUndoStack((prev) => [
          ...prev,
          {
            action: Action.EDIT,
            element: ObjectType.RELATIONSHIP,
            rid: data.id,
            undo: { 
              labelRatio: dragging.initialLabelPos.ratio,
              labelOffsetX: dragging.labelOffset.x,
              labelOffsetY: dragging.labelOffset.y
            },
            redo: { 
              labelRatio: data.labelRatio,
              labelOffsetX: data.labelOffsetX,
              labelOffsetY: data.labelOffsetY
            },
            message: t("edit_relationship", {
              refName: data.name,
              extra: `[${t("move_label") || "Move label"}]`,
            }),
          },
        ]);
      } else {
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
      }
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
    const commander = new PathCommander(pathD);
    const pathLength = commander.getTotalLength();
    let changed = false;

    const hasFloatingWaypoints = (data.waypoints || []).some(
      (wp) => wp.mode === "floating" || wp.mode === "divider",
    );

    if (!hasFloatingWaypoints) return;

    let newWaypoints = (data.waypoints || []).map((wp) => {
      if (wp.mode === "floating" || wp.mode === "divider") {
        if (wp.pathRatio !== undefined) {
          const point = commander.getPointAtLength(wp.pathRatio * pathLength);
          if (
            Math.abs(point.x - wp.x) > 0.1 ||
            Math.abs(point.y - wp.y) > 0.1
          ) {
            changed = true;
            return { ...wp, x: point.x, y: point.y };
          }
        } else {
          // Initialize pathRatio if missing
          const ratio = findClosestPoint(pathD, { x: wp.x, y: wp.y }).ratio;
          const point = commander.getPointAtLength(ratio * pathLength);
          changed = true;
          return { ...wp, x: point.x, y: point.y, pathRatio: ratio };
        }
      }
      return wp;
    });

    if (changed) {
      // Use a timeout to push the state update out of the render cycle
      const timer = setTimeout(() => {
        updateRelationship(data.id, {
          waypoints: newWaypoints,
        });
      }, 0);
      return () => clearTimeout(timer);
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
}
