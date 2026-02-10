import { useMemo, useState, useLayoutEffect, RefObject } from "react";
import { calcPath, RenderablePath } from "../utils/calcPath";
import { IRelationship, ITable } from "../types";
import { Cardinality } from "../data/constants";
import { PathCommander } from "../utils/path/PathCommander";
import { PathArray } from "svg-path-commander";

/**
 * Custom hook to calculate the SVG path and layout properties for a relationship.
 * 
 * @param data - The relationship data object.
 * @param pathValues - Pre-calculated values for path generation (indices, table positions).
 * @param startTable - The starting table object.
 * @param endTable - The ending table object.
 * @param startYOffset - Vertical offset for the start point.
 * @param endYOffset - Vertical offset for the end point.
 * @param settings - Global editor settings.
 * @param measurePathRef - Reference to an invisible SVG path used for measurements.
 * @param labelRef - Reference to the label element to measure its dimensions.
 * @param t - Translation function.
 * @param forceUpdate - Optional function to trigger a re-render.
 * @returns An object containing the optimized path string, segments, and positioning data.
 */
export function useRelationshipPath(
  data: IRelationship,
  pathValues: any,
  startTable: ITable | null,
  endTable: ITable | null,
  startYOffset: number,
  endYOffset: number,
  settings: any,
  measurePathRef: RefObject<SVGPathElement>,
  labelRef: RefObject<SVGTextElement>,
  t: (key: string) => string,
  forceUpdate?: () => void
) {
  // 1. Calculate path segments using the core routing logic
  const pathSegments = useMemo(
    () =>
      calcPath(
        {
          ...pathValues,
          startYOffset,
          endYOffset,
          waypoints: data.waypoints || [],
          startXOffset: data.startXOffset ?? 0,
          endXOffset: data.endXOffset ?? 0,
          startYCorrection: data.startYCorrection ?? 0,
          endYCorrection: data.endYCorrection ?? 0,
        },
        {
          zoom: 1,
          sideMargin: settings.sideMargin ?? 20,
          radius: 10,
        },
      ),
    [
      pathValues,
      startTable?.width,
      endTable?.width,
      startYOffset,
      endYOffset,
      data.waypoints,
      data.startXOffset,
      data.endXOffset,
      data.startYCorrection,
      data.endYCorrection,
      settings.sideMargin,
    ],
  );

  // 2. Combine segments and optimize the SVG path string
  const pathD = useMemo(() => {
    try {
      // Flatten all segment arrays into one PathArray
      const allSegments = pathSegments.flatMap((p) => p.segments) as PathArray;
      // Clean redundant MoveTo commands and convert to string once
      return PathCommander.pathToString(PathCommander.clean(allSegments));
    } catch (e) {
      console.error("Failed to generate pathD:", e);
      return "";
    }
  }, [pathSegments]);

  // 3. Create a PathCommander instance for geometric calculations (length, points at length)
  const commander = useMemo(() => new PathCommander(pathD), [pathD]);

  const [pathLength, setPathLength] = useState(0);

  // Update path length when the geometry changes
  useLayoutEffect(() => {
    try {
      setPathLength(commander.getTotalLength());
    } catch {
      setPathLength(0);
    }
  }, [commander]);

  /**
   * Safe wrapper for commander.getPointAtLength to prevent crashes on invalid paths.
   */
  const getPointAtLengthSafe = (len: number) => {
    try {
      return commander.getPointAtLength(len);
    } catch (e) {
      return { x: 0, y: 0 };
    }
  };

  // 4. Handle Divider (Floating control point for labels and visual split)
  const dividerWp = useMemo(
    () => (data.waypoints || []).find((wp) => wp.mode === "divider"),
    [data.waypoints],
  );

  const dividerRatio = useMemo(() => {
    const raw = dividerWp?.pathRatio;
    if (typeof raw !== "number" || Number.isNaN(raw)) return 0.5;
    return Math.min(0.999, Math.max(0.001, raw));
  }, [dividerWp?.pathRatio]);

  // Offset for cardinality symbols (1, n, etc.) from the table edge
  const cardinalityOffset = settings.relationshipStyle === "default" ? 28 : 12;

      // 5. Calculate layout coordinates and angles
  const layout = useMemo(() => {
    const res = {
      cardinalityStartX: 0,
      cardinalityStartY: 0,
      cardinalityEndX: 0,
      cardinalityEndY: 0,
      angleStart: 0,
      angleEnd: 0,
      labelX: 0,
      labelY: 0,
      labelAnchorX: 0,
      labelAnchorY: 0,
      sideLabelStartX: 0,
      sideLabelStartY: 0,
      sideLabelEndX: 0,
      sideLabelEndY: 0,
    };

    if (pathLength > 0) {
      // Label positioning at the divider position
      const labelWidth = labelRef.current?.getBBox().width ?? 0;
      const labelHeight = labelRef.current?.getBBox().height ?? 0;

      // Label positioning hierarchy: Path-based (labelRatio) + Relative offsets
      const labelRatio = data.labelRatio ?? 0.5;
      const labelAnchorPoint = getPointAtLengthSafe(pathLength * labelRatio);

      res.labelAnchorX = labelAnchorPoint.x;
      res.labelAnchorY = labelAnchorPoint.y;
      res.labelX = labelAnchorPoint.x + (data.labelOffsetX ?? 0);
      res.labelY = labelAnchorPoint.y + (data.labelOffsetY ?? 0);

      // Start connection angle
      const pStart0 = getPointAtLengthSafe(0);
      const pStart1 = getPointAtLengthSafe(1);
      res.angleStart = (Math.atan2(pStart1.y - pStart0.y, pStart1.x - pStart0.x) * 180) / Math.PI;

      // End connection angle
      const pEnd0 = getPointAtLengthSafe(pathLength);
      const pEnd1 = getPointAtLengthSafe(pathLength - 1);
      res.angleEnd = (Math.atan2(pEnd1.y - pEnd0.y, pEnd1.x - pEnd0.x) * 180) / Math.PI;

      // Cardinality symbol points
      const p1 = getPointAtLengthSafe(cardinalityOffset);
      res.cardinalityStartX = p1.x;
      res.cardinalityStartY = p1.y;

      const p2 = getPointAtLengthSafe(pathLength - cardinalityOffset);
      res.cardinalityEndX = p2.x;
      res.cardinalityEndY = p2.y;

      // Side labels positioning (one side / many side)
      // Position them with margin from the table contact point
      const sideLabelOffset = cardinalityOffset + 10;
      const pSideStart = getPointAtLengthSafe(Math.min(pathLength, sideLabelOffset));
      res.sideLabelStartX = pSideStart.x;
      res.sideLabelStartY = pSideStart.y;

      const pSideEnd = getPointAtLengthSafe(Math.max(0, pathLength - sideLabelOffset));
      res.sideLabelEndX = pSideEnd.x;
      res.sideLabelEndY = pSideEnd.y;
    }

    return res;
  }, [pathLength, commander, cardinalityOffset, labelRef.current, dividerRatio, data.labelOffsetX, data.labelOffsetY, data.labelRatio]);

  // 6. Determine cardinality labels based on the relationship type
  const cardinalityText = useMemo(() => {
    let start = "1";
    let end = "1";
    let sideStart = "";
    let sideEnd = "";

    const oneDefault = (t("one_side_label_default") as unknown as string) || "1";
    const manyDefault = (t("many_side_label_default") as unknown as string) || "n";
    // Respect explicit empty strings: use nullish coalescing instead of falsy checks
    const oneLabel = data.oneLabel ?? oneDefault;
    const manyLabel = data.manyLabel ?? manyDefault;

    switch (data.cardinality) {
      case t(Cardinality.MANY_TO_ONE):
      case Cardinality.MANY_TO_ONE:
        start = manyLabel; // start is many
        end = "1"; // keep symbol for cardinality markers
        sideStart = manyLabel; // label near start table
        sideEnd = oneLabel; // label near end table
        break;
      case t(Cardinality.ONE_TO_MANY):
      case Cardinality.ONE_TO_MANY:
        start = "1";
        end = manyLabel;
        sideStart = oneLabel;
        sideEnd = manyLabel;
        break;
      case t(Cardinality.ONE_TO_ONE):
      case Cardinality.ONE_TO_ONE:
        start = "1";
        end = "1";
        sideStart = oneLabel;
        sideEnd = oneLabel;
        break;
    }
    return { start, end, sideStart, sideEnd };
  }, [data.cardinality, data.manyLabel, data.oneLabel, t]);

  return {
    pathD,
    pathSegments,
    pathLength,
    ...layout,
    cardinalityStart: cardinalityText.start,
    cardinalityEnd: cardinalityText.end,
    sideLabelStart: cardinalityText.sideStart,
    sideLabelEnd: cardinalityText.sideEnd,
    dividerWp,
    dividerRatio,
    cardinalityOffset
  };
}
