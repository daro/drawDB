import React from "react";
import { ITable } from "@types";
import { IconSimilarity } from "@douyinfe/semi-icons";

interface LinkingLayerProps {
  linking: boolean;
  linkingLine: {
    startX: number;
    startY: number;
    endX: number;
    endY: number;
    startFieldId: string | number;
    startTableId: string | number;
  };
  tables: ITable[];
  pointer: {
    spaces: {
      diagram: {
        x: number;
        y: number;
      };
    };
  };
  hoveredTable: {
    tableId: string | number | null;
  };
}

const LinkingLayer: React.FC<LinkingLayerProps> = ({
  linking,
  linkingLine,
  tables,
  pointer,
  hoveredTable,
}) => {
  if (!linking) return null;

  return (
    <g pointerEvents="none" className="touch-none">
      {linkingLine.startFieldId !== "" ? (
        <path
          d={`M ${linkingLine.startX} ${linkingLine.startY} L ${linkingLine.endX} ${linkingLine.endY}`}
          stroke="red"
          strokeDasharray="8,8"
        />
      ) : (
        (() => {
          const startTable = tables.find(
            (t) => t?.id === linkingLine.startTableId,
          );
          if (!startTable) return null;
          return (
            <g>
              <path
                d={`M ${startTable.x + startTable.width / 2} ${
                  startTable.y + (startTable.height || 0) / 2
                } L ${pointer.spaces.diagram.x} ${pointer.spaces.diagram.y}`}
                stroke="#0084d1"
                strokeWidth="2"
                strokeDasharray="4"
              />
              <g
                transform={`translate(${pointer.spaces.diagram.x - 12}, ${
                  pointer.spaces.diagram.y - 12
                })`}
              >
                <IconSimilarity
                  style={{ color: "#0084d1", fontSize: "24px" }}
                />
              </g>
            </g>
          );
        })()
      )}
      {hoveredTable.tableId && (
        <rect
          x={(tables.find((t) => t?.id === hoveredTable.tableId)?.x || 0) - 5}
          y={(tables.find((t) => t?.id === hoveredTable.tableId)?.y || 0) - 5}
          width={
            (tables.find((t) => t?.id === hoveredTable.tableId)?.width || 0) + 10
          }
          height={
            ((tables.find((t) => t?.id === hoveredTable.tableId)?.height || 0) ||
              0) + 10
          }
          fill="none"
          stroke="#0084d1"
          strokeWidth="2"
          strokeDasharray="4"
          rx="5"
        />
      )}
    </g>
  );
};

export default React.memo(LinkingLayer);
