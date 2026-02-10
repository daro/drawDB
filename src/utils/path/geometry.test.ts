
import { getContactX, getContactY, getSegmentPath } from "./geometry";
import { PathCommander } from "./PathCommander";
import { DrawableNode, Point } from "./types";

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`);
  }
}

function runTests() {
  console.log("Running tests for geometry.ts...");

  // --- Test getContactX ---
  console.log("Testing getContactX...");
  const node1: DrawableNode = { x: 100, y: 100, width: 200, height: 100 };
  const node2: DrawableNode = { x: 400, y: 100, width: 100, height: 100 }; // Na prawo od node1

  // node1 widzi node2 po prawej, więc kontakt na prawej krawędzi (x + width)
  assert(getContactX(node1, node2) === 300, "Should connect to right side");
  // node2 widzi node1 po lewej, więc kontakt na lewej krawędzi (x)
  assert(getContactX(node2, node1) === 400, "Should connect to left side");
  
  // Z offsetem
  assert(getContactX(node1, node2, 10) === 310, "Should apply positive offset on right side");
  assert(getContactX(node2, node1, 10) === 390, "Should apply negative offset on left side");

  // Waypoint
  const wp: DrawableNode = { x: 500, y: 500, width: 0, height: 0, isWaypoint: true };
  assert(getContactX(wp, node1) === 500, "Waypoint should ignore offset (base)");
  assert(getContactX(wp, node1, 50) === 500, "Waypoint should ignore offset");

  // --- Test getContactY ---
  console.log("Testing getContactY...");
  assert(getContactY(node1, 50) === 150, "Should apply vertical offset for tables");
  assert(getContactY(wp, 50) === 500, "Waypoint should ignore vertical offset and return its y");

  // --- Test getSegmentPath Avoidance ---
  console.log("Testing getSegmentPath avoidance...");
  
  const pStartAvoid = { x: 100, y: 100 };
  const pDirectlyAbove = { x: 100, y: 0 };
  const marginAvoid = 20;
  const radiusAvoid = 10;
  
  // getManhattanSegments logic:
  // dx = 0 < minMargin (sideMargin=20, radius=10, so minMargin = max(20, 10+15) = 25)
  // direction = 1
  // isActuallyBehind = true
  // midX = 100 + 25 = 125
  const avoidancePath = getSegmentPath(pStartAvoid, pDirectlyAbove, radiusAvoid, false, marginAvoid);
  assert(avoidancePath.includes("125"), `Path should be pushed to x=125 for avoidance, got: ${avoidancePath}`);

  // --- Test getSegmentPath Orthogonal with Rounding ---
  console.log("Testing getSegmentPath rounding...");
  const p1_ortho = { x: 0, y: 0 };
  const p2_ortho = { x: 100, y: 100 };
  const radiusTest = 10;
  const path_ortho_rounded = getSegmentPath(p1_ortho, p2_ortho, radiusTest, true);
  
  // Sprawdzamy czy zawiera segment łuku 'A'
  assert(path_ortho_rounded.includes("A10 10") || path_ortho_rounded.includes("A10,10"), `Rounded getSegmentPath should include an arc segment 'A10 10', got: ${path_ortho_rounded}`);

  // --- Test PathCommander roundCorners ---
  console.log("Testing PathCommander roundCorners...");
  
  // Case 1: Skręt w dół (Clockwise / Sweep-flag = 1)
  // M 0,0 (TL) -> L 100,0 (TR) -> L 100,100 (BR)
  const rawPathCW = "M0,0 L100,0 L100,100";
  const roundedSegmentsCW = PathCommander.roundCorners(PathCommander.parsePathString(rawPathCW), 10);
  const roundedPathCW = PathCommander.pathToString(roundedSegmentsCW);
  
  // Case 2: Skręt w górę (Counter-Clockwise / Sweep-flag = 0)
  // M 0,100 (BL) -> L 100,100 (BR) -> L 100,0 (TR)
  const rawPathCCW = "M0,100 L100,100 L100,0";
  const roundedSegmentsCCW = PathCommander.roundCorners(PathCommander.parsePathString(rawPathCCW), 10);
  const roundedPathCCW = PathCommander.pathToString(roundedSegmentsCCW);

  assert(roundedPathCW.includes("A10 10 0 0 1") || roundedPathCW.includes("A10,10,0,0,1"), "CW turn should have sweep-flag 1");
  assert(roundedPathCCW.includes("A10 10 0 0 0") || roundedPathCCW.includes("A10,10,0,0,0"), "CCW turn should have sweep-flag 0");

  // Case 3: Segmenty współliniowe (Collinear segments) - nie powinny być zaokrąglane
  console.log("Testing PathCommander collinear segments...");
  const rawPathCollinear = "M0,0 L50,0 L100,0 L100,100";
  const roundedSegmentsCollinear = PathCommander.roundCorners(PathCommander.parsePathString(rawPathCollinear), 10);
  const roundedPathCollinear = PathCommander.pathToString(roundedSegmentsCollinear);
  
  // Pierwszy narożnik (0,0 -> 50,0 -> 100,0) jest linią prostą, nie powinien mieć łuku
  // Drugi narożnik (50,0 -> 100,0 -> 100,100) jest pod kątem prostym, powinien mieć łuku
  const arcCount = (roundedPathCollinear.match(/A/g) || []).length;
  assert(arcCount === 1, `Collinear segments should not be rounded. Expected 1 arc, got ${arcCount}. Path: ${roundedPathCollinear}`);

  // Case 4: Segmenty współliniowe w pionie
  const rawPathVertical = "M0,0 L0,50 L0,100 L100,100";
  const roundedSegmentsVertical = PathCommander.roundCorners(PathCommander.parsePathString(rawPathVertical), 10);
  const roundedPathVertical = PathCommander.pathToString(roundedSegmentsVertical);
  const arcCountVertical = (roundedPathVertical.match(/A/g) || []).length;
  assert(arcCountVertical === 1, `Vertical collinear segments should not be rounded. Expected 1 arc, got ${arcCountVertical}. Path: ${roundedPathVertical}`);

  // --- Test PathCommander clean ---
  console.log("Testing PathCommander clean...");
  const rawPathRedundant = "M0,0 L10,10 M10,10 L20,20 M20,20 M20,20 L30,30";
  const segmentsRedundant = PathCommander.parsePathString(rawPathRedundant);
  const cleanedSegments = PathCommander.clean(segmentsRedundant);
  const cleanedPath = PathCommander.pathToString(cleanedSegments);
  
  const mCount = (cleanedPath.match(/M/g) || []).length;
  assert(mCount === 1, `Should remove redundant MoveTo segments. Expected 1 M, got ${mCount}. Path: ${cleanedPath}`);
  assert(cleanedPath.includes("L10 10L20 20L30 30"), "Path should be continuous after cleaning");

  // --- Test getOrthogonalSegments with Margin ---
  console.log("Testing getOrthogonalSegments margin...");
  const p1_margin = { x: 0, y: 0 };
  const p2_margin = { x: 100, y: 100 };
  const marginVal = 20;
  // Przy absDx > margin*2 (100 > 40), powinien wygenerować midX = 50
  const orthoSegments = getSegmentPath(p1_margin, p2_margin, 0, true, marginVal);
  assert(orthoSegments.includes("L50 0"), `Should have midX at 50, got: ${orthoSegments}`);
  
  const p1_close = { x: 0, y: 0 };
  const p2_close = { x: 30, y: 100 };
  // Przy absDx <= margin*2 (30 <= 40), powinien użyć exitX = 20
  const orthoSegmentsClose = getSegmentPath(p1_close, p2_close, 0, true, marginVal);
  assert(orthoSegmentsClose.includes("L20 0"), `Should have exitX at 20, got: ${orthoSegmentsClose}`);

  console.log("All tests passed!");
}

try {
  runTests();
} catch (error: any) {
  console.error("Test failed!");
  console.error(error.message);
  process.exit(1);
}
