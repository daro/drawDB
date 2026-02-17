import React, { RefObject, useLayoutEffect, useState } from "react";
import { IRelationship } from "@types";
import Text from "./Text";

export interface RelationshipLabelsProps {
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
  labelOffsetX?: number;
  labelOffsetY?: number;
  onDoubleClick?: () => void;
  setBbox?: (bbox: { x: number; y: number; width: number; height: number } | null) => void;
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
  labelOffsetX = 0,
  labelOffsetY = 0,
  onDoubleClick,
  setBbox,
}: RelationshipLabelsProps) {
    const [localBbox, setLocalBbox] = useState<{ x: number; y: number; width: number; height: number } | null>(null);

    useLayoutEffect(() => {
      if (labelRef.current) {
        const newBbox = labelRef.current.getBBox();
        const currentBbox = localBbox;
        if (!currentBbox || newBbox.x !== currentBbox.x || newBbox.y !== currentBbox.y || newBbox.width !== currentBbox.width || newBbox.height !== currentBbox.height) {
          setLocalBbox(newBbox);
          if (setBbox) {
            setBbox(newBbox);
          }
        }
      }
    }, [name, relationshipNameFontSize, nameRotation, labelOffsetX, labelOffsetY]);

  const padding = 4;
  const width = localBbox?.width || 0;
  const height = localBbox?.height || 0;

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
          onDoubleClick={onDoubleClick}
          transform={`translate(${labelX - width / 2}, ${labelY - height / 2})`}
          style={{ pointerEvents: 'all', visibility: localBbox ? 'visible' : 'hidden' }}
        >
          <text
            ref={labelRef}
            x={0}
            y={0}
            style={{ visibility: 'hidden', pointerEvents: 'none' }}
            dominantBaseline="text-before-edge"
            fontSize={relationshipNameFontSize}
            fontWeight={400}
          >
            {name}
          </text>
          <Text
            data={{
              text: name,
              color: isSelected ? "#0084d1" : (mode === "dark" ? "lightgrey" : "#333"),
              fontSize: relationshipNameFontSize,
              fontWeight: 400,
              rotation: nameRotation,
            }}
            onPointerDown={() => {}}
          />
        </g>
      )}
      {sideLabelStart && showRelationshipLabels && sideLabelStartX !== undefined && sideLabelStartY !== undefined && (
        <text
          x={sideLabelStartX}
          y={sideLabelStartY - 5}
          fill={mode === "dark" ? "lightgrey" : "#666"}
          fontSize={relationshipSideLabelFontSize}
          fontWeight={400}
          textAnchor={sideLabelStartX < labelX ? "start" : "end"}
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
          textAnchor={sideLabelEndX < labelX ? "start" : "end"}
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
