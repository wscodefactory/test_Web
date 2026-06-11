import type { SubwayLine } from "./stations";

export type RouteEdgeKind = "ride" | "transfer";

export interface RouteEdgeWeight {
  fromLine: SubwayLine;
  fromStation: string;
  toLine: SubwayLine;
  toStation: string;
  minutes: number;
  distanceKm: number;
  kind: RouteEdgeKind;
}

// 역간 이동시간/거리 예시 데이터입니다.
// 같은 호선의 인접역은 ride, 환승역의 호선 변경은 transfer로 구분합니다.
export const ROUTE_EDGE_WEIGHTS_EXAMPLE: RouteEdgeWeight[] = [
  {
    fromLine: "1호선",
    fromStation: "종로3가",
    toLine: "1호선",
    toStation: "종각",
    minutes: 2,
    distanceKm: 1.0,
    kind: "ride",
  },
  {
    fromLine: "1호선",
    fromStation: "종로3가",
    toLine: "1호선",
    toStation: "동대문",
    minutes: 4,
    distanceKm: 1.8,
    kind: "ride",
  },
  {
    fromLine: "1호선",
    fromStation: "신설동",
    toLine: "2호선",
    toStation: "신설동",
    minutes: 4,
    distanceKm: 0,
    kind: "transfer",
  },
  {
    fromLine: "2호선",
    fromStation: "신설동",
    toLine: "2호선",
    toStation: "용두",
    minutes: 2,
    distanceKm: 0.9,
    kind: "ride",
  },
  {
    fromLine: "2호선",
    fromStation: "용두",
    toLine: "2호선",
    toStation: "신답",
    minutes: 2,
    distanceKm: 1.0,
    kind: "ride",
  },
  {
    fromLine: "2호선",
    fromStation: "신답",
    toLine: "2호선",
    toStation: "용답",
    minutes: 2,
    distanceKm: 1.0,
    kind: "ride",
  },
  {
    fromLine: "2호선",
    fromStation: "용답",
    toLine: "2호선",
    toStation: "성수",
    minutes: 3,
    distanceKm: 1.3,
    kind: "ride",
  },
  {
    fromLine: "2호선",
    fromStation: "성수",
    toLine: "2호선",
    toStation: "뚝섬",
    minutes: 2,
    distanceKm: 0.8,
    kind: "ride",
  },
  {
    fromLine: "3호선",
    fromStation: "종로3가",
    toLine: "1호선",
    toStation: "종로3가",
    minutes: 5,
    distanceKm: 0,
    kind: "transfer",
  },
  {
    fromLine: "5호선",
    fromStation: "종로3가",
    toLine: "1호선",
    toStation: "종로3가",
    minutes: 6,
    distanceKm: 0,
    kind: "transfer",
  },
];
