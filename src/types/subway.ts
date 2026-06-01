// 서울 지하철 실시간 도착 API 응답과 화면 표시용 데이터 타입입니다.
export type ArrivalDirectionGroup = "up" | "down";

export interface SeoulApiResult {
  CODE: string;
  MESSAGE: string;
}

export interface SeoulSubwayErrorMessage {
  status?: number;
  code: string;
  message: string;
  total?: number;
}

export interface RawSubwayArrival {
  subwayId: string;
  updnLine: string;
  trainLineNm?: string;
  trianLineNm?: string;
  statnFid: string;
  statnTid: string;
  statnId: string;
  statnNm: string;
  trainCo?: string;
  trnsitCo?: string;
  ordkey: string;
  subwayList: string;
  statnList: string;
  btrainSttus: string;
  barvlDt: string;
  btrainNo: string;
  bstatnId: string;
  bstatnNm: string;
  recptnDt: string;
  arvlMsg2: string;
  arvlMsg3: string;
  arvlCd: string;
  lstcarAt: string;
}

export interface SeoulSubwayApiResponse {
  status?: number;
  code?: string;
  message?: string;
  developerMessage?: string;
  list_total_count?: number;
  RESULT?: SeoulApiResult;
  errorMessage?: SeoulSubwayErrorMessage;
  realtimeArrivalList?: RawSubwayArrival[];
}

export interface SubwayArrival {
  id: string;
  subwayId: string;
  stationName: string;
  directionGroup: ArrivalDirectionGroup;
  directionLabel: string;
  directionName: string;
  destination: string;
  trainStatus: string;
  trainOrder: string;
  arrivalRank: number;
  arrivalMessage: string;
  detailMessage: string;
  arrivalSeconds: number | null;
  receiveAt: string;
  isLastTrain: boolean;
}

export interface GroupedSubwayArrivals {
  up: SubwayArrival[];
  down: SubwayArrival[];
}
