import { useCallback, useRef, useState } from "react";
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
  const latestRequestIdRef = useRef(0);

  // 여러 번 빠르게 조회해도 마지막 요청 결과만 화면에 반영합니다.
  const searchArrivals = useCallback(
    async (line: SubwayLine, stationName: string) => {
      const requestId = latestRequestIdRef.current + 1;
      latestRequestIdRef.current = requestId;

      setState({
        arrivals: null,
        errorMessage: "",
        isLoading: true,
        updatedAt: null,
      });

      try {
        const arrivals = await fetchRealtimeArrivals(line, stationName);

        if (latestRequestIdRef.current !== requestId) {
          return;
        }

        setState({
          arrivals,
          errorMessage: "",
          isLoading: false,
          updatedAt: new Date(),
        });
      } catch (error) {
        if (latestRequestIdRef.current !== requestId) {
          return;
        }

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
