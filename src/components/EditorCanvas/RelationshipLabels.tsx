import React, { RefObject, useLayoutEffect, useState } from "react";
import { IRelationship } from "../../types";

interface RelationshipLabelsProps {
  name: string;
  labelX: number;
  labelY: number;
  labelRef: RefObject<SVGTextElement>;
  isAnimated: boolean;
  isHovered: boolean;
  isSelected: boolean;
  mode: "light" | "dark";
  sideLabelStartX?: number;
  sideLabelStartY?: number;
  sideLabelStart?: string;
  sideLabelEndX?: number;
  sideLabelEndY?: number;
  sideLabelEnd?: string;
  relationshipNameFontSize?: number;
  relationshipSideLabelFontSize?: number;
  showRelationshipNames?: boolean;
  showRelationshipLabels?: boolean;
  nameRotation?: number;
  handleWaypointPointerDown?: (e: React.PointerEvent, index: number) => void;
  dividerIndex?: number;
}

function RelationshipLabels({
  name,
  labelX,
  labelY,
  labelRef,
  isAnimated,
  isHovered,
  mode,
  sideLabelStartX,
  sideLabelStartY,
  sideLabelStart,
  sideLabelEndX,
  sideLabelEndY,
  sideLabelEnd,
  relationshipNameFontSize = 16,
  relationshipSideLabelFontSize = 12,
  showRelationshipNames = true,
  showRelationshipLabels = true,
  nameRotation = 0,
  handleWaypointPointerDown,
  dividerIndex,
  isSelected,
}: RelationshipLabelsProps) {
  const [bbox, setBbox] = useState<{ x: number; y: number; width: number; height: number } | null>(null);

  useLayoutEffect(() => {
    if (labelRef.current) {
      setBbox(labelRef.current.getBBox());
    }
  }, [name, relationshipNameFontSize, nameRotation]);

  const padding = 4;

  return (
    <>
        {showRelationshipNames && (
          <g
            className="cursor-move"
            onPointerDown={(e) => {
              e.stopPropagation();
              if (handleWaypointPointerDown) {
                handleWaypointPointerDown(e, dividerIndex ?? -1);
              }
            }}
          >
            <text
              x={labelX}
              y={labelY}
              fill={mode === "dark" ? "lightgrey" : "#333"}
              fontSize={relationshipNameFontSize}
              fontWeight={400}
              ref={labelRef}
              textAnchor="middle"
              dominantBaseline="central"
              className="group-hover:fill-sky-600"
              style={{ opacity: isAnimated || isHovered ? 0.6 : 1 }}
              transform={nameRotation !== 0 ? `rotate(${nameRotation}, ${labelX}, ${labelY})` : undefined}
            >
              {name}
            </text>
            {isSelected && bbox && (
              <rect
                x={labelX - bbox.width / 2 - padding}
                y={labelY - bbox.height / 2 - padding}
                width={bbox.width + padding * 2}
                height={bbox.height + padding * 2}
                fill="none"
                stroke="#0084d1"
                strokeWidth={1}
                strokeDasharray="4, 4"
                pointerEvents="none"
                transform={nameRotation !== 0 ? `rotate(${nameRotation}, ${labelX}, ${labelY})` : undefined}
              />
            )}
          </g>
        )}
      {sideLabelStart && showRelationshipLabels && sideLabelStartX !== undefined && sideLabelStartY !== undefined && (
        <text
          x={sideLabelStartX}
          y={sideLabelStartY - 5}
          fill={mode === "dark" ? "lightgrey" : "#666"}
          fontSize={relationshipSideLabelFontSize}
          fontWeight={400}
          textAnchor={sideLabelStartX < (labelX + (labelRef.current?.getBBox().width ?? 0) / 2) ? "start" : "end"}
          className="group-hover:fill-sky-600"
          style={{ opacity: isAnimated || isHovered ? 0.6 : 1 }}
        >
          {sideLabelStart}
        </text>
      )}
      {sideLabelEnd && showRelationshipLabels && sideLabelEndX !== undefined && sideLabelEndY !== undefined && (
        <text
          x={sideLabelEndX}
          y={sideLabelEndY - 5}
          fill={mode === "dark" ? "lightgrey" : "#666"}
          fontSize={relationshipSideLabelFontSize}
          fontWeight={400}
          textAnchor={sideLabelEndX < (labelX + (labelRef.current?.getBBox().width ?? 0) / 2) ? "start" : "end"}
          className="group-hover:fill-sky-600"
          style={{ opacity: isAnimated || isHovered ? 0.6 : 1 }}
        >
          {sideLabelEnd}
        </text>
      )}
    </>
  );
}

export default React.memo(RelationshipLabels);
