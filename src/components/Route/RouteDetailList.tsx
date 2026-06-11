import { useState } from "react";
import { ChevronDown, Repeat, Train } from "lucide-react";
import { LINE_COLOR_BY_LINE, type SubwayLine } from "../../data/stations";
import type { RouteResult, RouteStep } from "../../types/route";
import { formatApproxMinutes } from "../../utils/timeFormat";
import RouteNode from "./RouteNode";

interface RouteDetailListProps {
  result: RouteResult;
}

type TimelineStep = RouteStep & {
  clockTime: string;
  cumulativeMinutes: number;
  description: string;
  title: string;
};

type TimelineEntry =
  | {
      id: string;
      isEnd: boolean;
      isStart: boolean;
      step: TimelineStep;
      type: "node";
    }
  | {
      distanceKm: number;
      hiddenStations: TimelineStep[];
      id: string;
      line: SubwayLine;
      minutes: number;
      stationCount: number;
      type: "rideGroup";
    }
  | {
      id: string;
      step: TimelineStep;
      type: "transfer";
    };

const addMinutes = (date: Date, minutes: number) =>
  new Date(date.getTime() + minutes * 60 * 1000);

const formatClockTime = (date: Date) =>
  date.toLocaleTimeString("ko-KR", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

const getNodeTitle = (
  step: RouteStep,
  index: number,
  steps: RouteStep[],
) => {
  const isStart = index === 0;
  const isEnd = index === steps.length - 1;
  const nextStep = steps[index + 1];

  if (isStart) {
    return `${step.line} ${step.stationName} 출발`;
  }

  if (isEnd) {
    return `${step.stationName} 도착`;
  }

  if (step.edgeTypeFromPrevious === "transfer") {
    return `${step.line} ${step.stationName} 승차`;
  }

  if (nextStep?.edgeTypeFromPrevious === "transfer") {
    return `${step.stationName} 하차`;
  }

  return step.stationName;
};

const getNodeDescription = (
  step: RouteStep,
  index: number,
  steps: RouteStep[],
) => {
  const isStart = index === 0;
  const isEnd = index === steps.length - 1;
  const nextStep = steps[index + 1];

  if (isStart) {
    return "현시각 출발 기준";
  }

  if (isEnd) {
    return "예상 도착";
  }

  if (step.edgeTypeFromPrevious === "transfer") {
    return "환승 후 승차";
  }

  if (nextStep?.edgeTypeFromPrevious === "transfer") {
    return "환승 지점";
  }

  return `${step.line} 구간 이동`;
};

const isMajorTimelineNode = (
  step: RouteStep,
  index: number,
  steps: RouteStep[],
) => {
  const isStart = index === 0;
  const isEnd = index === steps.length - 1;
  const nextStep = steps[index + 1];

  return (
    isStart ||
    isEnd ||
    step.edgeTypeFromPrevious === "transfer" ||
    nextStep?.edgeTypeFromPrevious === "transfer"
  );
};

const sumMinutes = (steps: TimelineStep[]) =>
  steps.reduce((total, step) => total + step.minutesFromPrevious, 0);

const sumDistance = (steps: TimelineStep[]) =>
  Number(
    steps
      .reduce((total, step) => total + step.distanceFromPreviousKm, 0)
      .toFixed(1),
  );

const createTimelineEntries = (steps: TimelineStep[]): TimelineEntry[] => {
  const majorIndexes = steps.reduce<number[]>((indexes, step, index) => {
    if (!isMajorTimelineNode(step, index, steps)) {
      return indexes;
    }

    return [...indexes, index];
  }, []);

  return majorIndexes.reduce<TimelineEntry[]>((items, majorIndex, position) => {
    const step = steps[majorIndex];
    const nodeEntry: TimelineEntry = {
      id: `node-${step.nodeId}`,
      isEnd: majorIndex === steps.length - 1,
      isStart: majorIndex === 0,
      step,
      type: "node",
    };

    if (position === 0) {
      return [nodeEntry];
    }

    if (step.edgeTypeFromPrevious === "transfer") {
      return [
        ...items,
        {
          id: `transfer-${step.nodeId}`,
          step,
          type: "transfer",
        },
        nodeEntry,
      ];
    }

    const previousMajorIndex = majorIndexes[position - 1];
    const rideSteps = steps.slice(previousMajorIndex + 1, majorIndex + 1);

    return [
      ...items,
      {
        distanceKm: sumDistance(rideSteps),
        hiddenStations: rideSteps.slice(0, -1),
        id: `ride-${steps[previousMajorIndex].nodeId}-${step.nodeId}`,
        line: step.line,
        minutes: sumMinutes(rideSteps),
        stationCount: rideSteps.length,
        type: "rideGroup",
      },
      nodeEntry,
    ];
  }, []);
};

export default function RouteDetailList({ result }: RouteDetailListProps) {
  const [expandedRideGroupIds, setExpandedRideGroupIds] = useState<Set<string>>(
    () => new Set(),
  );
  const departureTime = new Date(
    result.departureTimeIso ?? "1970-01-01T00:00:00.000Z",
  );
  const timelineSteps = result.steps.reduce<TimelineStep[]>((items, step, index) => {
    const cumulativeMinutes =
      index === 0
        ? 0
        : (items[index - 1]?.cumulativeMinutes ?? 0) +
          step.minutesFromPrevious;

    return [
      ...items,
      {
        ...step,
        clockTime: formatClockTime(addMinutes(departureTime, cumulativeMinutes)),
        cumulativeMinutes,
        description: getNodeDescription(step, index, result.steps),
        title: getNodeTitle(step, index, result.steps),
      },
    ];
  }, []);
  const timelineEntries = createTimelineEntries(timelineSteps);

  const toggleRideGroup = (groupId: string) => {
    setExpandedRideGroupIds((currentIds) => {
      const nextIds = new Set(currentIds);

      if (nextIds.has(groupId)) {
        nextIds.delete(groupId);
        return nextIds;
      }

      nextIds.add(groupId);
      return nextIds;
    });
  };

  return (
    <section className="route-detail">
      <div className="route-detail-header">
        <h2>상세 경로</h2>
        <span>{formatClockTime(departureTime)} 출발 기준</span>
      </div>

      <div className="route-timeline">
        {timelineEntries.map((entry) => {
          if (entry.type === "transfer") {
            return (
              <div className="route-timeline-entry" key={entry.id}>
                <div
                  className="route-move route-move--transfer"
                >
                  <Repeat aria-hidden="true" size={14} />
                  <span>
                    환승 {formatApproxMinutes(entry.step.minutesFromPrevious)}
                  </span>
                </div>
              </div>
            );
          }

          if (entry.type === "rideGroup") {
            const isExpanded = expandedRideGroupIds.has(entry.id);
            const hasHiddenStations = entry.hiddenStations.length > 0;

            return (
              <div className="route-timeline-entry" key={entry.id}>
                <div className="route-move route-move--ride">
                  <Train aria-hidden="true" size={14} />
                  <div className="route-ride-panel">
                    <button
                      className="route-ride-toggle"
                      disabled={!hasHiddenStations}
                      type="button"
                      aria-expanded={hasHiddenStations ? isExpanded : undefined}
                      onClick={() => toggleRideGroup(entry.id)}
                    >
                      <span
                        className="route-ride-dot"
                        style={{ backgroundColor: LINE_COLOR_BY_LINE[entry.line] }}
                      />
                      <span className="route-ride-title">
                        {entry.stationCount}개 역 이동
                      </span>
                      <span className="route-ride-meta">
                        {formatApproxMinutes(entry.minutes)} ·{" "}
                        {entry.distanceKm}km
                      </span>
                      {hasHiddenStations && (
                        <ChevronDown
                          className={
                            isExpanded
                              ? "route-ride-chevron route-ride-chevron--open"
                              : "route-ride-chevron"
                          }
                          aria-hidden="true"
                          size={15}
                        />
                      )}
                    </button>

                    {hasHiddenStations && isExpanded && (
                      <ul className="route-ride-stations">
                        {entry.hiddenStations.map((station) => (
                          <li key={station.nodeId}>
                            <time>{station.clockTime}</time>
                            <span>{station.stationName}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              </div>
            );
          }

          return (
            <div className="route-timeline-entry" key={entry.id}>
              <RouteNode
                clockTime={entry.step.clockTime}
                description={entry.step.description}
                isEnd={entry.isEnd}
                isStart={entry.isStart}
                step={entry.step}
                title={entry.step.title}
              />
            </div>
          );
        })}
      </div>
    </section>
  );
}
