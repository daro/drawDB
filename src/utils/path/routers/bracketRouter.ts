import { PathArray } from "svg-path-commander";
import { PathCommander } from "../PathCommander";
import { IPoint } from "../../../types";
import { PathRouter } from "./types";
import { addToDebugConsole } from "../../../utils/debug";

export const bracketRouter: PathRouter = ({
  r,
  options,
  start,
  end,
  startNode,
  endNode,
  margin,
  radius,
}) => {
  const p = `BRACKET_REL_${r.id}_`;
  const overlapsInX =
    Math.min(startNode.x + startNode.width, endNode.x + endNode.width) -
      Math.max(startNode.x, endNode.x) >
    0;

  addToDebugConsole(10, `${p}OVERLAPS`, overlapsInX);

  if (!overlapsInX) return null;

  const useLeftSide =
    (startNode.x + startNode.width / 2 + endNode.x + endNode.width / 2) / 2 <
    startNode.x + startNode.width / 2;

  addToDebugConsole(11, `${p}DIRECTION`, useLeftSide ? "LEFT" : "RIGHT");

  const commonMargin =
    margin + Math.max(r.startXOffset, r.endXOffset) * options.zoom;
  const outX = useLeftSide
    ? Math.min(startNode.x, endNode.x) - commonMargin
    : Math.max(startNode.x + startNode.width, endNode.x + endNode.width) +
      commonMargin;

  addToDebugConsole(12, `${p}OUT_X`, outX);

  const finalStart = {
    x: useLeftSide ? startNode.x : startNode.x + startNode.width,
    y: start.y,
  };
  const finalEnd = {
    x: useLeftSide ? endNode.x : endNode.x + endNode.width,
    y: end.y,
  };

  const segments: PathArray = [
    ["M", finalStart.x, finalStart.y],
    ["L", outX, finalStart.y],
    ["L", outX, finalEnd.y],
    ["L", finalEnd.x, finalEnd.y]
  ];

  return [{
    type: 'bracket',
    segments
  }];
};
