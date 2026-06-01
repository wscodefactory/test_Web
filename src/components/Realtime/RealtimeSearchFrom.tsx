import { TrainFront } from "lucide-react";
import { SUBWAY_LINES, type SubwayLine } from "../../data/stations";

interface RealtimeSearchFormProps {
  selectedLine: SubwayLine | "";
  selectedStation: string;
  stationOptions: string[];
  isLoading: boolean;
  onLineChange: (line: SubwayLine | "") => void;
  onStationChange: (stationName: string) => void;
  onSubmit: () => void;
}

export default function RealtimeSearchForm({
  selectedLine,
  selectedStation,
  stationOptions,
  isLoading,
  onLineChange,
  onStationChange,
  onSubmit,
}: RealtimeSearchFormProps) {
  const isSearchDisabled = !selectedLine || !selectedStation || isLoading;

  return (
    // 호선과 역을 선택한 뒤 실시간 도착정보 조회를 실행하는 폼입니다.
    <form
      className="realtime-search"
      onSubmit={(event) => {
        event.preventDefault();
        if (!isSearchDisabled) {
          onSubmit();
        }
      }}
    >
      <label className="realtime-field">
        <span className="realtime-field-label">호선 선택</span>
        <select
          className="realtime-select"
          value={selectedLine}
          onChange={(event) =>
            onLineChange(event.target.value as SubwayLine | "")
          }
        >
          <option value="">호선을 선택하세요</option>
          {SUBWAY_LINES.map((line) => (
            <option key={line} value={line}>
              {line}
            </option>
          ))}
        </select>
      </label>

      {selectedLine && (
        <label className="realtime-field">
          <span className="realtime-field-label">역 선택</span>
          <select
            className="realtime-select"
            value={selectedStation}
            onChange={(event) => onStationChange(event.target.value)}
          >
            <option value="">역을 선택하세요</option>
            {stationOptions.map((stationName) => (
              <option key={stationName} value={stationName}>
                {stationName}
              </option>
            ))}
          </select>
        </label>
      )}

      {selectedLine && selectedStation && (
        <button
          className="realtime-search-button"
          disabled={isSearchDisabled}
          type="submit"
        >
          <TrainFront aria-hidden="true" size={16} />
          {isLoading ? "조회 중" : "도착 정보 조회"}
        </button>
      )}
    </form>
  );
}
