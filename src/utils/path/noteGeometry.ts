import { PathArray } from "svg-path-commander";
import { NOTE_CONFIG } from "../../data/constants";

export const getNoteGeometry = (x: number, y: number, width: number, height: number) => {
  const mainSegments: PathArray = [
    ["M", x + NOTE_CONFIG.FOLD, y],
    ["L", x + width - NOTE_CONFIG.RADIUS, y],
    ["A", NOTE_CONFIG.RADIUS, NOTE_CONFIG.RADIUS, 0, 0, 1, x + width, y + NOTE_CONFIG.RADIUS],
    ["L", x + width, y + height - NOTE_CONFIG.RADIUS],
    ["A", NOTE_CONFIG.RADIUS, NOTE_CONFIG.RADIUS, 0, 0, 1, x + width - NOTE_CONFIG.RADIUS, y + height],
    ["L", x + NOTE_CONFIG.RADIUS, y + height],
    ["A", NOTE_CONFIG.RADIUS, NOTE_CONFIG.RADIUS, 0, 0, 1, x, y + height - NOTE_CONFIG.RADIUS],
    ["L", x, y + NOTE_CONFIG.FOLD],
  ];

  const foldSegments: PathArray = [
    ["M", x, y + NOTE_CONFIG.FOLD],
    ["L", x + NOTE_CONFIG.FOLD - NOTE_CONFIG.RADIUS, y + NOTE_CONFIG.FOLD],
    ["A", NOTE_CONFIG.RADIUS, NOTE_CONFIG.RADIUS, 0, 0, 0, x + NOTE_CONFIG.FOLD, y + NOTE_CONFIG.FOLD - NOTE_CONFIG.RADIUS],
    ["L", x + NOTE_CONFIG.FOLD, y],
    ["L", x, y + NOTE_CONFIG.FOLD],
    ["Z"],
  ];

  return { mainSegments, foldSegments };
};
