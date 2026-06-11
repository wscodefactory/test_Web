import { useCallback, useRef, useState } from "react";
import type { SubwayLine } from "../data/stations";
import { fetchStationTimetable } from "../services/api/timetableApi";
import type {
  SubwayTimetable,
  TimetableDayType,
  TimetableDirection,
} from "../types/timetable";

interface TimetableState {
  errorMessage: string;
  isLoading: boolean;
  timetable: SubwayTimetable | null;
}

const initialState: TimetableState = {
  errorMessage: "",
  isLoading: false,
  timetable: null,
};

export const useTimetable = () => {
  const [state, setState] = useState<TimetableState>(initialState);
  const latestRequestIdRef = useRef(0);

  const searchTimetable = useCallback(
    async (
      line: SubwayLine,
      stationName: string,
      dayType: TimetableDayType,
      direction: TimetableDirection,
    ) => {
      const requestId = latestRequestIdRef.current + 1;
      latestRequestIdRef.current = requestId;

      setState((currentState) => ({
        ...currentState,
        errorMessage: "",
        isLoading: true,
      }));

      try {
        const timetable = await fetchStationTimetable(
          line,
          stationName,
          dayType,
          direction,
        );

        if (latestRequestIdRef.current !== requestId) {
          return;
        }

        setState({
          errorMessage: "",
          isLoading: false,
          timetable,
        });
      } catch (error) {
        if (latestRequestIdRef.current !== requestId) {
          return;
        }

        setState({
          errorMessage:
            error instanceof Error
              ? error.message
              : "시간표를 다시 조회해주세요.",
          isLoading: false,
          timetable: null,
        });
      }
    },
    [],
  );

  const resetTimetable = useCallback(() => {
    latestRequestIdRef.current += 1;
    setState(initialState);
  }, []);

  return {
    ...state,
    resetTimetable,
    searchTimetable,
  };
};
