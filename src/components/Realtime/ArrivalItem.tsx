import { TrainFront } from "lucide-react";
import type { ArrivalDirectionGroup, SubwayArrival } from "../../types/subway";

interface ArrivalItemProps {
  arrival: SubwayArrival;
  tone: ArrivalDirectionGroup;
}

const formatArrivalTime = (arrivalSeconds: number | null): string => {
  if (arrivalSeconds === null) {
    return "정보 없음";
  }

  if (arrivalSeconds <= 30) {
    return "곧 도착";
  }

  return `약 ${Math.ceil(arrivalSeconds / 60)}분 후`;
};

export default function ArrivalItem({ arrival, tone }: ArrivalItemProps) {
  const isExpress = arrival.trainStatus.includes("급행");

  return (
    <article className={`arrival-item arrival-item--${tone}`}>
      <div className="arrival-main">
        <span className="arrival-icon">
          <TrainFront aria-hidden="true" size={16} />
        </span>

        <div className="arrival-copy">
          <div className="arrival-title-row">
            <strong>{arrival.destination} 행</strong>
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
        <strong>{formatArrivalTime(arrival.arrivalSeconds)}</strong>
        <span>{arrival.arrivalMessage}</span>
      </div>
    </article>
  );
}
