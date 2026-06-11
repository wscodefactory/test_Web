import { Clock } from "lucide-react";
import { useMemo, useState } from "react";
import {
  LINE_COLOR_BY_LINE,
  STATIONS_BY_LINE,
  SUBWAY_LINES,
  type SubwayLine,
} from "../data/stations";
import { useTimetable } from "../hooks/useTimetable";
import type { TimetableDayType, TimetableDirection } from "../types/timetable";
import "../styles/Timetable.css";

const DAY_OPTIONS: TimetableDayType[] = ["weekday", "weekendHoliday"];
const DIRECTION_OPTIONS: TimetableDirection[] = ["up", "down"];
const UNSUPPORTED_TIMETABLE_LINES: SubwayLine[] = ["2호선"];

const DAY_LABEL_BY_TYPE: Record<TimetableDayType, string> = {
  weekday: "평일",
  weekendHoliday: "주말/공휴일",
};

const getDirectionLabel = (
  line: SubwayLine,
  direction: TimetableDirection,
): string => {
  if (line === "2호선") {
    return direction === "up" ? "내선순환" : "외선순환";
  }

  return direction === "up" ? "상행선" : "하행선";
};

const isUnsupportedTimetableLine = (line: SubwayLine): boolean =>
  UNSUPPORTED_TIMETABLE_LINES.includes(line);

