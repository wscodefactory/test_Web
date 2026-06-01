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
    // 상행/하행별 도착 열차 목록을 한 구역으로 묶어 보여줍니다.
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
