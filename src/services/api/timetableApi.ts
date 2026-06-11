import type { SubwayLine } from "../../data/stations";
import type {
  RawSubwayStationInfo,
  RawSubwayTimetableRow,
  SeoulOpenApiListResponse,
  SubwayTimetable,
  TimetableDayType,
  TimetableDirection,
  TimetableTrain,
} from "../../types/timetable";

const DEFAULT_BASE_URL = "/timetable-api";
const PAGE_START = 1;
const PAGE_END = 700;
const REQUEST_TIMEOUT_MS = 8000;
const SEOUL_API_SUCCESS_CODE = "INFO-000";
const SEOUL_API_NO_DATA_CODE = "INFO-200";

const STATION_INFO_SERVICE = "SearchInfoBySubwayNameService";
const TIMETABLE_SERVICE = "SearchSTNTimeTableByIDService";

const LINE_NUM_BY_LINE: Record<SubwayLine, string> = {
  "1호선": "01호선",
  "2호선": "02호선",
  "3호선": "03호선",
  "4호선": "04호선",
  "5호선": "05호선",
  "6호선": "06호선",
  "7호선": "07호선",
  "8호선": "08호선",
  "9호선": "09호선",
};

const DIRECTION_TAG_BY_DIRECTION: Record<TimetableDirection, string> = {
  up: "1",
  down: "2",
};

const WEEK_TAG_BY_DAY_TYPE: Record<TimetableDayType, string> = {
  weekday: "1",
  weekendHoliday: "3",
};

const API_BASE_URL =
  (import.meta.env.VITE_SEOUL_TIMETABLE_API_BASE_URL as string | undefined) ??
  DEFAULT_BASE_URL;
const FALLBACK_API_KEY = import.meta.env.VITE_SEOUL_OPEN_API_KEY as
  | string
  | undefined;
const STATION_INFO_API_KEY =
  (import.meta.env.VITE_SEOUL_STATION_INFO_API_KEY as string | undefined) ??
  FALLBACK_API_KEY;
const TIMETABLE_API_KEY =
  (import.meta.env.VITE_SEOUL_TIMETABLE_API_KEY as string | undefined) ??
  FALLBACK_API_KEY;

const stationInfoCache = new Map<string, Promise<RawSubwayStationInfo>>();

const getApiBaseUrl = (): string => {
  const baseUrl = API_BASE_URL.trim().replace(/\/$/, "");

  if (!baseUrl || baseUrl.includes("data.seoul.go.kr/dataList")) {
    return DEFAULT_BASE_URL;
  }

  return baseUrl;
};

const normalizeRows = <T>(rows: T | T[] | undefined): T[] => {
  if (!rows) {
    return [];
  }

  return Array.isArray(rows) ? rows : [rows];
};

const getServicePayload = <T>(
  data: Record<string, unknown>,
  serviceName: string,
): SeoulOpenApiListResponse<T> | null => {
  const payload = data[serviceName];

  if (payload && typeof payload === "object") {
    return payload as SeoulOpenApiListResponse<T>;
  }

  return null;
};

const getTopLevelResult = (
  data: Record<string, unknown>,
): SeoulOpenApiListResponse<never>["RESULT"] | undefined => {
  const result = data.RESULT;

  if (result && typeof result === "object") {
    return result as SeoulOpenApiListResponse<never>["RESULT"];
  }

  return undefined;
};

const throwIfApiError = (
  result: SeoulOpenApiListResponse<unknown>["RESULT"] | undefined,
  fallbackMessage: string,
) => {
  const code = result?.CODE;

  if (!code || code === SEOUL_API_SUCCESS_CODE || code === SEOUL_API_NO_DATA_CODE) {
    return;
  }

  throw new Error(result?.MESSAGE?.trim() || fallbackMessage);
};

const buildRequestUrl = (
  apiKey: string | undefined,
  serviceName: string,
  start: number,
  end: number,
  ...params: string[]
): string => {
  const key = apiKey?.trim();

  if (!key) {
    throw new Error(`${serviceName} API 키가 설정되어 있지 않습니다.`);
  }

  const encodedParams = params.map((param) => encodeURIComponent(param));

  return [
    getApiBaseUrl(),
    key,
    "json",
    serviceName,
    String(start),
    String(end),
    ...encodedParams,
  ].join("/");
};

const fetchSeoulOpenApi = async <T>(
  requestUrl: string,
  serviceName: string,
  signal: AbortSignal,
): Promise<SeoulOpenApiListResponse<T>> => {
  const response = await fetch(requestUrl, { signal });

  if (!response.ok) {
    throw new Error("시간표 정보를 불러오지 못했습니다.");
  }

  const data = (await response.json()) as Record<string, unknown>;
  const payload = getServicePayload<T>(data, serviceName);
  const result = payload?.RESULT ?? getTopLevelResult(data);

  throwIfApiError(result, "시간표 조회에 실패했습니다.");

  return payload ?? { RESULT: result, row: undefined };
};

