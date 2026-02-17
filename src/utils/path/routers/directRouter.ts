import { PathArray } from "svg-path-commander";
import { PathCommander } from "../PathCommander";
import { IPoint } from "@types";
import { PathRouter } from "./types";
import { addToDebugConsole } from "@utils/debug";

export const directRouter: PathRouter = ({
  r,
  options,
  start,
  end,
}) => {
  const p = `DIRECT_REL_${r.id}_`;
  const diffY = Math.abs(start.y - end.y);
  
  if (
    diffY <= 36 * options.zoom &&
    Math.abs(end.y - start.y) / 3 <= 2
  ) {
    addToDebugConsole(30, `${p}MATCH`, true);
    const segments: PathArray = [
      ["M", start.x, start.y],
      ["L", start.x + (end.x > start.x ? options.sideMargin : -options.sideMargin) * options.zoom, start.y],
      ["L", end.x, end.y]
    ];
    return [{
      type: 'direct-segment',
      segments
    }];
  }

  return null;
};
