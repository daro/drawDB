import React from "react";
import { GRID_CONFIG } from "../../data/constants";

interface GridBackgroundProps {
  show: boolean;
  viewBox: {
    left: number;
    top: number;
    width: number;
    height: number;
  };
}

const GridBackground: React.FC<GridBackgroundProps> = ({ show, viewBox }) => {
  if (!show) return null;

  return (
    <>
      <defs>
        <pattern
          id="pattern-grid"
          x={-GRID_CONFIG.CIRCLE_RADIUS}
          y={-GRID_CONFIG.CIRCLE_RADIUS}
          width={GRID_CONFIG.SIZE}
          height={GRID_CONFIG.SIZE}
          patternUnits="userSpaceOnUse"
        >
          <circle
            cx={GRID_CONFIG.CIRCLE_RADIUS}
            cy={GRID_CONFIG.CIRCLE_RADIUS}
            r={GRID_CONFIG.CIRCLE_RADIUS}
            fill="rgb(99, 152, 191)"
            opacity="1"
          />
        </pattern>
      </defs>
      <rect
        x={viewBox.left}
        y={viewBox.top}
        width={viewBox.width}
        height={viewBox.height}
        fill="url(#pattern-grid)"
      />
    </>
  );
};

export default React.memo(GridBackground);
