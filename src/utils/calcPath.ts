import { tableFieldHeight, tableHeaderHeight, tableColorStripHeight } from "../data/constants";
import { IWaypoint, ITable } from "../types";

interface RelationshipData {
  startTable: ITable;
  endTable: ITable;
  startFieldIndex: number;
  endFieldIndex: number;
}

/**
 * Generates an SVG path string to visually represent a relationship between two fields.
 */
function getSegmentPath(x1: number, y1: number, x2: number, y2: number, radius: number, isOrthogonal = false, sideMargin = 20) {
  if (isOrthogonal) {
    return ` L ${x2} ${y1} L ${x2} ${y2}`;
  }

  if (Math.abs(y1 - y2) <= 2) {
    return ` L ${x2} ${y2}`;
  }

  let midX = (x1 + x2) / 2;
  if (x1 <= x2) {
    midX = Math.max(midX, x1 + sideMargin);
    midX = Math.min(midX, x2 - sideMargin);
  } else {
    midX = Math.min(midX, x1 - sideMargin);
    midX = Math.max(midX, x2 + sideMargin);
  }

  let r = radius;
  if (Math.abs(y1 - y2) <= radius * 2) {
    r = Math.abs(y2 - y1) / 2.1;
  }

  if (y1 <= y2) {
    if (x1 <= x2) {
      return ` L ${midX - r} ${y1} A ${r} ${r} 0 0 1 ${midX} ${y1 + r} L ${midX} ${y2 - r} A ${r} ${r} 0 0 0 ${midX + r} ${y2} L ${x2} ${y2}`;
    } else {
      return ` L ${midX + r} ${y1} A ${r} ${r} 0 0 0 ${midX} ${y1 + r} L ${midX} ${y2 - r} A ${r} ${r} 0 0 1 ${midX - r} ${y2} L ${x2} ${y2}`;
    }
  } else {
    if (x1 <= x2) {
      return ` L ${midX - r} ${y1} A ${r} ${r} 0 0 0 ${midX} ${y1 - r} L ${midX} ${y2 + r} A ${r} ${r} 0 0 1 ${midX + r} ${y2} L ${x2} ${y2}`;
    } else {
      return ` L ${midX + r} ${y1} A ${r} ${r} 0 0 1 ${midX} ${y1 - r} L ${midX} ${y2 + r} A ${r} ${r} 0 0 0 ${midX - r} ${y2} L ${x2} ${y2}`;
    }
  }
}

export const findClosestPoint = (pathNode: SVGPathElement, point: { x: number, y: number }) => {
  const pathLength = pathNode.getTotalLength();
  let precision = 8;
  let bestPoint = { x: 0, y: 0 },
    bestLength = 0,
    bestDistance = Infinity;

  for (
    let scan, scanDistance, scanLength = 0;
    scanLength <= pathLength;
    scanLength += precision
  ) {
    try {
      scan = pathNode.getPointAtLength(scanLength);
    } catch (e) {
      continue;
    }
    scanDistance = Math.hypot(scan.x - point.x, scan.y - point.y);
    if (scanDistance < bestDistance) {
      bestPoint = scan;
      bestLength = scanLength;
      bestDistance = scanDistance;
    }
  }

  precision /= 2;
  while (precision > 0.5) {
    const beforeLength = bestLength - precision;
    let beforePoint;
    try {
      beforePoint = pathNode.getPointAtLength(Math.max(0, beforeLength));
    } catch (e) {
      beforePoint = { x: 0, y: 0 };
    }
    const beforeDistance = Math.hypot(
      beforePoint.x - point.x,
      beforePoint.y - point.y,
    );

    const afterLength = bestLength + precision;
    let afterPoint;
    try {
      afterPoint = pathNode.getPointAtLength(Math.min(pathLength, afterLength));
    } catch (e) {
      afterPoint = { x: 0, y: 0 };
    }
    const afterDistance = Math.hypot(
      afterPoint.x - point.x,
      afterPoint.y - point.y,
    );

    if (beforeLength >= 0 && beforeDistance < bestDistance) {
      bestPoint = beforePoint;
      bestLength = beforeLength;
      bestDistance = beforeDistance;
    } else if (afterLength <= pathLength && afterDistance < bestDistance) {
      bestPoint = afterPoint;
      bestLength = afterLength;
      bestDistance = afterDistance;
    } else {
      precision /= 2;
    }
  }

  return {
    x: bestPoint.x,
    y: bestPoint.y,
    ratio: bestLength / pathLength,
  };
};

