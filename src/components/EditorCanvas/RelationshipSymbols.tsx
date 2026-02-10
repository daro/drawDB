import SVGPathCommander, { PathArray } from "svg-path-commander";
import { useRef, useState, useEffect } from "react";

interface CardinalityLabelProps {
  x: number;
  y: number;
  text: string;
  r?: number;
  padding?: number;
}

export function CardinalityLabel({ x, y, text, r = 12, padding = 14 }: CardinalityLabelProps) {
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

export function IDEF1XCardinality({ x, y, angle, isMany, mode, color }: CardinalitySymbolProps) {
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

export function UMLCardinality({ x, y, angle, isMany, mode, color }: CardinalitySymbolProps) {
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

export function ERDCardinality({ x, y, angle, isMany, mode, color }: CardinalitySymbolProps) {
  const strokeColor = color || (mode === "dark" ? "lightgrey" : "#333");
  const size = 12;

  const segments: PathArray = [
    ["M", 0, -size / 1.5],
    ["L", 0, size / 1.5],
  ];

  if (isMany) {
    segments.push(["M", -size, -size / 1.5]);
    segments.push(["L", 0, 0]);
    segments.push(["L", -size, size / 1.5]);
    segments.push(["M", -size, 0]);
    segments.push(["L", 0, 0]);
  } else {
    segments.push(["M", 0, 0]);
    segments.push(["L", -size, 0]);
  }

  return (
    <g
      transform={`translate(${x}, ${y}) rotate(${angle})`}
      className="group-hover:stroke-sky-600"
    >
      <path
        d={SVGPathCommander.pathToString(segments)}
        stroke={strokeColor}
        strokeWidth={2}
        fill="none"
      />
    </g>
  );
}

interface RelationshipSymbolsProps {
  settings: any;
  cardinalityStartX: number;
  cardinalityStartY: number;
  angleStart: number;
  cardinalityStart: string;
  cardinalityEndX: number;
  cardinalityEndY: number;
  angleEnd: number;
  cardinalityEnd: string;
  isSelected?: boolean;
}

export const RelationshipSymbols: React.FC<RelationshipSymbolsProps> = ({
  settings,
  cardinalityStartX,
  cardinalityStartY,
  angleStart,
  cardinalityStart,
  cardinalityEndX,
  cardinalityEndY,
  angleEnd,
  cardinalityEnd,
  isSelected,
}) => {
  const selectedColor = isSelected ? "#0084d1" : undefined;

  return (
    <>
      {settings.relationshipStyle === "erd" && (
        <>
          <ERDCardinality
            x={cardinalityStartX}
            y={cardinalityStartY}
            angle={angleStart}
            isMany={cardinalityStart !== "1"}
            mode={settings.mode}
            color={selectedColor}
          />
          <ERDCardinality
            x={cardinalityEndX}
            y={cardinalityEndY}
            angle={angleEnd}
            isMany={cardinalityEnd !== "1"}
            mode={settings.mode}
            color={selectedColor}
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
            color={selectedColor}
          />
          <UMLCardinality
            x={cardinalityEndX}
            y={cardinalityEndY}
            angle={angleEnd}
            isMany={cardinalityEnd !== "1"}
            mode={settings.mode}
            color={selectedColor}
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
            color={selectedColor}
          />
          <IDEF1XCardinality
            x={cardinalityEndX}
            y={cardinalityEndY}
            angle={angleEnd}
            isMany={cardinalityEnd !== "1"}
            mode={settings.mode}
            color={selectedColor}
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
  );
};
