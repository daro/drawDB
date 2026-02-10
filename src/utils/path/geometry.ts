import SVGPathCommander, { PathArray } from "svg-path-commander";
import { PathCommander } from "./PathCommander";
import { Point, DrawableNode } from "./types";
import { IPoint } from "../../types";

/**
 * Geometry helpers for building SVG path segments with rounded corners.
 */

/**
 * Calculates a safe radius for a corner to prevent visual artifacts on short segments.
 */
function clampRadius(
  p1: IPoint,
  c: IPoint,
  p3: IPoint,
  radius: number
): number {
  return Math.max(
    0,
    Math.min(
      radius,
      Math.abs(c.x - p1.x) / 2 || radius,
      Math.abs(c.y - p1.y) / 2 || radius,
      Math.abs(p3.x - c.x) / 2 || radius,
      Math.abs(p3.y - c.y) / 2 || radius,
    )
  );
}

/**
 * Calculates the X-coordinate of the contact point on a node.
 * 
 * Visual representation:
 * [ Node ] <--- (contact point)
 * 
 * @param node The node (Table or Waypoint) for which we calculate the contact point.
 * @param otherNode The target node the line is pointing to (used to determine which side to connect to).
 * @param xOffset Horizontal offset (e.g., for multiple relationships on one field).
 * @returns The X-coordinate of the contact point.
 */
export function getContactX(
  node: DrawableNode,
  otherNode: DrawableNode,
  xOffset = 0
): number {
  // Determine the side based on node centers
  const isLeftSide = (otherNode.x + otherNode.width / 2) < (node.x + node.width / 2);
  const baseBuffer = isLeftSide ? node.x : node.x + node.width;
  
  // Waypoints don't have offsets (they connect directly at their center)
  const effectiveOffset = node.isWaypoint ? 0 : xOffset;
  return baseBuffer + (isLeftSide ? -effectiveOffset : effectiveOffset);
}

/**
 * Calculates the Y-coordinate of the contact point on a node.
 * 
 * @param node The node (Table or Waypoint).
 * @param verticalOffset Total vertical offset from the node's Y coordinate to the contact point.
 * @returns The Y-coordinate of the contact point.
 */
export function getContactY(
  node: DrawableNode,
  verticalOffset: number
): number {
  if (node.isWaypoint) return node.y;
  return node.y + verticalOffset;
}

/**
 * Generates an SVG path string for an orthogonal connection (two segments).
 */
export function getOrthogonalSegments(p1: IPoint, p2: IPoint, margin = 20): PathArray {
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;

  const absDx = Math.abs(dx);
  const absDy = Math.abs(dy);

  // Jeśli punkty są bardzo blisko w pionie, rysujemy linię prostą
  if (absDy <= 2) {
    return [["L", p2.x, p2.y]];
  }

  // Wymuszony margines wyjściowy (poziomy)
  const exitX = p1.x + (dx > 0 ? margin : -margin);

  // Jeśli mamy wystarczająco dużo miejsca na margines i powrót
  if (absDx > margin * 2) {
    const midX = p1.x + dx / 2;
    return [
      ["L", midX, p1.y],
      ["L", midX, p2.y],
      ["L", p2.x, p2.y],
    ];
  }

  // Standardowy łamany segment z marginesem, jeśli to możliwe
  return [
    ["L", exitX, p1.y],
    ["L", exitX, p2.y],
    ["L", p2.x, p2.y],
  ];
}

/**
 * Generates an SVG path string for a smooth Manhattan connection.
 */
export function getManhattanSegments(
  p1: IPoint,
  p2: IPoint,
  radius: number,
  sideMargin: number,
): PathArray {
  const dy = Math.abs(p1.y - p2.y);
  const dx = Math.abs(p1.x - p2.x);

  if (dy <= 2) {
    return [["L", p2.x, p2.y]];
  }

  const minMargin = Math.max(sideMargin, radius + 15);
  let midX: number;

  if (dx < minMargin) {
    const direction = p2.x >= p1.x ? 1 : -1;
    const isActuallyBehind = (direction === 1 && p2.x < p1.x + 2) || (direction === -1 && p2.x > p1.x - 2);
    
    if (isActuallyBehind) {
      midX = p1.x + minMargin * direction;
    } else {
      midX = p1.x;
    }
  } else {
    midX = (p1.x + p2.x) / 2;
    if (p1.x <= p2.x) {
      midX = Math.max(midX, p1.x + minMargin);
      midX = Math.min(midX, p2.x - minMargin);
    } else {
      midX = Math.min(midX, p1.x - minMargin);
      midX = Math.max(midX, p2.x + minMargin);
    }
  }

  const isLooping = (p1.x <= p2.x && midX < p1.x) || (p1.x > p2.x && midX > p1.x);
  if (isLooping) {
     const direction = p2.x >= p1.x ? 1 : -1;
     midX = p1.x + minMargin * direction;
  }

  return [
    ["L", midX, p1.y],
    ["L", midX, p2.y],
    ["L", p2.x, p2.y]
  ];
}

/**
 * Generates an SVG path string between two points, automatically choosing the routing style.
 */
export function getSegmentPath(
  p1: IPoint,
  p2: IPoint,
  radius: number,
  isOrthogonal = true,
  sideMargin = 20,
): string {
  const segments: PathArray = [["M", p1.x, p1.y]];
  if (isOrthogonal) {
    segments.push(...getOrthogonalSegments(p1, p2, sideMargin));
  } else {
    segments.push(...getManhattanSegments(p1, p2, radius, sideMargin));
  }
  
  const processedSegments = radius > 0 
    ? PathCommander.roundCorners(segments, radius) 
    : segments;

  return PathCommander.pathToString(processedSegments as any);
}
