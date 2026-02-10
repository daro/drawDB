import { Dropdown } from "@douyinfe/semi-ui";
import { IRelationship, IWaypoint } from "../../types";
import { ObjectType } from "../../data/constants";
import { findClosestPoint } from "../../utils/calcPath";
import { RefObject } from "react";
import { useTranslation } from "react-i18next";

interface WaypointMarkersProps {
  data: IRelationship;
  isHighlighted: boolean;
  selectedElement: any;
  bulkSelectedElements: any[];
  measurePathRef: RefObject<SVGPathElement>;
  updateRelationship: (id: string | number, data: Partial<IRelationship>) => void;
  removeWaypoint: (index: number) => void;
  handleWaypointPointerDown: (e: React.PointerEvent, index: number) => void;
}

export default function WaypointMarkers({
  data,
  isHighlighted,
  selectedElement,
  bulkSelectedElements,
  measurePathRef,
  updateRelationship,
  removeWaypoint,
  handleWaypointPointerDown,
  pathD,
}: WaypointMarkersProps & { pathD: string }) {
  const { t } = useTranslation();

  if (!(isHighlighted || (selectedElement.id == data.id && selectedElement.element === ObjectType.RELATIONSHIP))) {
    return null;
  }

  return (
    <>
      {(data.waypoints || []).map((wp, i) => {
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

                    if ((newMode === "floating" || newMode === "divider")) {
                      const closest = findClosestPoint(pathD, {
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
                    : wp.mode === "floating"
                    ? "#ff9800"
                    : wp.mode === "divider"
                    ? "#4caf50"
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
                  fill="white"
                  className="pointer-events-none"
                />
              )}
            </g>
          </Dropdown>
        );
      })}
    </>
  );
}
