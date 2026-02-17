import { IWaypoint, ITable } from "@types";

export interface Point {
  x: number;
  y: number;
}

export interface BoundingBox extends Point {
  width: number;
  height: number;
}

export type DrawableNode = BoundingBox & {
  isWaypoint?: boolean;
};

export interface PathOptions {
  zoom: number;
  sideMargin: number;
  radius: number;
}

export interface RelationshipData {
  startTable: ITable;
  endTable: ITable;
  startFieldIndex: number;
  endFieldIndex: number;
  startYOffset: number;
  endYOffset: number;
  startXOffset: number;
  endXOffset: number;
  startYCorrection: number;
  endYCorrection: number;
  waypoints: IWaypoint[];
}
