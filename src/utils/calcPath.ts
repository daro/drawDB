import { PathArray, getClosestPoint } from "svg-path-commander";
import {
  getContactX,
  getContactY,
} from "./path/geometry";
import { PathCommander } from "./path/PathCommander";
import { DrawableNode, RelationshipData, PathOptions } from "./path/types";
import { TABLE_CONFIG } from "@data/constants";
import { IPoint } from "@types";
import { waypointRouter } from "./path/routers/waypointRouter";
import { bracketRouter } from "./path/routers/bracketRouter";
import { directRouter } from "./path/routers/directRouter";
import { sCurveRouter } from "./path/routers/sCurveRouter";
import { RouterInput, PathSectionType, PathSection } from "./path/routers/types";
import { addToDebugConsole } from "./debug";

export interface RenderablePath {
  segments: PathArray;
  type: PathSectionType;
  metadata?: any;
}

/**
 * Finalizes, optimizes, and rounds the SVG path segments.
 * Returns PathArray instead of string to avoid intermediate serializations.
 */
function finalizeAndOptimize(segments: PathArray, radius = 0): PathArray {
  if (!segments || segments.length === 0) return [];
  try {
    // roundPath rounds coordinates to 2 decimal places by default
    let processedSegments = PathCommander.roundPath(segments, 2);

    if (radius > 0) {
      processedSegments = PathCommander.roundCorners(processedSegments, radius);
    }

    // Use clean to remove redundant MoveTo segments
    return PathCommander.clean(processedSegments);
  } catch (e) {
    console.error("Failed to finalize path:", e);
    return segments;
  }
}

export const findClosestPoint = (
  pathD: string,
  point: { x: number; y: number },
) => {
  const commander = new PathCommander(pathD);
  const pathLength = commander.getTotalLength();
  const closest = getClosestPoint(pathD, point);

  // svg-path-commander doesn't return ratio easily, we still need to calculate it.
  // We'll use the properties at length to find the ratio if needed, 
  // or stick to the point and then find the distance.
  
  // Since we want the ratio, we can use a more precise method if getClosestPoint 
  // only gives us coordinates. 
  // For now, let's keep the manual implementation but allow it to take pathD string 
  // instead of a DOM node to be consistent with PathCommander.
  
  // Actually, let's use a hybrid approach or refine the existing one to be node-less.
  
  // Re-implementing findClosestPoint without DOM dependency:
  const precision = 100; // Increased precision for initial scan
  let bestPoint = { x: 0, y: 0 };
  let bestLength = 0;
  let bestDistance = Infinity;

  for (let i = 0; i <= precision; i++) {
    const scanLength = (i / precision) * pathLength;
    const scan = commander.getPointAtLength(scanLength);
    const dist = Math.sqrt((scan.x - point.x) ** 2 + (scan.y - point.y) ** 2);
    if (dist < bestDistance) {
      bestDistance = dist;
      bestLength = scanLength;
      bestPoint = scan;
    }
  }

  // Refine with binary search
  let delta = pathLength / (precision * 2);
  while (delta > 0.1) {
    const l1 = Math.max(0, bestLength - delta);
    const p1 = commander.getPointAtLength(l1);
    const d1 = Math.sqrt((p1.x - point.x) ** 2 + (p1.y - point.y) ** 2);

    const l2 = Math.min(pathLength, bestLength + delta);
    const p2 = commander.getPointAtLength(l2);
    const d2 = Math.sqrt((p2.x - point.x) ** 2 + (p2.y - point.y) ** 2);

    if (d1 < bestDistance) {
      bestDistance = d1;
      bestLength = l1;
      bestPoint = p1;
    } else if (d2 < bestDistance) {
      bestDistance = d2;
      bestLength = l2;
      bestPoint = p2;
    }
    delta /= 2;
  }

  return {
    x: bestPoint.x,
    y: bestPoint.y,
    ratio: bestLength / pathLength,
  };
};

/**
 * Calculates the vertical offset for a contact point on a table field.
 */
