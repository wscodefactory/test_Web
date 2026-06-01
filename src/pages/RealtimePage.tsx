import { useMemo, useState } from "react";
import ArrivalBoard from "../components/Realtime/ArrivalBoard";
import CurrentStationLabel from "../components/Realtime/CurrentStationLabel";
import RealtimeSearchForm from "../components/Realtime/RealtimeSearchFrom";
import {
  STATIONS_BY_LINE,
  type SubwayLine,
} from "../data/stations";
import { useRealtimeArrival } from "../hooks/useRealtimeArrival";
import "../styles/Realtime.css";

interface QueriedStation {
  line: SubwayLine;
  stationName: string;
}

export default function RealtimePage() {
  const [selectedLine, setSelectedLine] = useState<SubwayLine | "">("");
  const [selectedStation, setSelectedStation] = useState("");
  const [queriedStation, setQueriedStation] = useState<QueriedStation | null>(
    null,
  );
  const { arrivals, errorMessage, isLoading, searchArrivals, updatedAt } =
    useRealtimeArrival();

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

      {errorMessage && <p className="realtime-error">{errorMessage}</p>}

      {queriedStation && arrivals && (
        <div className="realtime-results">
          <CurrentStationLabel
            line={queriedStation.line}
            stationName={queriedStation.stationName}
            updatedAt={updatedAt}
          />
          <ArrivalBoard title="상행선" tone="up" arrivals={arrivals.up} />
          <ArrivalBoard title="하행선" tone="down" arrivals={arrivals.down} />
        </div>
      )}
    </section>
  );
}