const getStationNameCandidates = (stationName: string): string[] => {
  const trimmedStationName = stationName.trim();
  const candidates = [trimmedStationName];
  const baseName = trimmedStationName.replace(/\s*\(.+\)\s*$/, "").trim();
  const aliasMatches = [...trimmedStationName.matchAll(/\(([^)]+)\)/g)];

  if (baseName) {
    candidates.push(baseName);
  }

  aliasMatches.forEach((match) => {
    match[1]
      .split(/[,/]/)
      .map((alias) => alias.trim())
      .filter(Boolean)
      .forEach((alias) => candidates.push(alias));
  });

  return [...new Set(candidates)];
};

const fetchStationInfoByName = async (
  stationName: string,
  signal: AbortSignal,
): Promise<RawSubwayStationInfo[]> => {
  const requestUrl = buildRequestUrl(
    STATION_INFO_API_KEY,
    STATION_INFO_SERVICE,
    1,
    20,
    stationName,
  );
  const payload = await fetchSeoulOpenApi<RawSubwayStationInfo>(
    requestUrl,
    STATION_INFO_SERVICE,
    signal,
  );

  return normalizeRows(payload.row);
};

const findStationInfo = async (
  line: SubwayLine,
  stationName: string,
  signal: AbortSignal,
): Promise<RawSubwayStationInfo> => {
  const cacheKey = `${line}:${stationName}`;
  const cachedStationInfo = stationInfoCache.get(cacheKey);

  if (cachedStationInfo) {
    return cachedStationInfo;
  }

  const stationInfoPromise = (async () => {
    const lineNum = LINE_NUM_BY_LINE[line];
    const stationNameCandidates = getStationNameCandidates(stationName);

    for (const candidate of stationNameCandidates) {
      const stationInfos = await fetchStationInfoByName(candidate, signal);
      const matchedStationInfo = stationInfos.find(
        (stationInfo) => stationInfo.LINE_NUM === lineNum,
      );

      if (matchedStationInfo) {
        return matchedStationInfo;
      }
    }

    throw new Error(`${line} ${stationName}역의 시간표용 역 코드를 찾지 못했습니다.`);
  })();

  stationInfoCache.set(cacheKey, stationInfoPromise);
  return stationInfoPromise;
};

const parseTimeToSeconds = (time: string): number => {
  const [hours = 0, minutes = 0, seconds = 0] = time
    .split(":")
    .map((part) => Number(part));

  return hours * 3600 + minutes * 60 + seconds;
};

const formatTime = (time: string): string => {
  const [hours = "00", minutes = "00"] = time.split(":");
  return `${hours.padStart(2, "0")}:${minutes.padStart(2, "0")}`;
};

const isExpressTrain = (expressFlag: string): boolean => {
  const normalizedFlag = expressFlag.trim().toUpperCase();
  return normalizedFlag === "D" || normalizedFlag.includes("EXPRESS");
};

const toTimetableTrain = (
  row: RawSubwayTimetableRow,
  index: number,
): TimetableTrain => ({
  id: `${row.STATION_CD}-${row.TRAIN_NO}-${row.LEFTTIME}-${index}`,
  trainNo: row.TRAIN_NO,
  arrivalTime: formatTime(row.ARRIVETIME),
  departureTime: formatTime(row.LEFTTIME || row.ARRIVETIME),
  startStation: row.SUBWAYSNAME || "출발역 정보 없음",
  endStation: row.SUBWAYENAME || "종착역 정보 없음",
  isExpress: isExpressTrain(row.EXPRESS_YN),
});

export const fetchStationTimetable = async (
  line: SubwayLine,
  stationName: string,
  dayType: TimetableDayType,
  direction: TimetableDirection,
): Promise<SubwayTimetable> => {
  const controller = new AbortController();
  const timeoutId = window.setTimeout(
    () => controller.abort(),
    REQUEST_TIMEOUT_MS,
  );

  try {
    const stationInfo = await findStationInfo(
      line,
      stationName,
      controller.signal,
    );
    const requestUrl = buildRequestUrl(
      TIMETABLE_API_KEY,
      TIMETABLE_SERVICE,
      PAGE_START,
      PAGE_END,
      stationInfo.STATION_CD,
      WEEK_TAG_BY_DAY_TYPE[dayType],
      DIRECTION_TAG_BY_DIRECTION[direction],
    );
    const payload = await fetchSeoulOpenApi<RawSubwayTimetableRow>(
      requestUrl,
      TIMETABLE_SERVICE,
      controller.signal,
    );
    const timetableRows = normalizeRows(payload.row);

    if (timetableRows.length === 0) {
      throw new Error(
        `${line} ${stationName}역 시간표는 공공 API에서 제공되지 않습니다.`,
      );
    }

    const trains = timetableRows
      .toSorted(
        (a, b) =>
          parseTimeToSeconds(a.LEFTTIME || a.ARRIVETIME) -
          parseTimeToSeconds(b.LEFTTIME || b.ARRIVETIME),
      )
      .map(toTimetableTrain);

    return {
      line,
      stationName,
      apiStationName: stationInfo.STATION_NM,
      stationCode: stationInfo.STATION_CD,
      dayType,
      direction,
      trains,
    };
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      throw new Error("시간표 조회 요청 시간이 초과되었습니다.", {
        cause: error,
      });
    }

    throw error;
  } finally {
    window.clearTimeout(timeoutId);
  }
};
