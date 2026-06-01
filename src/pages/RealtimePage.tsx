import { useMemo, useState } from "react";
import ArrivalBoard from "../components/Realtime/ArrivalBoard";
import CurrentStationLabel from "../components/Realtime/CurrentStationLabel";
import RealtimeSearchForm from "../components/Realtime/RealtimeSearchFrom";
import {
  STATIONS_BY_LINE,
  type SubwayLine,
} from "../data/stations";
import { useRealtimeArrival } from "../hooks/useRealtimeArrival";
import type { ArrivalDirectionGroup, SubwayArrival } from "../types/subway";
import "../styles/Realtime.css";

interface QueriedStation {
  line: SubwayLine;
  stationName: string;
}

const FALLBACK_DIRECTION_TITLE: Record<
  SubwayLine,
  Record<ArrivalDirectionGroup, string>
> = {
  "1호선": { up: "상행선", down: "하행선" },
  "2호선": { up: "내선순환", down: "외선순환" },
  "3호선": { up: "상행선", down: "하행선" },
  "4호선": { up: "상행선", down: "하행선" },
  "5호선": { up: "상행선", down: "하행선" },
  "6호선": { up: "상행선", down: "하행선" },
  "7호선": { up: "상행선", down: "하행선" },
  "8호선": { up: "상행선", down: "하행선" },
  "9호선": { up: "상행선", down: "하행선" },
};

// API 방면명이 없을 때는 호선 기본 방면명을 사용합니다.
const getDirectionTitle = (
  line: SubwayLine,
  tone: ArrivalDirectionGroup,
  arrivalList: SubwayArrival[],
): string => {
  const apiLabel = arrivalList.find(
    (arrival) => arrival.directionLabel,
  )?.directionLabel;

  if (!apiLabel) {
    return FALLBACK_DIRECTION_TITLE[line][tone];
  }

  if (apiLabel.endsWith("순환") || apiLabel.endsWith("선")) {
    return apiLabel;
  }

  if (apiLabel.includes("내선") || apiLabel.includes("외선")) {
    return `${apiLabel}순환`;
  }

  if (apiLabel.includes("상행") || apiLabel.includes("하행")) {
    return `${apiLabel}선`;
  }

  return apiLabel;
};

export default function RealtimePage() {
  const [selectedLine, setSelectedLine] = useState<SubwayLine | "">("");
  const [selectedStation, setSelectedStation] = useState("");
  const [queriedStation, setQueriedStation] = useState<QueriedStation | null>(
    null,
  );
  const { arrivals, errorMessage, isLoading, searchArrivals, updatedAt } =
    useRealtimeArrival();

  // 선택한 호선에 맞는 역 목록만 드롭다운에 노출합니다.
  const stationOptions = useMemo(() => {
    if (!selectedLine) {
      return [];
    }

    return STATIONS_BY_LINE[selectedLine];
  }, [selectedLine]);

  const handleLineChange = (line: SubwayLine | "") => {
    setSelectedLine(line);
    setSelectedStation("");
    setQueriedStation(null);
  };

  // 검색 버튼을 누르면 현재 선택값으로 실시간 도착정보를 조회합니다.
  const handleSubmit = () => {
    if (!selectedLine || !selectedStation) {
      return;
    }

    const station = {
      line: selectedLine,
      stationName: selectedStation,
    };

    setQueriedStation(station);
    void searchArrivals(station.line, station.stationName);
  };

  return (
    <section className="realtime-page">
      <header className="realtime-page-header">
        <h1>실시간 도착정보</h1>
        <p>역을 선택하여 실시간 열차 도착 정보를 확인하세요</p>
      </header>

      <RealtimeSearchForm
        isLoading={isLoading}
        selectedLine={selectedLine}
        selectedStation={selectedStation}
        stationOptions={stationOptions}
        onLineChange={handleLineChange}
        onStationChange={setSelectedStation}
        onSubmit={handleSubmit}
      />

      {queriedStation && errorMessage && (
        <p className="realtime-error">{errorMessage}</p>
      )}

      {queriedStation && arrivals && (
        <div className="realtime-results">
          <CurrentStationLabel
            line={queriedStation.line}
            stationName={queriedStation.stationName}
            updatedAt={updatedAt}
          />
          <ArrivalBoard
            title={getDirectionTitle(queriedStation.line, "up", arrivals.up)}
            tone="up"
            arrivals={arrivals.up}
          />
          <ArrivalBoard
            title={getDirectionTitle(queriedStation.line, "down", arrivals.down)}
            tone="down"
            arrivals={arrivals.down}
          />
        </div>
      )}
    </section>
  );
}
