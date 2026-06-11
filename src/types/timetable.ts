import type { SubwayLine } from "../data/stations";

export type TimetableDirection = "up" | "down";
export type TimetableDayType = "weekday" | "weekendHoliday";

export interface RawSubwayStationInfo {
  STATION_CD: string;
  STATION_NM: string;
  LINE_NUM: string;
  FR_CODE: string;
}

export interface RawSubwayTimetableRow {
  LINE_NUM: string;
  FR_CODE: string;
  STATION_CD: string;
  STATION_NM: string;
  TRAIN_NO: string;
  ARRIVETIME: string;
  LEFTTIME: string;
  ORIGINSTATION: string;
  DESTSTATION: string;
  SUBWAYSNAME: string;
  SUBWAYENAME: string;
  WEEK_TAG: string;
  INOUT_TAG: string;
  FL_FLAG: string;
  DESTSTATION2: string;
  EXPRESS_YN: string;
  BRANCH_LINE: string;
}

export interface SeoulOpenApiResult {
  CODE: string;
  MESSAGE: string;
}

export interface SeoulOpenApiListResponse<T> {
  list_total_count?: number;
  RESULT?: SeoulOpenApiResult;
  row?: T | T[];
}

export interface TimetableTrain {
  id: string;
  trainNo: string;
  arrivalTime: string;
  departureTime: string;
  startStation: string;
  endStation: string;
  isExpress: boolean;
}

export interface SubwayTimetable {
  line: SubwayLine;
  stationName: string;
  apiStationName: string;
  stationCode: string;
  dayType: TimetableDayType;
  direction: TimetableDirection;
  trains: TimetableTrain[];
}
