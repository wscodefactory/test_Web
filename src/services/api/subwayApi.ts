import {
  SUBWAY_ID_BY_LINE,
  type SubwayLine,
} from "../../data/stations";
import type {
  ArrivalDirectionGroup,
  GroupedSubwayArrivals,
  RawSubwayArrival,
  SeoulSubwayApiResponse,
  SubwayArrival,
} from "../../types/subway";

const DEFAULT_BASE_URL = "http://swopenapi.seoul.go.kr/api/subway";
const PAGE_START = 0;
const PAGE_END = 30;
const REQUEST_TIMEOUT_MS = 6000;

const API_BASE_URL =
  (import.meta.env.VITE_SEOUL_SUBWAY_API_BASE_URL as string | undefined) ??
  DEFAULT_BASE_URL;
const API_KEY = import.meta.env.VITE_SEOUL_OPEN_API_KEY as string | undefined;
const SHOULD_USE_DEV_FALLBACK =
  import.meta.env.DEV && import.meta.env.VITE_REALTIME_ALLOW_MOCK !== "false";

const normalizeDirectionGroup = (
  updnLine: string,
  ordkey: string,
): ArrivalDirectionGroup => {
  if (updnLine.includes("상행") || updnLine.includes("내선")) {
    return "up";
  }

  if (updnLine.includes("하행") || updnLine.includes("외선")) {
    return "down";
  }

  return ordkey.startsWith("0") ? "up" : "down";
};

const toArrivalSeconds = (value: string): number | null => {
  const seconds = Number(value);
  return Number.isFinite(seconds) && seconds >= 0 ? seconds : null;
};

const parseReceiveTime = (receiveAt: string): number | null => {
  const timestamp = new Date(receiveAt.replace(" ", "T")).getTime();
  return Number.isFinite(timestamp) ? timestamp : null;
};

const getAdjustedArrivalSeconds = (
  barvlDt: string,
  receiveAt: string,
): number | null => {
  const arrivalSeconds = toArrivalSeconds(barvlDt);

  if (arrivalSeconds === null) {
    return null;
  }

  const receiveTime = parseReceiveTime(receiveAt);

  if (receiveTime === null) {
    return arrivalSeconds;
  }

  const elapsedSeconds = Math.floor((Date.now() - receiveTime) / 1000);
  return Math.max(0, arrivalSeconds - Math.max(0, elapsedSeconds));
};

const getTrainOrder = (ordkey: string): string => {
  const order = Number(ordkey.slice(-1));
  return Number.isFinite(order) && order > 0 ? `${order}번째 전` : "정보 없음";
};

const getDirectionName = (arrival: RawSubwayArrival): string => {
  return arrival.trainLineNm ?? arrival.trianLineNm ?? arrival.updnLine;
};

const toSubwayArrival = (arrival: RawSubwayArrival): SubwayArrival => ({
  id: `${arrival.subwayId}-${arrival.btrainNo}-${arrival.ordkey}-${arrival.updnLine}`,
  subwayId: arrival.subwayId,
  stationName: arrival.statnNm,
  directionGroup: normalizeDirectionGroup(arrival.updnLine, arrival.ordkey),
  directionName: getDirectionName(arrival),
  destination: arrival.bstatnNm || "종착역 정보 없음",
  trainStatus: arrival.btrainSttus || "일반",
  trainOrder: getTrainOrder(arrival.ordkey),
  arrivalMessage: arrival.arvlMsg2 || "도착 정보 없음",
  detailMessage: arrival.arvlMsg3 || "상세 정보 없음",
  arrivalSeconds: getAdjustedArrivalSeconds(arrival.barvlDt, arrival.recptnDt),
  receiveAt: arrival.recptnDt,
  isLastTrain: arrival.lstcarAt === "1",
});

const sortArrivals = (arrivals: SubwayArrival[]): SubwayArrival[] => {
  return arrivals.toSorted((a, b) => {
    const aSeconds = a.arrivalSeconds ?? Number.MAX_SAFE_INTEGER;
    const bSeconds = b.arrivalSeconds ?? Number.MAX_SAFE_INTEGER;
    return aSeconds - bSeconds;
  });
};

const groupArrivals = (
  arrivals: SubwayArrival[],
): GroupedSubwayArrivals => ({
  up: sortArrivals(arrivals.filter((arrival) => arrival.directionGroup === "up")).slice(
    0,
    2,
  ),
  down: sortArrivals(
    arrivals.filter((arrival) => arrival.directionGroup === "down"),
  ).slice(0, 2),
});

const createMockArrival = (
  line: SubwayLine,
  stationName: string,
  directionGroup: ArrivalDirectionGroup,
  index: number,
  seconds: number,
): SubwayArrival => {
  const isUp = directionGroup === "up";

  return {
    id: `mock-${line}-${stationName}-${directionGroup}-${index}`,
    subwayId: SUBWAY_ID_BY_LINE[line],
    stationName,
    directionGroup,
    directionName: isUp ? "상행" : "하행",
    destination: isUp ? "청량리" : "인천",
    trainStatus: index === 2 && !isUp ? "급행" : "일반",
    trainOrder: `${index}번째 전`,
    arrivalMessage: "도착예정",
    detailMessage: isUp ? "이전역 출발" : "신도림 출발",
    arrivalSeconds: seconds,
    receiveAt: new Date().toISOString(),
    isLastTrain: false,
  };
};

export const getMockRealtimeArrivals = (
  line: SubwayLine,
  stationName: string,
): GroupedSubwayArrivals => ({
  up: [
    createMockArrival(line, stationName, "up", 1, 120),
    createMockArrival(line, stationName, "up", 2, 300),
  ],
  down: [
    createMockArrival(line, stationName, "down", 1, 180),
    createMockArrival(line, stationName, "down", 2, 420),
  ],
});

export const fetchRealtimeArrivals = async (
  line: SubwayLine,
  stationName: string,
): Promise<GroupedSubwayArrivals> => {
  const trimmedKey = API_KEY?.trim();

  if (!trimmedKey) {
    return getMockRealtimeArrivals(line, stationName);
  }

  try {
    const controller = new AbortController();
    const timeoutId = window.setTimeout(
      () => controller.abort(),
      REQUEST_TIMEOUT_MS,
    );
    const stationParam = encodeURIComponent(stationName);
    const requestUrl = `${API_BASE_URL}/${trimmedKey}/json/realtimeStationArrival/${PAGE_START}/${PAGE_END}/${stationParam}`;
    const response = await fetch(requestUrl, { signal: controller.signal });
    window.clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error("실시간 도착정보를 불러오지 못했습니다.");
    }

    const data = (await response.json()) as SeoulSubwayApiResponse;

    if (data.errorMessage && data.errorMessage.code !== "INFO-000") {
      throw new Error(data.errorMessage.message);
    }

    const lineId = SUBWAY_ID_BY_LINE[line];
    const arrivals =
      data.realtimeArrivalList
        ?.filter((arrival) => arrival.subwayId === lineId)
        .map(toSubwayArrival) ?? [];

    return groupArrivals(arrivals);
  } catch (error) {
    if (SHOULD_USE_DEV_FALLBACK) {
      return getMockRealtimeArrivals(line, stationName);
    }

    throw error;
  }
};
