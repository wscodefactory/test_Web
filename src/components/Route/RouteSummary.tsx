import { Search } from "lucide-react";
import type { RouteResult } from "../../types/route";
import { formatApproxMinutes } from "../../utils/timeFormat";

interface RouteSummaryProps {
  result: RouteResult;
}

export default function RouteSummary({ result }: RouteSummaryProps) {
  return (
    <section className="route-result-summary" aria-live="polite">
      <div className="route-section-title">
        <Search aria-hidden="true" size={18} />
        <h2>검색 결과</h2>
      </div>

      <div className="route-summary-grid">
        <article className="route-summary-item route-summary-item--time">
          <span>소요 시간</span>
          <strong>{formatApproxMinutes(result.totalMinutes)}</strong>
        </article>
        <article className="route-summary-item route-summary-item--transfer">
          <span>환승 횟수</span>
          <strong>{result.transferCount}회</strong>
        </article>
        <article className="route-summary-item route-summary-item--distance">
          <span>총 거리</span>
          <strong>{result.totalDistanceKm}km</strong>
        </article>
      </div>
    </section>
  );
}
