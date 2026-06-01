import { TrainFront } from "lucide-react";
import type { ArrivalDirectionGroup, SubwayArrival } from "../../types/subway";

interface ArrivalItemProps {
  arrival: SubwayArrival;
  tone: ArrivalDirectionGroup;
}

const PREVIOUS_STATION_STATUS_PATTERN = /전역\s*(도착|출발|진입)/;
const TRAIN_ORDER_PATTERN = /^(\d+)번째 전$/;

// API의 "전역 도착/출발/진입" 상태는 오른쪽 보조 문구로 분리합니다.
const getPreviousStationStatus = (arrival: SubwayArrival): string => {
  const statusMatch = arrival.arrivalMessage.match(
    PREVIOUS_STATION_STATUS_PATTERN,
  );
  return statusMatch ? `전역 ${statusMatch[1]}` : "";
};

const getFallbackMinutesFromOrder = (arrival: SubwayArrival): number | null => {
  const orderMatch = arrival.trainOrder.match(TRAIN_ORDER_PATTERN);

  if (!orderMatch) {
    return null;
  }

  const minutes = Number(orderMatch[1]);
  return Number.isFinite(minutes) && minutes > 0 ? minutes : null;
};

const formatArrivalStatus = (arrival: SubwayArrival): string => {
  if (arrival.trainOrder === "도착") {
    return "도착";
  }

  if (arrival.arrivalSeconds !== null && arrival.arrivalSeconds <= 0) {
    return "도착";
  }

  if (arrival.arrivalSeconds !== null) {
    return `${Math.ceil(arrival.arrivalSeconds / 60)}분후 도착`;
  }

  const fallbackMinutes = getFallbackMinutesFromOrder(arrival);

  return fallbackMinutes ? `${fallbackMinutes}분후 도착` : "도착예정";
};

const getTrainTitle = (arrival: SubwayArrival): string => {
  return arrival.directionName.includes("행")
    ? arrival.directionName
    : `${arrival.destination} 행`;
};

export default function ArrivalItem({ arrival, tone }: ArrivalItemProps) {
  const isExpress = arrival.trainStatus.includes("급행");
  const previousStationStatus = getPreviousStationStatus(arrival);

  return (
    <article className={`arrival-item arrival-item--${tone}`}>
      <div className="arrival-main">
        <span className="arrival-icon">
          <TrainFront aria-hidden="true" size={16} />
        </span>

        <div className="arrival-copy">
          <div className="arrival-title-row">
            <strong>{getTrainTitle(arrival)}</strong>
            <span
              className={`arrival-badge ${
                isExpress ? "arrival-badge--express" : "arrival-badge--normal"
              }`}
            >
              {arrival.trainStatus}
            </span>
            {arrival.isLastTrain && (
              <span className="arrival-badge arrival-badge--last">막차</span>
            )}
          </div>
          <p>
            {arrival.trainOrder} · {arrival.detailMessage}
          </p>
        </div>
      </div>

      <div className="arrival-time">
        <strong>{formatArrivalStatus(arrival)}</strong>
        {previousStationStatus && <span>{previousStationStatus}</span>}
      </div>
    </article>
  );
}
