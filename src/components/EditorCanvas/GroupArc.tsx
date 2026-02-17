import React, { useMemo } from "react";
import { useDiagram, useSettings, useSelect } from "@hooks";
import { ObjectType } from "@data/constants";
import { calcGroupPoints, calcGroupPath } from "@utils/calcGroupPath";

interface GroupArcProps {
  data: {
    id: string | number;
    parentTableId: string | number;
    childRelationshipIds: (string | number)[];
  };
  type: "XOR" | "OR";
  onPointerDown: (e: React.PointerEvent) => void;
}

export default function GroupArc({ data, type, onPointerDown }: GroupArcProps) {
  const { tables, relationships } = useDiagram();
  const { settings } = useSettings();
  const { selectedElement, setSelectedElement, bulkSelectedElements, emitSelect } = useSelect();

  const isSelected =
    (selectedElement.id === data.id &&
    selectedElement.element === (type === "XOR" ? ObjectType.XOR_GROUP : ObjectType.OR_GROUP)) ||
    bulkSelectedElements.some(
      (e) =>
        e.id === data.id &&
        e.type === (type === "XOR" ? ObjectType.XOR_GROUP : ObjectType.OR_GROUP),
    );

  const points = useMemo(
    () => calcGroupPoints(data, tables, relationships),
    [tables, relationships, data],
  );

  if (!points || points.length < 2) return null;

  const firstPoint = points[0];
  const lastPoint = points[points.length - 1];
  const isLeftSide = firstPoint.isStart;

  const strokeColor = isSelected
    ? "#0084d1"
    : settings.mode === "dark"
      ? "lightgrey"
      : "grey";

  const symbolSize = 10;
  const width = 30;
  const horizontalOffset = 41;
  const startY = firstPoint.y - 40;
  const endY = lastPoint.y + 40;
  const totalHeight = endY - startY;
  const isRight = !isLeftSide;

  const d = calcGroupPath(isRight, firstPoint.x, width, totalHeight, type === "XOR" ? 20 : 10, horizontalOffset);

  const arcX = firstPoint.x + (width + horizontalOffset) * (isRight ? 1 : -1);

  return (
    <g
      className="cursor-pointer select-none"
      transform={`translate(0, ${startY})`}
      onPointerDown={(e) => {
        if (e.defaultPrevented) return;
        onPointerDown(e);
        emitSelect(data.id, type === "XOR" ? ObjectType.XOR_GROUP : ObjectType.OR_GROUP, e);
      }}
      onDoubleClick={(e) => {
        e.stopPropagation();
        setSelectedElement({
          ...selectedElement,
          id: data.id,
          element: type === "XOR" ? ObjectType.XOR_GROUP : ObjectType.OR_GROUP,
          open: true,
        });
      }}
    >
      <path
        d={d}
        fill="none"
        stroke={strokeColor}
        strokeWidth={isSelected ? 3 : 2}
      />
      {points.map((p, i) => (
        <g key={`symbol-${i}`} transform={`translate(${arcX}, ${p.y - startY})`}>
          <circle
            r={symbolSize}
            fill="none"
            stroke={strokeColor}
            strokeWidth={1.5}
          />
        </g>
      ))}
    </g>
  );
}
