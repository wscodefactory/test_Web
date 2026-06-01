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

// 서울 열린데이터 실시간 도착 API 응답을 화면용 도착정보 모델로 변환합니다.
const DEFAULT_BASE_URL = "/subway-api";
const PAGE_START = 0;
const PAGE_END = 30;
const REQUEST_TIMEOUT_MS = 6000;
const SEOUL_API_SUCCESS_CODE = "INFO-000";

const API_BASE_URL =
  (import.meta.env.VITE_SEOUL_SUBWAY_API_BASE_URL as string | undefined) ??
  DEFAULT_BASE_URL;
const API_KEY = import.meta.env.VITE_SEOUL_OPEN_API_KEY as string | undefined;
const SHOULD_USE_DEV_FALLBACK =
  import.meta.env.DEV && import.meta.env.VITE_REALTIME_ALLOW_MOCK === "true";

// Vite 프록시 경로를 기본값으로 사용해 브라우저 CORS 문제를 피합니다.
const getApiBaseUrl = (): string => {
  const baseUrl = API_BASE_URL.trim().replace(/\/$/, "");

  if (!baseUrl || baseUrl.includes("data.seoul.go.kr/dataList")) {
    return DEFAULT_BASE_URL;
  }

  return baseUrl;
};

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

const getSeoulApiErrorMessage = (
  data: SeoulSubwayApiResponse,
): string | null => {
  const code = data.errorMessage?.code ?? data.RESULT?.CODE ?? data.code;
  const message =
    data.errorMessage?.message ?? data.RESULT?.MESSAGE ?? data.message;

  if (!code || code === SEOUL_API_SUCCESS_CODE) {
    return null;
  }

  const trimmedMessage = message?.trim() || "실시간 도착정보 조회에 실패했습니다.";

  if (code === "ERROR-337") {
    return `서울 열린데이터 API 일일 호출 한도를 초과했습니다. ${trimmedMessage}`;
  }

  return trimmedMessage;
};

const parseReceiveTime = (receiveAt: string): number | null => {
  const normalizedReceiveAt = receiveAt.trim().replace(" ", "T");
  const hasTimezone = /(?:Z|[+-]\d{2}:?\d{2})$/.test(normalizedReceiveAt);
  const timestamp = new Date(
    hasTimezone ? normalizedReceiveAt : `${normalizedReceiveAt}+09:00`,
  ).getTime();

  return Number.isFinite(timestamp) ? timestamp : null;
};

const isCurrentStationArrival = (
  arrivalMessage: string,
  stationName: string,
): boolean => {
  return (
    arrivalMessage.includes(`${stationName} 도착`) ||
    arrivalMessage.includes(`${stationName} 진입`)
  );
};

const getAdjustedArrivalSeconds = (
  barvlDt: string,
  receiveAt: string,
  arrivalMessage: string,
  stationName: string,
): number | null => {
  const arrivalSeconds = toArrivalSeconds(barvlDt);

  if (arrivalSeconds === null) {
    return null;
  }

  if (
    arrivalSeconds === 0 &&
    !isCurrentStationArrival(arrivalMessage, stationName)
  ) {
    // API가 전역 위치 정보에도 0초를 주는 경우가 있어 잘못된 즉시 도착 표시를 막습니다.
    return null;
  }

  const receiveTime = parseReceiveTime(receiveAt);

  if (receiveTime === null) {
    return arrivalSeconds;
  }

  const elapsedSeconds = Math.floor((Date.now() - receiveTime) / 1000);
  return Math.max(0, arrivalSeconds - Math.max(0, elapsedSeconds));
};

const getOrderFromOrdkey = (ordkey: string): number | null => {
  const orderMatch = ordkey.match(/^\d{2}(\d{3})/);

  if (!orderMatch) {
    return null;
  }

  const order = Number(orderMatch[1]);
  return Number.isFinite(order) ? order : null;
};

const getArrivalRank = (arrival: RawSubwayArrival): number => {
  const message = arrival.arvlMsg2 ?? "";
  const numberedStationMatch = message.match(/\[(\d+)\]번째 전역/);

  if (isCurrentStationArrival(message, arrival.statnNm)) {
    return 0;
  }

  if (
    message.includes("전역 도착") ||
    message.includes("전역 출발") ||
    message.includes("전역 진입")
  ) {
    return 1;
  }

  if (message.includes("진입")) {
    return 0;
  }

  if (numberedStationMatch) {
    return Number(numberedStationMatch[1]);
  }

  return getOrderFromOrdkey(arrival.ordkey) ?? Number.MAX_SAFE_INTEGER;
};

const getTrainOrder = (arrival: RawSubwayArrival): string => {
  const message = arrival.arvlMsg2 ?? "";
  const numberedStationMatch = message.match(/\[(\d+)\]번째 전역/);

  if (isCurrentStationArrival(message, arrival.statnNm)) {
    return "도착";
  }

  if (numberedStationMatch) {
    const stationCount = Number(numberedStationMatch[1]);
    return stationCount === 0 ? "도착" : `${stationCount}번째 전`;
  }

  if (
    message.includes("전역 도착") ||
    message.includes("전역 출발") ||
    message.includes("전역 진입")
  ) {
    return "1번째 전";
  }

  if (message.includes("진입")) {
    return "진입";
  }

  if (message.includes("출발")) {
    return "출발";
  }

  const order = getOrderFromOrdkey(arrival.ordkey);

  if (order === 0) {
    return "도착";
  }

  return order && order > 0 ? `${order}번째 전` : "정보 없음";
};

