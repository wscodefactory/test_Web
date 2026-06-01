import { useCallback, useState } from "react";
import type { SubwayLine } from "../data/stations";
import { fetchRealtimeArrivals } from "../services/api/subwayApi";
import type { GroupedSubwayArrivals } from "../types/subway";

interface RealtimeArrivalState {
  arrivals: GroupedSubwayArrivals | null;
  errorMessage: string;
  isLoading: boolean;
  updatedAt: Date | null;
}

const initialState: RealtimeArrivalState = {
  arrivals: null,
  errorMessage: "",
  isLoading: false,
  updatedAt: null,
};

export const useRealtimeArrival = () => {
  const [state, setState] = useState<RealtimeArrivalState>(initialState);

  const searchArrivals = useCallback(
    async (line: SubwayLine, stationName: string) => {
      setState((prevState) => ({
        ...prevState,
        errorMessage: "",
        isLoading: true,
      }));

      try {
        const arrivals = await fetchRealtimeArrivals(line, stationName);
        setState({
          arrivals,
          errorMessage: "",
          isLoading: false,
          updatedAt: new Date(),
        });
      } catch (error) {
        setState({
          arrivals: null,
          errorMessage:
            error instanceof Error
              ? error.message
              : "도착 정보를 다시 조회해주세요.",
          isLoading: false,
          updatedAt: null,
        });
      }
    },
    [],
  );

  return {
    ...state,
    searchArrivals,
  };
};
