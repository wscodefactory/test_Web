import { LINE_COLOR_BY_LINE, type SubwayLine } from "../../data/stations";

interface CurrentStationLabelProps {
  line: SubwayLine;
  stationName: string;
  updatedAt: Date | null;
}

const formatUpdatedAt = (updatedAt: Date | null): string => {
  if (!updatedAt) {
    return "";
  }

  // 마지막 조회 시간을 한국어 시간 형식으로 표시합니다.
  return new Intl.DateTimeFormat("ko-KR", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
  }).format(updatedAt);
};

export default function CurrentStationLabel({
  line,
  stationName,
  updatedAt,
}: CurrentStationLabelProps) {
  const updatedTime = formatUpdatedAt(updatedAt);

  return (
    <section className="current-station" aria-live="polite">
      <div className="current-station-title">
        <span
          className="current-station-dot"
          style={{ backgroundColor: LINE_COLOR_BY_LINE[line] }}
        />
        <strong>
          {line} {stationName}역
        </strong>
      </div>

      {updatedTime && (
        <span className="current-station-time">업데이트: {updatedTime}</span>
      )}
    </section>
  );
}
