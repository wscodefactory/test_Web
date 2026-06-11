import type { SubwayLine } from "../data/stations";

export type FavoriteType = "route";

export interface RouteFavoriteInput {
  startLine: SubwayLine;
  startStation: string;
  endLine: SubwayLine;
  endStation: string;
}

export interface FavoriteRoute extends RouteFavoriteInput {
  id: string;
  type: FavoriteType;
  createdAt: string;
}
