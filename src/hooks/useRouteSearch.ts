import { useMemo, useState } from "react";
import { type SubwayLine } from "../data/stations";
import {
  makeStationNodeId,
  ROUTE_LINES,
  ROUTE_STATIONS_BY_LINE,
  STATION_NODE_BY_ID,
  SUBWAY_GRAPH,
} from "../data/graph";
import { findShortestRoute } from "../utils/dijkstra";
import type { RouteResult, RouteSelection } from "../types/route";

const EMPTY_SELECTION: RouteSelection = {
  line: "",
  stationName: "",
};

const getValidatedSelection = (selection: RouteSelection): RouteSelection => {
  if (!selection.line || !selection.stationName) {
    return EMPTY_SELECTION;
  }

  const stationOptions = ROUTE_STATIONS_BY_LINE[selection.line] ?? [];

  if (!stationOptions.includes(selection.stationName)) {
    return EMPTY_SELECTION;
  }

  return selection;
};

export const useRouteSearch = (
  initialStartSelection: RouteSelection = EMPTY_SELECTION,
  initialEndSelection: RouteSelection = EMPTY_SELECTION,
) => {
  const [startSelection, setStartSelection] = useState<RouteSelection>(() =>
    getValidatedSelection(initialStartSelection),
  );
  const [endSelection, setEndSelection] = useState<RouteSelection>(() =>
    getValidatedSelection(initialEndSelection),
  );
  const [result, setResult] = useState<RouteResult | null>(null);
  const [errorMessage, setErrorMessage] = useState("");

  const startStationOptions = useMemo(() => {
    if (!startSelection.line) {
      return [];
    }

    return ROUTE_STATIONS_BY_LINE[startSelection.line] ?? [];
  }, [startSelection.line]);

  const endStationOptions = useMemo(() => {
    if (!endSelection.line) {
      return [];
    }

    return ROUTE_STATIONS_BY_LINE[endSelection.line] ?? [];
  }, [endSelection.line]);

  const startNodeId =
    startSelection.line && startSelection.stationName
      ? makeStationNodeId(startSelection.line, startSelection.stationName)
      : "";
  const endNodeId =
    endSelection.line && endSelection.stationName
      ? makeStationNodeId(endSelection.line, endSelection.stationName)
      : "";
  const canSearch = Boolean(startNodeId && endNodeId && startNodeId !== endNodeId);

  const clearRouteResult = () => {
    setResult(null);
    setErrorMessage("");
  };

  const setStartLine = (line: SubwayLine | "") => {
    setStartSelection({
      line,
      stationName: "",
    });
    clearRouteResult();
  };

  const setStartStation = (stationName: string) => {
    setStartSelection((current) => ({
      ...current,
      stationName,
    }));
    clearRouteResult();
  };

  const setEndLine = (line: SubwayLine | "") => {
    setEndSelection({
      line,
      stationName: "",
    });
    clearRouteResult();
  };

  const setEndStation = (stationName: string) => {
    setEndSelection((current) => ({
      ...current,
      stationName,
    }));
    clearRouteResult();
  };

  const swapSelections = () => {
    setStartSelection(endSelection);
    setEndSelection(startSelection);
    clearRouteResult();
  };

  const searchRoute = () => {
    if (!startNodeId || !endNodeId) {
      setResult(null);
      setErrorMessage("출발역과 도착역을 모두 선택해주세요.");
      return;
    }

    if (startNodeId === endNodeId) {
      setResult(null);
      setErrorMessage("출발역과 도착역이 같습니다.");
      return;
    }

    const route = findShortestRoute(
      SUBWAY_GRAPH,
      STATION_NODE_BY_ID,
      startNodeId,
      endNodeId,
    );

    if (!route) {
      setResult(null);
      setErrorMessage("선택한 역 사이의 경로를 찾지 못했습니다.");
      return;
    }

    setResult({
      ...route,
      departureTimeIso: new Date().toISOString(),
    });
    setErrorMessage("");
  };

  return {
    canSearch,
    endSelection,
    endStationOptions,
    errorMessage,
    result,
    searchRoute,
    setEndLine,
    setEndStation,
    setStartLine,
    setStartStation,
    lineOptions: ROUTE_LINES,
    startSelection,
    startStationOptions,
    swapSelections,
  };
};