export default function TimetablePage() {
  const [selectedLine, setSelectedLine] = useState<SubwayLine | "">("");
  const [selectedStation, setSelectedStation] = useState("");
  const [selectedDayType, setSelectedDayType] =
    useState<TimetableDayType>("weekday");
  const [selectedDirection, setSelectedDirection] =
    useState<TimetableDirection>("up");
  const { errorMessage, isLoading, resetTimetable, searchTimetable, timetable } =
    useTimetable();

  const stationOptions = useMemo(() => {
    if (!selectedLine) {
      return [];
    }

    return STATIONS_BY_LINE[selectedLine];
  }, [selectedLine]);

  const canSearch = Boolean(selectedLine && selectedStation) && !isLoading;

  const handleLineChange = (line: SubwayLine | "") => {
    if (line && isUnsupportedTimetableLine(line)) {
      return;
    }

    setSelectedLine(line);
    setSelectedStation("");
    setSelectedDayType("weekday");
    setSelectedDirection("up");
    resetTimetable();
  };

  const handleStationChange = (stationName: string) => {
    setSelectedStation(stationName);
    resetTimetable();
  };

  const handleSearch = (
    direction = selectedDirection,
    dayType = selectedDayType,
  ) => {
    if (!selectedLine || !selectedStation) {
      return;
    }

    void searchTimetable(selectedLine, selectedStation, dayType, direction);
  };

  const handleResultDirectionChange = (direction: TimetableDirection) => {
    setSelectedDirection(direction);
    handleSearch(direction, timetable?.dayType ?? selectedDayType);
  };

  const handleResultDayChange = (dayType: TimetableDayType) => {
    setSelectedDayType(dayType);
    handleSearch(timetable?.direction ?? selectedDirection, dayType);
  };

  return (
    <section className="timetable-page">
      <header className="timetable-page-header">
        <h1>지하철 시간표</h1>
        <p>호선과 역을 선택하여 시간표를 확인하세요</p>
      </header>

      <form
        className="timetable-search"
        onSubmit={(event) => {
          event.preventDefault();
          if (canSearch) {
            handleSearch();
          }
        }}
      >
        <label className="timetable-field">
          <span className="timetable-field-label">호선 선택</span>
          <select
            className="timetable-select"
            value={selectedLine}
            onChange={(event) =>
              handleLineChange(event.target.value as SubwayLine | "")
            }
          >
            <option value="">호선을 선택하세요</option>
            {SUBWAY_LINES.map((line) => (
              <option
                disabled={isUnsupportedTimetableLine(line)}
                key={line}
                value={line}
              >
                {line}
                {isUnsupportedTimetableLine(line) ? " (시간표 미제공)" : ""}
              </option>
            ))}
          </select>
        </label>

        {selectedLine && (
          <label className="timetable-field">
            <span className="timetable-field-label">역 선택</span>
            <select
              className="timetable-select"
              value={selectedStation}
              onChange={(event) => handleStationChange(event.target.value)}
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
          <div className="timetable-field">
            <span className="timetable-field-label">요일 선택</span>
            <div className="timetable-day-grid">
              {DAY_OPTIONS.map((dayType) => (
                <button
                  key={dayType}
                  className={
                    selectedDayType === dayType
                      ? "timetable-option-button timetable-option-button--active"
                      : "timetable-option-button"
                  }
                  type="button"
                  onClick={() => setSelectedDayType(dayType)}
                >
                  {DAY_LABEL_BY_TYPE[dayType]}
                </button>
              ))}
            </div>
          </div>
        )}

        {selectedLine && selectedStation && (
          <div className="timetable-field">
            <span className="timetable-field-label">방향 선택</span>
            <div className="timetable-direction-grid">
              {DIRECTION_OPTIONS.map((direction) => (
                <button
                  key={direction}
                  className={
                    selectedDirection === direction
                      ? "timetable-option-button timetable-option-button--active"
                      : "timetable-option-button"
                  }
                  type="button"
                  onClick={() => setSelectedDirection(direction)}
                >
                  {getDirectionLabel(selectedLine, direction)}
                </button>
              ))}
            </div>
          </div>
        )}

        {selectedLine && selectedStation && (
          <button
            className="timetable-search-button"
            disabled={!canSearch}
            type="submit"
          >
            <Clock aria-hidden="true" size={19} />
            {isLoading ? "조회 중" : "시간표 조회"}
          </button>
        )}
      </form>

      {errorMessage && <p className="timetable-error">{errorMessage}</p>}

      {timetable && (
        <section className="timetable-result" aria-live="polite">
          <div className="timetable-result-header">
            <div className="timetable-station-title">
              <div className="timetable-station-name">
                <span
                  className="timetable-line-dot"
                  style={{ backgroundColor: LINE_COLOR_BY_LINE[timetable.line] }}
                />
                <h2>
                  {timetable.line} {timetable.stationName}역
                </h2>
              </div>
              <p>
                {DAY_LABEL_BY_TYPE[timetable.dayType]} 기준 시간표 ·{" "}
                {timetable.trains.length}개 열차
                {timetable.apiStationName !== timetable.stationName
                  ? ` · API 역명 ${timetable.apiStationName}`
                  : ""}
              </p>
            </div>
            <span className="timetable-result-badge">
              {getDirectionLabel(timetable.line, timetable.direction)}
            </span>
          </div>

          <div className="timetable-result-tabs timetable-result-tabs--days">
            {DAY_OPTIONS.map((dayType) => (
              <button
                key={dayType}
                className={
                  timetable.dayType === dayType
                    ? "timetable-result-tab timetable-result-tab--active"
                    : "timetable-result-tab"
                }
                disabled={isLoading}
                type="button"
                onClick={() => handleResultDayChange(dayType)}
              >
                {DAY_LABEL_BY_TYPE[dayType]}
              </button>
            ))}
          </div>

          <div className="timetable-result-tabs">
            {DIRECTION_OPTIONS.map((direction) => (
              <button
                key={direction}
                className={
                  timetable.direction === direction
                    ? "timetable-result-tab timetable-result-tab--active"
                    : "timetable-result-tab"
                }
                disabled={isLoading}
                type="button"
                onClick={() => handleResultDirectionChange(direction)}
              >
                {getDirectionLabel(timetable.line, direction)}
              </button>
            ))}
          </div>

          {timetable.trains.length > 0 ? (
            <div className="timetable-time-grid">
              {timetable.trains.map((train) => (
                <article className="timetable-time-card" key={train.id}>
                  <strong>{train.departureTime}</strong>
                  <span>{train.endStation} 행</span>
                  {train.isExpress && <em>급행</em>}
                </article>
              ))}
            </div>
          ) : (
            <p className="timetable-empty">조회된 시간표가 없습니다.</p>
          )}
        </section>
      )}
    </section>
  );
}
