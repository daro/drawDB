import { PathArray } from "svg-path-commander";
import { IPoint } from "../../../types";
import { RelationshipData, PathOptions, DrawableNode } from "../types";

export type PathSectionType = 
  | 'start-bracket' 
  | 'waypoint-connector' 
  | 'end-bracket' 
  | 'direct-segment' 
  | 's-curve'
  | 'bracket';

export interface PathSection {
  type: PathSectionType;
  segments: PathArray;
  metadata?: {
    fromWaypointIndex?: number;
    toWaypointIndex?: number;
  };
}

export type PathResult = PathSection[] | null;

export interface RouterInput {
  r: RelationshipData;
  options: PathOptions;
  start: IPoint;
  end: IPoint;
  startNode: DrawableNode;
  endNode: DrawableNode;
  margin: number;
  radius: number;
}

export type PathRouter = (input: RouterInput) => PathResult;
