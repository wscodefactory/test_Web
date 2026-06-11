import type {
  RouteEdge,
  RouteNode,
  RouteResult,
  StationNodeId,
  SubwayGraph,
} from "../types/route";

const getClosestUnvisitedNode = (
  unvisited: Set<StationNodeId>,
  distances: Map<StationNodeId, number>,
): StationNodeId | null => {
  let closestNode: StationNodeId | null = null;
  let closestDistance = Infinity;

  unvisited.forEach((nodeId) => {
    const distance = distances.get(nodeId) ?? Infinity;

    if (distance < closestDistance) {
      closestDistance = distance;
      closestNode = nodeId;
    }
  });

  return closestNode;
};

export const findShortestRoute = (
  graph: SubwayGraph,
  nodes: Record<StationNodeId, RouteNode>,
  startNodeId: StationNodeId,
  endNodeId: StationNodeId,
): RouteResult | null => {
  if (!graph[startNodeId] || !graph[endNodeId]) {
    return null;
  }

  const nodeIds = Object.keys(graph);
  const distances = new Map<StationNodeId, number>();
  const previousNode = new Map<StationNodeId, StationNodeId>();
  const previousEdge = new Map<StationNodeId, RouteEdge>();
  const unvisited = new Set<StationNodeId>(nodeIds);

  nodeIds.forEach((nodeId) => distances.set(nodeId, Infinity));
  distances.set(startNodeId, 0);

  while (unvisited.size > 0) {
    const currentNodeId = getClosestUnvisitedNode(unvisited, distances);

    if (!currentNodeId) {
      break;
    }

    const currentDistance = distances.get(currentNodeId) ?? Infinity;

    if (currentDistance === Infinity) {
      break;
    }

    unvisited.delete(currentNodeId);

    if (currentNodeId === endNodeId) {
      break;
    }

    graph[currentNodeId].forEach((edge) => {
      if (!unvisited.has(edge.to)) {
        return;
      }

      const nextDistance = currentDistance + edge.minutes;
      const knownDistance = distances.get(edge.to) ?? Infinity;

      if (nextDistance < knownDistance) {
        distances.set(edge.to, nextDistance);
        previousNode.set(edge.to, currentNodeId);
        previousEdge.set(edge.to, edge);
      }
    });
  }

  if (startNodeId !== endNodeId && !previousNode.has(endNodeId)) {
    return null;
  }

  const orderedNodeIds: StationNodeId[] = [endNodeId];
  let cursor = endNodeId;

  while (cursor !== startNodeId) {
    const parent = previousNode.get(cursor);

    if (!parent) {
      return null;
    }

    orderedNodeIds.unshift(parent);
    cursor = parent;
  }

  const steps = orderedNodeIds.map((nodeId, index) => {
    const node = nodes[nodeId];
    const edge = previousEdge.get(nodeId);

    return {
      nodeId,
      line: node.line,
      stationName: node.stationName,
      minutesFromPrevious: index === 0 ? 0 : edge?.minutes ?? 0,
      distanceFromPreviousKm: index === 0 ? 0 : edge?.distanceKm ?? 0,
      edgeTypeFromPrevious: index === 0 ? null : edge?.type ?? null,
    };
  });

  const totalDistanceKm = steps.reduce(
    (total, step) => total + step.distanceFromPreviousKm,
    0,
  );

  return {
    steps,
    totalMinutes: distances.get(endNodeId) ?? 0,
    transferCount: steps.filter(
      (step) => step.edgeTypeFromPrevious === "transfer",
    ).length,
    totalDistanceKm: Number(totalDistanceKm.toFixed(1)),
    stationCount: steps.length,
  };
};
