import type { ArrivalDirectionGroup, SubwayArrival } from "../../types/subway";
import ArrivalItem from "./ArrivalItem";

interface ArrivalBoardProps {
  title: string;
  tone: ArrivalDirectionGroup;
  arrivals: SubwayArrival[];
}

export default function ArrivalBoard({
  title,
  tone,
  arrivals,
}: ArrivalBoardProps) {
  return (
    <section className={`arrival-board arrival-board--${tone}`}>
      <div className="arrival-board-header">
        <span>{title}</span>
      </div>

      <div className="arrival-list">
        {arrivals.length > 0 ? (
          arrivals.map((arrival) => (
            <ArrivalItem key={arrival.id} arrival={arrival} tone={tone} />
          ))
        ) : (
          <p className="arrival-empty">조회된 열차가 없습니다.</p>
        )}
      </div>
    </section>
  );
}
