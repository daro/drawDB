import SVGPathCommander, { PathArray, PathSegment, Options } from "svg-path-commander";

/**
 * Extended SVGPathCommander class with additional utility functions for path manipulation.
 */
export class PathCommander extends SVGPathCommander {
  /**
   * Creates an instance of PathCommander.
   * @param pathValue - The SVG path string.
   * @param config - Optional configuration for SVGPathCommander.
   */
  constructor(pathValue: string, config?: Partial<Options>) {
    super(pathValue, config);
  }

  /**
   * Rounds corners of a path defined by segments.
   * Only affects "L" (LineTo) segments followed by another "L" segment.
   *
   * @param segments - The array of path segments to process.
   * @param radius - The maximum radius for the rounded corners.
   * @returns A new PathArray with added "A" (Arc) segments for corners.
   */
  static roundCorners(segments: PathArray, radius: number): PathArray {
    if (radius <= 0 || segments.length <= 2) return segments;

    const result: PathArray = [segments[0]];

    for (let i = 1; i < segments.length; i++) {
      const prev = result[result.length - 1];
      const curr = segments[i];
      const next = segments[i + 1];

      // We only round corners between two consecutive "L" (LineTo) segments
      if (curr[0] === "L" && next && next[0] === "L") {
        const p1 = {
          x: Number(prev[prev.length - 2]),
          y: Number(prev[prev.length - 1]),
        };
        const p2 = { x: Number(curr[1]), y: Number(curr[2]) };
        const p3 = { x: Number(next[1]), y: Number(next[2]) };

        const dx1 = p1.x - p2.x;
        const dy1 = p1.y - p2.y;
        const dx2 = p3.x - p2.x;
        const dy2 = p3.y - p2.y;

        const len1 = Math.sqrt(dx1 * dx1 + dy1 * dy1);
        const len2 = Math.sqrt(dx2 * dx2 + dy2 * dy2);

        // Limit the radius by half the length of the adjacent segments to prevent overlapping corners
        const r = Math.min(radius, len1 / 2, len2 / 2);

        if (r > 1e-6) {
          const startX = p2.x + (dx1 / len1) * r;
          const startY = p2.y + (dy1 / len1) * r;
          const endX = p2.x + (dx2 / len2) * r;
          const endY = p2.y + (dy2 / len2) * r;

          // Determine the sweep flag based on the cross product of the two vectors
          // v1 = p1 - p2, v2 = p3 - p2
          const crossProduct = dx1 * dy2 - dy1 * dx2;

          // If the cross product is very small, segments are practically collinear
          // We use a normalized threshold for better stability across different scales
          const sinTheta = Math.abs(crossProduct) / (len1 * len2);
          if (sinTheta < 1e-4) {
            result.push(curr as PathSegment);
            continue;
          }

          // In SVG coordinate system (Y down), negative cross product means clockwise turn
          const sweepFlag = crossProduct < 0 ? 1 : 0;

          result.push(["L", startX, startY]);
          result.push(["A", r, r, 0, 0, sweepFlag, endX, endY]);
          continue;
        }
      }
      result.push(curr as PathSegment);
    }

    return result;
  }

  /**
   * Removes redundant "M" (MoveTo) segments from the path.
   * A segment is redundant if it moves the cursor to the point where it already is.
   *
   * @param segments - The array of path segments to clean.
   * @returns A new PathArray with redundant MoveTo segments removed.
   */
  static clean(segments: PathArray): PathArray {
    if (segments.length <= 1) return segments;

    const result: PathArray = [segments[0]];
    let currentX = Number(segments[0][1]);
    let currentY = Number(segments[0][2]);

    for (let i = 1; i < segments.length; i++) {
      const seg = segments[i];
      const command = seg[0];

      if (command === "M" || command === "m") {
        const isAbsolute = command === "M";
        const targetX = isAbsolute ? Number(seg[1]) : currentX + Number(seg[1]);
        const targetY = isAbsolute ? Number(seg[2]) : currentY + Number(seg[2]);

        // Skip the segment if the target point is the same as the current position (within precision)
        if (Math.abs(targetX - currentX) < 1e-6 && Math.abs(targetY - currentY) < 1e-6) {
          continue;
        }

        currentX = targetX;
        currentY = targetY;
      } else {
        // Update the current position tracking for all other commands
        // We assume the last two parameters of any drawing command are X and Y coordinates
        const xIdx = seg.length - 2;
        const yIdx = seg.length - 1;
        if (typeof seg[xIdx] === "number" && typeof seg[yIdx] === "number") {
          currentX = Number(seg[xIdx]);
          currentY = Number(seg[yIdx]);
        }
      }
      result.push(seg);
    }

    return result;
  }
}