export function calcPath(
  r: RelationshipData,
  startTableWidth = 200,
  endTableWidth = 200,
  zoom = 1,
  startYOffset = 0,
  endYOffset = 0,
  waypoints: IWaypoint[] = [],
  sideMargin = 20,
  startXOffset = 0,
  endXOffset = 0,
  startYCorrection = 0,
  endYCorrection = 0
): string {
  if (!r || !r.startTable || !r.endTable) {
    return "";
  }

  const sWidth = startTableWidth * zoom;
  const eWidth = endTableWidth * zoom;

  const getX = (
    table: ITable,
    _fieldIndex: number,
    otherTable: ITable | IWaypoint,
    otherTableWidth: number,
    isStart: boolean,
    xOffset = 0
  ): number => {
    const isLeftSide = otherTable.x + otherTableWidth / 2 < table.x + (isStart ? sWidth : eWidth) / 2;
    const baseBuffer = isLeftSide ? table.x : table.x + (isStart ? sWidth : eWidth);
    return baseBuffer + (isLeftSide ? -xOffset : xOffset);
  };

  const getY = (table: ITable, fieldIndex: number, offset: number, correction = 0): number => {
    return (
      table.y +
      tableHeaderHeight +
      tableColorStripHeight +
      fieldIndex * tableFieldHeight +
      tableFieldHeight / 2 +
      offset +
      correction
    );
  };

  const effectiveWaypoints = (waypoints || []).filter(
    (wp) => wp.mode !== "floating" && wp.mode !== "divider",
  );

  const firstRef = effectiveWaypoints.length > 0 ? effectiveWaypoints[0] : r.endTable;
  const lastRef = effectiveWaypoints.length > 0 ? effectiveWaypoints[effectiveWaypoints.length - 1] : r.startTable;

  let x1 = getX(r.startTable, r.startFieldIndex, firstRef, effectiveWaypoints.length > 0 ? 0 : eWidth, true, startXOffset);
  let y1 = getY(r.startTable, r.startFieldIndex, startYOffset, startYCorrection);

  let x2 = getX(r.endTable, r.endFieldIndex, lastRef, effectiveWaypoints.length > 0 ? 0 : sWidth, false, endXOffset);
  let y2 = getY(r.endTable, r.endFieldIndex, endYOffset, endYCorrection);

  const radius = 10 * zoom;
  const margin = sideMargin * zoom;

  if (waypoints && waypoints.length > 0) {
    let path = `M ${x1} ${y1}`;
    let prevX = x1;
    let prevY = y1;

    effectiveWaypoints.forEach((wp) => {
      path += getSegmentPath(prevX, prevY, wp.x, wp.y, radius, false, margin);
      prevX = wp.x;
      prevY = wp.y;
    });

    path += getSegmentPath(prevX, prevY, x2, y2, radius, false, margin);
    return path;
  }

  if (Math.abs(y1 - y2) <= 36 * zoom) {
    let rSize = Math.abs(y2 - y1) / 3;
    if (rSize <= 2) {
      return `M ${x1} ${y1} L ${x2} ${y2 + 0.1}`;
    }
  }

  return `M ${x1} ${y1}` + getSegmentPath(x1, y1, x2, y2, radius, false, margin);
}