const getDirectionName = (arrival: RawSubwayArrival): string => {
  return (
    arrival.trainLineNm?.trim() ||
    arrival.trianLineNm?.trim() ||
    arrival.updnLine
  );
};

const getTrainStatus = (arrival: RawSubwayArrival): string => {
  const status = arrival.btrainSttus?.trim();

  if (status) {
    return status;
  }

  return getDirectionName(arrival).includes("급행") ? "급행" : "일반";
};

const getDirectionLabel = (arrival: RawSubwayArrival): string => {
  const directionLabel = arrival.updnLine.trim();

  if (directionLabel) {
    return directionLabel;
  }

  return normalizeDirectionGroup(arrival.updnLine, arrival.ordkey) === "up"
    ? "상행"
    : "하행";
};

const toSubwayArrival = (arrival: RawSubwayArrival): SubwayArrival => ({
  id: `${arrival.subwayId}-${arrival.btrainNo}-${arrival.ordkey}-${arrival.updnLine}`,
  subwayId: arrival.subwayId,
  stationName: arrival.statnNm,
  directionGroup: normalizeDirectionGroup(arrival.updnLine, arrival.ordkey),
  directionLabel: getDirectionLabel(arrival),
  directionName: getDirectionName(arrival),
  destination: arrival.bstatnNm?.trim() || "종착역 정보 없음",
  trainStatus: getTrainStatus(arrival),
  trainOrder: getTrainOrder(arrival),
  arrivalRank: getArrivalRank(arrival),
  arrivalMessage: arrival.arvlMsg2?.trim() || "도착 정보 없음",
  detailMessage: arrival.arvlMsg3?.trim() || "상세 정보 없음",
  arrivalSeconds: getAdjustedArrivalSeconds(
    arrival.barvlDt,
    arrival.recptnDt,
    arrival.arvlMsg2,
    arrival.statnNm,
  ),
  receiveAt: arrival.recptnDt,
  isLastTrain: arrival.lstcarAt === "1",
});

const sortArrivals = (arrivals: SubwayArrival[]): SubwayArrival[] => {
  return arrivals.toSorted((a, b) => {
    const aSeconds =
      a.arrivalSeconds ??
      (a.arrivalRank < Number.MAX_SAFE_INTEGER
        ? a.arrivalRank * 60
        : Number.MAX_SAFE_INTEGER);
    const bSeconds =
      b.arrivalSeconds ??
      (b.arrivalRank < Number.MAX_SAFE_INTEGER
        ? b.arrivalRank * 60
        : Number.MAX_SAFE_INTEGER);

    if (aSeconds !== bSeconds) {
      return aSeconds - bSeconds;
    }

    return a.arrivalRank - b.arrivalRank;
  });
};

const groupArrivals = (
  arrivals: SubwayArrival[],
): GroupedSubwayArrivals => ({
  // 화면은 상행/하행 각각 가장 가까운 2개 열차만 보여줍니다.
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
    directionLabel: isUp ? "상행" : "하행",
    directionName: isUp ? "상행" : "하행",
    destination: isUp ? "상행 종착역" : "하행 종착역",
    trainStatus: index === 2 && !isUp ? "급행" : "일반",
    trainOrder: `${index}번째 전`,
    arrivalRank: index,
    arrivalMessage: "도착예정",
    detailMessage: "이전역 출발",
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
    if (SHOULD_USE_DEV_FALLBACK) {
      return getMockRealtimeArrivals(line, stationName);
    }

    throw new Error("서울 열린데이터 API 키가 설정되어 있지 않습니다.");
  }

  try {
    const controller = new AbortController();
    const timeoutId = window.setTimeout(
      () => controller.abort(),
      REQUEST_TIMEOUT_MS,
    );

    try {
      const stationParam = encodeURIComponent(stationName);
      const requestUrl = `${getApiBaseUrl()}/${trimmedKey}/json/realtimeStationArrival/${PAGE_START}/${PAGE_END}/${stationParam}`;
      const response = await fetch(requestUrl, { signal: controller.signal });

      if (!response.ok) {
        throw new Error("실시간 도착정보를 불러오지 못했습니다.");
      }

      const data = (await response.json()) as SeoulSubwayApiResponse;

      const apiErrorMessage = getSeoulApiErrorMessage(data);

      if (apiErrorMessage) {
        throw new Error(apiErrorMessage);
      }

      const lineId = SUBWAY_ID_BY_LINE[line];
      const arrivals =
        data.realtimeArrivalList
          ?.filter((arrival) => arrival.subwayId === lineId)
          .map(toSubwayArrival) ?? [];

      return groupArrivals(arrivals);
    } finally {
      window.clearTimeout(timeoutId);
    }
  } catch (error) {
    if (SHOULD_USE_DEV_FALLBACK) {
      return getMockRealtimeArrivals(line, stationName);
    }

    if (error instanceof Error && error.name === "AbortError") {
      throw new Error("실시간 도착정보 요청 시간이 초과되었습니다.", {
        cause: error,
      });
    }

    throw error;
  }
};
