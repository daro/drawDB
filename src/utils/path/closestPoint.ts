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
      beforePoint = { x: 0, y: 0 } as any;
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
      afterPoint = { x: 0, y: 0 } as any;
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
    x: (bestPoint as any).x,
    y: (bestPoint as any).y,
    ratio: bestLength / pathLength,
  };
};
