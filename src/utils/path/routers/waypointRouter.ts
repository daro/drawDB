import { PathArray } from "svg-path-commander";
import { PathCommander } from "../PathCommander";
import { IPoint } from "../../../types";
import { PathRouter, PathSection } from "./types";
import { getBracketSegment } from "./getBracketSegment";
import { getOrthogonalSegments } from "../geometry";

export const waypointRouter: PathRouter = ({
  r,
  options,
  start,
  end,
  startNode,
  endNode,
  margin,
  radius,
}) => {
  // Filtrujemy punkty kontrolne: pomijamy te w trybie "floating" (przyczepione do linii)
  // oraz "divider" (etykiety), zostawiając tylko fizyczne punkty łamania ścieżki.
  const waypoints = (r.waypoints || [])
    .filter((wp) => wp.mode !== "floating" && wp.mode !== "divider")
    .map((wp) => ({ ...wp, width: 0, height: 0, isWaypoint: true }));

  // Jeśli brak fizycznych waypointów, zwracamy null, co pozwala calcPath
  // spróbować innego routera (np. bracket lub direct).
  if (waypoints.length === 0) return null;

  const sections: PathSection[] = [];

  // 1. Pierwszy segment: od tabeli startowej do pierwszego waypointa.
  const firstSegments = getBracketSegment(
    start.x,
    start.y,
    waypoints[0].x,
    waypoints[0].y,
    startNode,
    waypoints[0],
    r,
    options,
    margin,
    radius,
    false,
    `bracket 1:`,
  );
  sections.push({
    type: 'start-bracket',
    segments: firstSegments
  });
  
  // 2. Środkowe segmenty: połączenia pod kątem prostym między kolejnymi waypointami.
  for (let i = 0; i < waypoints.length - 1; i++) {
    sections.push({
      type: 'waypoint-connector',
      segments: [
        ["M", waypoints[i].x, waypoints[i].y],
        ...getOrthogonalSegments(
          { x: waypoints[i].x, y: waypoints[i].y },
          { x: waypoints[i + 1].x, y: waypoints[i + 1].y },
          margin
        )
      ],
      metadata: { fromWaypointIndex: i, toWaypointIndex: i + 1 }
    });
  }

  // 3. Ostatni segment: od ostatniego waypointa do tabeli końcowej.
  const lastSegments = getBracketSegment(
    waypoints[waypoints.length - 1].x,
    waypoints[waypoints.length - 1].y,
    end.x,
    end.y,
    waypoints[waypoints.length - 1],
    endNode,
    r,
    options,
    margin,
    radius,
    true,
    `bracket 2:`,
  );
  sections.push({
    type: 'end-bracket',
    segments: lastSegments
  });

  return sections;
};
