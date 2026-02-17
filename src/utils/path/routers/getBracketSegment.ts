import { PathArray } from "svg-path-commander";
import { PathCommander } from "../PathCommander";
import { IPoint } from "@types";
import { getOrthogonalSegments, getManhattanSegments } from "../geometry";
import { PathOptions, RelationshipData } from "@types";
import { inRange } from "lodash";
import { addToDebugConsole } from "@utils/debug";

/**
 * Pomocnicza funkcja do rysowania segmentu "klamrowego" lub prostego.
 * Używana dla pierwszego (tabela -> waypoint) i ostatniego (waypoint -> tabela) odcinka,
 * aby inteligentnie omijać obrys tabeli, jeśli punkt docelowy znajduje się "za" nią.
 * 
 * @param p1x, p1y - Współrzędne punktu startowego segmentu.
 * @param p2x, p2y - Współrzędne punktu końcowego segmentu.
 * @param node1, node2 - Obiekty węzłów (tabela lub waypoint) dla obu punktów.
 * @param r - Dane relacji.
 * @param options - Opcje ścieżki.
 * @param margin - Margines boczny.
 * @param radius - Promień zaokrąglenia.
 */
export const getBracketSegment = (
  p1x: number,
  p1y: number,
  p2x: number,
  p2y: number,
  node1: any,
  node2: any,
  r: RelationshipData,
  options: PathOptions,
  margin: number,
  radius: number,
  debag = false,
  debugSuffix = ""
): PathArray => {
  const p = debugSuffix ? `${debugSuffix}_` : "";
  const debConst = debugSuffix === 'bracket 2:'? 10 :0;

  // Sprawdzamy, czy segment pionowy między punktami przecinałby obrys którejś z tabel.
  // Jeśli jeden z punktów to waypoint (szerokość 0), sprawdzamy czy wpada w rzut X tabeli.


  let overlaps: boolean;
  if (node1.isWaypoint) {
    if (!node2.isWaypoint) {
      const isStartOnLeft = p1x <= node2.x;
      const isStartOnRight = p1x >= node2.x + node2.width;
      
      if (isStartOnLeft) {
        overlaps = p1x + margin > node2.x;
      } else if (isStartOnRight) {
        overlaps = p1x - margin < node2.x + node2.width;
      } else {
        overlaps = true;
      }
    } else {
      overlaps = false;
    }
  } else if (node2.isWaypoint) {
    const isEndOnLeft = p2x <= node1.x;
    const isEndOnRight = p2x >= node1.x + node1.width;

    if (isEndOnLeft) {
      overlaps = p2x + margin > node1.x;
    } else if (isEndOnRight) {
      overlaps = p2x - margin < node1.x + node1.width;
    } else {
      overlaps = true;
    }
  } else {
    overlaps =
      Math.min(node1.x + node1.width, node2.x + node2.width) -
        Math.max(node1.x, node2.x) >
      0;
  }
  
  if (debag) {
    addToDebugConsole( debConst + 10, `${p}OVERLAPS`, overlaps);
  }

  // Jeśli występuje kolizja (overlap), musimy "wypchnąć" ścieżkę na zewnątrz tabeli (bracket).
  if (overlaps) {
    // Decydujemy, czy omijać tabelę z lewej czy z prawej strony na podstawie środków węzłów.
    let useLeft: boolean;
    if (node1.isWaypoint) {
      useLeft = p1x < node2.x + node2.width / 2;
    } else if (node2.isWaypoint) {
      useLeft = p2x < node1.x + node1.width / 2;
    } else {
      useLeft = !inRange(node2.x, 0, node1.x + node1.width/2);
    }

    if (debag) {
      addToDebugConsole( debConst + 11, `${p}DIRECTION`, useLeft ? "LEFT" : "RIGHT");
    }

    // Margines bezpieczeństwa uwzględniający zoom i ewentualny offset pola.
    const totalMargin =
      margin + Math.max(r.startXOffset || 0, r.endXOffset || 0) * options.zoom;
    
    // Obliczamy współrzędną X pionowego segmentu omijającego.
    const outX = useLeft
      ? Math.min(node1.x, node2.x) - totalMargin
      : Math.max(node1.x + node1.width, node2.x + node2.width) + totalMargin;

    if (debag) {
      addToDebugConsole( debConst + 12, `${p}OUT_X`, outX);
    }

    // Wyznaczamy punkty wejścia/wyjścia z krawędzi tabeli (jeśli punkt nie jest waypointem).
    const finalX1 = node1.isWaypoint
      ? p1x
      : useLeft
        ? node1.x
        : node1.x + node1.width;
    let finalX2 = node2.isWaypoint
      ? p2x
      : useLeft
        ? node2.x
        : node2.x + node2.width;

    if (!useLeft && !node2.isWaypoint) {
      finalX2 = node2.x + node2.width;
    } else if (useLeft && !node2.isWaypoint) {
      finalX2 = node2.x;
    }

    // Generujemy ścieżkę używając PathArray.
    const segments: PathArray = [["M", finalX1, p1y]];
    
    // Punkty łamania omijające tabelę.
    segments.push(["L", outX, p1y]);
    segments.push(["L", outX, p2y]);

    // Linia końcowa
    segments.push(["L", finalX2, p2y]);

    return segments;
  }

  // Jeśli nie ma kolizji, używamy standardowego segmentu (ortogonalna ścieżka).
  const segments: PathArray = [["M", p1x, p1y]];
  segments.push(...getOrthogonalSegments({ x: p1x, y: p1y }, { x: p2x, y: p2y }, margin));
  return segments;
};
