import { LINE_COLOR_BY_LINE } from "../../data/stations";
import type { RouteStep } from "../../types/route";

interface RouteNodeProps {
  clockTime: string;
  description: string;
  isEnd: boolean;
  isStart: boolean;
  title: string;
  step: RouteStep;
}

export default function RouteNode({
  clockTime,
  description,
  isEnd,
  isStart,
  step,
  title,
}: RouteNodeProps) {
  const color = LINE_COLOR_BY_LINE[step.line];

  return (
    <div className="route-node">
      <time className={isStart || isEnd ? "route-node-time route-node-time--edge" : "route-node-time"}>
        {clockTime}
      </time>
      <span
        className={
          isStart || isEnd
            ? "route-node-marker route-node-marker--edge"
            : "route-node-marker"
        }
        style={{
          borderColor: color,
          backgroundColor: isStart || isEnd ? "#ffffff" : color,
        }}
      />
      <div className="route-node-main">
        <strong>{title}</strong>
        <span>{description}</span>
      </div>
      <span className="route-node-line">
        <span style={{ backgroundColor: color }} />
        {step.line}
      </span>
    </div>
  );
}
