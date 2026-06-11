import { useSearchParams } from "react-router-dom";
import RouteDetailList from "../components/Route/RouteDetailList";
import RouteSearchForm from "../components/Route/RouteSearchForm";
import RouteSummary from "../components/Route/RouteSummary";
import { type SubwayLine } from "../data/stations";
import { useFavorites } from "../hooks/useFavorites";
import { useRouteSearch } from "../hooks/useRouteSearch";
import "../styles/Route.css";
import type { RouteFavoriteInput } from "../types/favorite";
import type { RouteSelection } from "../types/route";

const getRouteSelectionFromSearchParams = (
  searchParams: URLSearchParams,
  prefix: "start" | "end",
): RouteSelection => {
  const line = searchParams.get(`${prefix}Line`) as SubwayLine | null;
  const stationName = searchParams.get(`${prefix}Station`) ?? "";

  if (!line || !stationName) {
    return {
      line: "",
      stationName: "",
    };
  }

  return {
    line,
    stationName,
  };
};

export default function RoutePage() {
  const [searchParams] = useSearchParams();
  const { isRouteFavorite, toggleRouteFavorite } = useFavorites();
  const {
    canSearch,
    endSelection,
    endStationOptions,
    errorMessage,
    lineOptions,
    result,
    searchRoute,
    setEndLine,
    setEndStation,
    setStartLine,
    setStartStation,
    startSelection,
    startStationOptions,
    swapSelections,
  } = useRouteSearch(
    getRouteSelectionFromSearchParams(searchParams, "start"),
    getRouteSelectionFromSearchParams(searchParams, "end"),
  );
  const currentRouteFavorite: RouteFavoriteInput | null =
    startSelection.line &&
    startSelection.stationName &&
    endSelection.line &&
    endSelection.stationName
      ? {
          startLine: startSelection.line,
          startStation: startSelection.stationName,
          endLine: endSelection.line,
          endStation: endSelection.stationName,
        }
      : null;
  const isCurrentRouteFavorite = currentRouteFavorite
    ? isRouteFavorite(currentRouteFavorite)
    : false;

  const handleToggleFavorite = () => {
    if (!currentRouteFavorite) {
      return;
    }

    toggleRouteFavorite(currentRouteFavorite);
  };

  return (
    <section className="route-page">
      <header className="route-page-header">
        <h1>지하철 최단경로</h1>
        <p>빠르고 정확한 경로를 찾아드립니다</p>
      </header>

      <RouteSearchForm
        canSearch={canSearch}
        endSelection={endSelection}
        endStationOptions={endStationOptions}
        isFavorite={isCurrentRouteFavorite}
        lineOptions={lineOptions}
        startSelection={startSelection}
        startStationOptions={startStationOptions}
        onEndLineChange={setEndLine}
        onEndStationChange={setEndStation}
        onStartLineChange={setStartLine}
        onStartStationChange={setStartStation}
        onSubmit={searchRoute}
        onSwap={swapSelections}
        onToggleFavorite={handleToggleFavorite}
      />

      <p className="route-data-notice">
        현재 최단경로는 서울교통공사 역간거리 및 소요시간 데이터를 기준으로
        계산됩니다.
        <br />
        코레일 및 9호선 구간은 현재 반영되어 있지 않습니다.
      </p>

      {errorMessage && <p className="route-error">{errorMessage}</p>}

      {result && (
        <div className="route-results">
          <RouteSummary result={result} />
          <RouteDetailList result={result} />
        </div>
      )}
    </section>
  );
}
