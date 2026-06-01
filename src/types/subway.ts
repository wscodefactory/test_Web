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
  directionName: string;
  destination: string;
  trainStatus: string;
  trainOrder: string;
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
