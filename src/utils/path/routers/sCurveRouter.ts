import { PathArray } from "svg-path-commander";
import { PathCommander } from "../PathCommander";
import { IPoint } from "@types";
import { getOrthogonalSegments } from "../geometry";
import { PathRouter } from "./types";
import { addToDebugConsole } from "@utils/debug";

export const sCurveRouter: PathRouter = ({
  r,
  start,
  end,
  radius,
  margin,
}) => {
  addToDebugConsole(40, `SCURVE_REL_${r.id}_GENERATE`, { from: start, to: end });
  
  const segments: PathArray = [
    ["M", start.x, start.y],
    ...getOrthogonalSegments(
      { x: start.x, y: start.y },
      { x: end.x, y: end.y },
      margin
    )
  ];

  return [{
    type: 's-curve',
    segments
  }];
};
