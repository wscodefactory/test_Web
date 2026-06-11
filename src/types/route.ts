import type { SubwayLine } from "../data/stations";

export type StationNodeId = string;

export type RouteEdgeType = "ride" | "transfer";

export interface RouteSelection {
  line: SubwayLine | "";
  stationName: string;
}

export interface RouteNode {
  id: StationNodeId;
  line: SubwayLine;
  stationName: string;
}

export interface RouteEdge {
  to: StationNodeId;
  minutes: number;
  distanceKm: number;
  type: RouteEdgeType;
  line: SubwayLine;
}

export type SubwayGraph = Record<StationNodeId, RouteEdge[]>;

export interface RouteStep {
  nodeId: StationNodeId;
  line: SubwayLine;
  stationName: string;
  minutesFromPrevious: number;
  distanceFromPreviousKm: number;
  edgeTypeFromPrevious: RouteEdgeType | null;
}

export interface RouteResult {
  departureTimeIso?: string;
  steps: RouteStep[];
  totalMinutes: number;
  transferCount: number;
  totalDistanceKm: number;
  stationCount: number;
}