function calculateVerticalOffset(
  fieldIndex: number,
  yOffset: number,
  yCorrection: number,
  zoom: number
): number {
  return (
    (TABLE_CONFIG.HEADER.HEIGHT +
      TABLE_CONFIG.HEADER.COLOR_STRIP_HEIGHT +
      fieldIndex * TABLE_CONFIG.FIELD_HEIGHT +
      TABLE_CONFIG.FIELD_HEIGHT / 2 +
      yOffset +
      yCorrection) *
    zoom
  );
}

/**
 * Główna funkcja obliczająca ścieżkę SVG dla relacji między tabelami.
 * Obsługuje:
 * 1. Proste połączenia typu S-Curve (Direct/Rounded).
 * 2. Trasowanie klamrowe [ ] dla tabel ułożonych pionowo.
 * 3. Punkty kontrolne (Waypoints) z inteligentnym omijaniem kolizji.
 * 
 * @param r Dane relacji (tabele, pola, offsety, waypoints).
 * @param options Opcje renderowania (zoom, margin, radius).
 * @returns Lista sfinalizowanych segmentów ścieżki.
 */
export function calcPath(
  r: RelationshipData,
  options: PathOptions = { zoom: 1, sideMargin: 20, radius: 10 }
): RenderablePath[] {
  if (!r || !r.startTable || !r.endTable) return [];

  const radius = options.radius * options.zoom;
  const margin = options.sideMargin * options.zoom;

  // Reprezentacja tabel jako DrawableNode (unifikacja z waypointami)
  const startNode: DrawableNode = {
    ...r.startTable,
    width: r.startTable.width * options.zoom,
    height: 0,
    isWaypoint: false,
  };
  const endNode: DrawableNode = {
    ...r.endTable,
    width: r.endTable.width * options.zoom,
    height: 0,
    isWaypoint: false,
  };

  // Filtrowanie i unifikacja punktów kontrolnych
  const waypoints = (r.waypoints || [])
    .filter((wp) => wp.mode !== "floating" && wp.mode !== "divider")
    .map(
      (wp) =>
        ({ ...wp, width: 0, height: 0, isWaypoint: true }) as DrawableNode,
    );

  // Referencje do sąsiednich węzłów dla punktu startowego i końcowego
  const firstRef = waypoints.length > 0 ? waypoints[0] : endNode;
  const lastRef =
    waypoints.length > 0 ? waypoints[waypoints.length - 1] : startNode;

  // Obliczenie punktów bazowych na krawędziach tabel
  const start: IPoint = {
    x: getContactX(startNode, firstRef, r.startXOffset),
    y: getContactY(
      startNode,
      calculateVerticalOffset(
        r.startFieldIndex,
        r.startYOffset,
        r.startYCorrection,
        options.zoom,
      ),
    ),
  };

  const end: IPoint = {
    x: getContactX(endNode, lastRef, r.endXOffset),
    y: getContactY(
      endNode,
      calculateVerticalOffset(
        r.endFieldIndex,
        r.endYOffset,
        r.endYCorrection,
        options.zoom,
      ),
    ),
  };

  const input: RouterInput = {
    r,
    options,
    start,
    end,
    startNode,
    endNode,
    margin,
    radius,
  };

  const processResult = (sections: PathSection[]): RenderablePath[] => {
    return sections.map((section) => ({
      segments: finalizeAndOptimize(section.segments, radius),
      type: section.type,
      metadata: section.metadata,
    }));
  };

  const wpPath = waypointRouter(input);
  if (wpPath) {
    addToDebugConsole(1, `ROUTER_REL_${r.id}`, "WAYPOINT");
    return processResult(wpPath);
  }

  const brPath = bracketRouter(input);
  if (brPath) {
    addToDebugConsole(8, `ROUTER_REL_${r.id}`, "BRACKET");
    return processResult(brPath);
  }

  const dirPath = directRouter(input);
  if (dirPath) {
    addToDebugConsole(8, `ROUTER_REL_${r.id}`, "DIRECT");
    return processResult(dirPath);
  }

  addToDebugConsole(8, `ROUTER_REL_${r.id}`, "S-CURVE");
  const finalSections = sCurveRouter(input);
  return finalSections ? processResult(finalSections) : [];
}

