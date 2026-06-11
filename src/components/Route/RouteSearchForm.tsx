import { ArrowDown, Search, Star } from "lucide-react";
import {
  LINE_COLOR_BY_LINE,
  type SubwayLine,
} from "../../data/stations";
import type { RouteSelection } from "../../types/route";

interface RouteSearchFormProps {
  canSearch: boolean;
  endSelection: RouteSelection;
  endStationOptions: string[];
  isFavorite: boolean;
  lineOptions: SubwayLine[];
  startSelection: RouteSelection;
  startStationOptions: string[];
  onEndLineChange: (line: SubwayLine | "") => void;
  onEndStationChange: (stationName: string) => void;
  onStartLineChange: (line: SubwayLine | "") => void;
  onStartStationChange: (stationName: string) => void;
  onSubmit: () => void;
  onSwap: () => void;
  onToggleFavorite: () => void;
}

interface StationPreviewProps {
  selection: RouteSelection;
  tone: "start" | "end";
}

const StationPreview = ({ selection, tone }: StationPreviewProps) => {
  if (!selection.line || !selection.stationName) {
    return null;
  }

  return (
    <div className={`route-selected-label route-selected-label--${tone}`}>
      <span
        className="route-selected-dot"
        style={{ backgroundColor: LINE_COLOR_BY_LINE[selection.line] }}
      />
      <span>
        {selection.line} {selection.stationName}역
      </span>
    </div>
  );
};

export default function RouteSearchForm({
  canSearch,
  endSelection,
  endStationOptions,
  isFavorite,
  lineOptions,
  startSelection,
  startStationOptions,
  onEndLineChange,
  onEndStationChange,
  onStartLineChange,
  onStartStationChange,
  onSubmit,
  onSwap,
  onToggleFavorite,
}: RouteSearchFormProps) {
  return (
    <form
      className="route-search"
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit();
      }}
    >
      <div className="route-field-group">
        <span className="route-field-title">출발역</span>
        <div className="route-select-row">
          <select
            className="route-select"
            value={startSelection.line}
            onChange={(event) =>
              onStartLineChange(event.target.value as SubwayLine | "")
            }
          >
            <option value="">호선 선택</option>
            {lineOptions.map((line) => (
              <option key={line} value={line}>
                {line}
              </option>
            ))}
          </select>

          <select
            className="route-select"
            disabled={!startSelection.line}
            value={startSelection.stationName}
            onChange={(event) => onStartStationChange(event.target.value)}
          >
            <option value="">역 선택</option>
            {startStationOptions.map((stationName) => (
              <option key={stationName} value={stationName}>
                {stationName}
              </option>
            ))}
          </select>
        </div>
        <StationPreview selection={startSelection} tone="start" />
      </div>

      <button
        className="route-swap-button"
        type="button"
        aria-label="출발역과 도착역 바꾸기"
        onClick={onSwap}
      >
        <ArrowDown aria-hidden="true" size={22} />
      </button>

      <div className="route-field-group">
        <span className="route-field-title">도착역</span>
        <div className="route-select-row">
          <select
            className="route-select"
            value={endSelection.line}
            onChange={(event) =>
              onEndLineChange(event.target.value as SubwayLine | "")
            }
          >
            <option value="">호선 선택</option>
            {lineOptions.map((line) => (
              <option key={line} value={line}>
                {line}
              </option>
            ))}
          </select>

          <select
            className="route-select"
            disabled={!endSelection.line}
            value={endSelection.stationName}
            onChange={(event) => onEndStationChange(event.target.value)}
          >
            <option value="">역 선택</option>
            {endStationOptions.map((stationName) => (
              <option key={stationName} value={stationName}>
                {stationName}
              </option>
            ))}
          </select>
        </div>
        <StationPreview selection={endSelection} tone="end" />
      </div>

      <div className="route-action-row">
        <button
          className="route-search-button"
          disabled={!canSearch}
          type="submit"
        >
          <Search aria-hidden="true" size={21} />
          경로 검색
        </button>
        <button
          className={
            isFavorite
              ? "route-favorite-button route-favorite-button--active"
              : "route-favorite-button"
          }
          disabled={!canSearch}
          type="button"
          aria-label={isFavorite ? "즐겨찾기에서 삭제" : "즐겨찾기에 추가"}
          title={isFavorite ? "즐겨찾기에서 삭제" : "즐겨찾기에 추가"}
          onClick={onToggleFavorite}
        >
          <Star
            aria-hidden="true"
            fill={isFavorite ? "currentColor" : "none"}
            size={23}
          />
        </button>
      </div>
    </form>
  );
}
