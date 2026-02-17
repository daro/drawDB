import React from "react";
import { Cardinality, ObjectType, TABLE_CONFIG } from "@data/constants";
import { IRelationship, ITable } from "@types";
import { RenderablePath } from "@utils/calcPath";
import { PathCommander } from "@utils/path/PathCommander";

interface RelationshipPathProps {
  data: IRelationship;
  pathD: string;
  pathSegments: RenderablePath[];
  pathLength: number;
  isAnimated: boolean;
  isHovered: boolean;
  isSelected: boolean;
  startTable: ITable;
  settings: any;
  cardinalityOffset: number;
  dividerWp: any;
  dividerRatio: number;
  t: (key: string, options?: any) => string;
  measurePathRef: React.RefObject<SVGPathElement>;
  selectedElement: any;
  setSelectedElement: (val: any) => void;
  bulkSelectedElements: any[];
  setBulkSelectedElements: (val: any | ((prev: any[]) => any[])) => void;
  onPointerDown: (e: React.PointerEvent) => void;
  edit?: (e: React.MouseEvent) => void;
  emitSelect: (id: string | number, type: number, event: React.PointerEvent | PointerEvent) => void;
}

const RelationshipPath: React.FC<RelationshipPathProps> = ({
  data,
  pathD,
  pathSegments,
  pathLength,
  isAnimated,
  isHovered,
  isSelected,
  startTable,
  settings,
  cardinalityOffset,
  dividerWp,
  dividerRatio,
  t,
  measurePathRef,
  selectedElement,
  setSelectedElement,
  bulkSelectedElements,
  setBulkSelectedElements,
  onPointerDown,
  edit,
  emitSelect,
}) => {
  const isOneToOne = data.cardinality === Cardinality.ONE_TO_ONE || 
                   data.cardinality === t(Cardinality.ONE_TO_ONE);
  const isManyToOne = data.cardinality === Cardinality.MANY_TO_ONE || 
                    data.cardinality === t(Cardinality.MANY_TO_ONE);
  const isOneToMany = data.cardinality === Cardinality.ONE_TO_MANY || 
                    data.cardinality === t(Cardinality.ONE_TO_MANY);

  const commonStrokeColor = isSelected
    ? "#0084d1"
    : settings.outboundRelationsInTableColor
      ? startTable?.color
      : undefined;

  const animStrokeColor = isSelected
    ? "#0084d1"
    : settings.relationAnimationsInTableColor
      ? startTable?.color || "#0084d1"
      : "#0084d1";

  const commonDashOffset = settings.relationshipStyle === "erd" ? -cardinalityOffset : 0;

  const isDashed = data.identifying === false || (dividerWp && data.identifying !== false && (isOneToMany || isManyToOne));

  const handlePointerDownWithBulk = (e: React.PointerEvent) => {
    if (e.defaultPrevented) return;
    if (e.button !== 0) return;
    onPointerDown(e);
    e.stopPropagation();
    emitSelect(data.id, ObjectType.RELATIONSHIP, e);
  };

  const renderDebugPath = () => pathSegments.map((segment, idx) => {
    const sectionTypes = ['start-bracket', 'waypoint-connector', 'end-bracket', 'direct-segment', 's-curve', 'bracket'];
    const typeIndex = sectionTypes.indexOf(segment.type);
    const debugColor = typeIndex !== -1 
      ? TABLE_CONFIG.DEFAULT_COLORS[typeIndex % TABLE_CONFIG.DEFAULT_COLORS.length] 
      : undefined;

    return (
      <path
        key={`${data.id}-debug-${idx}`}
        d={PathCommander.pathToString(segment.segments)}
        strokeLinejoin="round"
        style={{ stroke: debugColor }}
        fill="none"
        cursor="pointer"
        strokeLinecap="butt"
        strokeDashoffset={commonDashOffset}
        strokeDasharray={isDashed ? "8, 8" : "0"}
      />
    );
  });

  const renderDividerOverlap = () => {
    if (!dividerWp || pathLength <= 0 || data.identifying === false || !(isOneToMany || isManyToOne)) return null;
    const kreski = isManyToOne
      ? `${pathLength * (dividerRatio || 0.5)}, ${pathLength}`
      : `0, ${pathLength * (dividerRatio || 0.5)}, ${pathLength}`;
    return (
      <path
        d={pathD}
        fill="none"
        strokeLinejoin="round"
        className="relationship-path"
        style={{ stroke: commonStrokeColor }}
        strokeDashoffset={commonDashOffset}
        strokeDasharray={ kreski }
      />
    );
  };

  const renderAnimationLayer = () => {
    if (!(isAnimated || isHovered || isSelected)) return null;

    return (
      <path
        d={pathD}
        fill="none"
        strokeLinejoin="round"
        className={
          data.identifying !== false
            ? "animated-path"
            : isOneToOne
              ? "one-to-one-animated"
              : "non-identifying-animated"
        }
        style={{ stroke: animStrokeColor }}
        strokeLinecap="round"
        strokeDashoffset={0}
        strokeDasharray={data.identifying !== false ? "0 30" : "12 8"}
      />
    );
  };

  return (
    <>
      {/* Hidden path for measurement */}
      <path ref={measurePathRef} d={pathD} fill="none" stroke="none" pointerEvents="none" />

       Main relationship path group
      <g className="relationship-path"
         onPointerDown={handlePointerDownWithBulk}
         onDoubleClick={edit}>
        {settings.debugPath ? renderDebugPath() : (
          <path
            d={pathD}
            strokeLinejoin="round"
            className="relationship-path"
            style={{ stroke: commonStrokeColor }}
            fill="none"
            cursor="pointer"
            strokeLinecap="butt"
            strokeDashoffset={commonDashOffset}
            strokeDasharray={isDashed ? "8, 8" : "0"}
          />
        )}
      </g>

      <g pointerEvents="none">
        {renderDividerOverlap()}
        {renderAnimationLayer()}
      </g>

      {/* Invisible wider path for better hover UX - placed here to be on top of dashed lines */}
      <path
        d={pathD}
        fill="none"
        stroke="transparent"
        strokeWidth={12}
        strokeLinejoin="round"
        cursor="pointer"
        onPointerDown={handlePointerDownWithBulk}
        onDoubleClick={edit}
      />
    </>
  );
};

export default React.memo(RelationshipPath);
