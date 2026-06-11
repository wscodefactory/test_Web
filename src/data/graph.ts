import routeEdgeWeightsData from "./routeEdgeWeights.generated.json";
import { type SubwayLine } from "./stations";
import type {
  RouteEdge,
  RouteNode,
  StationNodeId,
  SubwayGraph,
} from "../types/route";

const TRANSFER_MINUTES = 4;

interface RouteEdgeWeight {
  distanceKm: number;
  durationSeconds: number;
  fromLine: SubwayLine;
  fromStation: string;
  kind: "ride";
  minutes: number;
  toLine: SubwayLine;
  toStation: string;
}

interface RouteEdgeWeightDataset {
  edges: RouteEdgeWeight[];
}

const ROUTE_EDGE_WEIGHTS = (routeEdgeWeightsData as RouteEdgeWeightDataset)
  .edges;

export const makeStationNodeId = (
  line: SubwayLine,
  stationName: string,
): StationNodeId => `${line}:${stationName}`;

const addStationOption = (
  stationsByLine: Partial<Record<SubwayLine, string[]>>,
  line: SubwayLine,
  stationName: string,
) => {
  const stations = stationsByLine[line] ?? [];

  if (stations.includes(stationName)) {
    return;
  }

  stationsByLine[line] = [...stations, stationName];
};

const createStationsByLine = (): Partial<Record<SubwayLine, string[]>> => {
  const stationsByLine: Partial<Record<SubwayLine, string[]>> = {};

  ROUTE_EDGE_WEIGHTS.forEach((edge) => {
    addStationOption(stationsByLine, edge.fromLine, edge.fromStation);
    addStationOption(stationsByLine, edge.toLine, edge.toStation);
  });

  return stationsByLine;
};

export const ROUTE_STATIONS_BY_LINE = createStationsByLine();

export const ROUTE_LINES = Object.keys(ROUTE_STATIONS_BY_LINE) as SubwayLine[];

const createNodes = (): Record<StationNodeId, RouteNode> => {
  const nodes: Record<StationNodeId, RouteNode> = {};

  ROUTE_LINES.forEach((line) => {
    ROUTE_STATIONS_BY_LINE[line]?.forEach((stationName) => {
      const id = makeStationNodeId(line, stationName);
      nodes[id] = {
        id,
        line,
        stationName,
      };
    });
  });

  return nodes;
};

const addDirectedEdge = (
  graph: SubwayGraph,
  from: StationNodeId,
  edge: RouteEdge,
) => {
  graph[from] = graph[from] ?? [];
  graph[from].push(edge);
};

const addRideEdge = (
  graph: SubwayGraph,
  edgeWeight: RouteEdgeWeight,
) => {
  const from = makeStationNodeId(edgeWeight.fromLine, edgeWeight.fromStation);
  const to = makeStationNodeId(edgeWeight.toLine, edgeWeight.toStation);
  const minutes = edgeWeight.durationSeconds / 60;

  addDirectedEdge(graph, from, {
    to,
    minutes,
    distanceKm: edgeWeight.distanceKm,
    type: "ride",
    line: edgeWeight.toLine,
  });
  addDirectedEdge(graph, to, {
    to: from,
    minutes,
    distanceKm: edgeWeight.distanceKm,
    type: "ride",
    line: edgeWeight.fromLine,
  });
};

const addTransferEdge = (
  graph: SubwayGraph,
  fromNode: RouteNode,
  toNode: RouteNode,
) => {
  addDirectedEdge(graph, fromNode.id, {
    to: toNode.id,
    minutes: TRANSFER_MINUTES,
    distanceKm: 0,
    type: "transfer",
    line: toNode.line,
  });
  addDirectedEdge(graph, toNode.id, {
    to: fromNode.id,
    minutes: TRANSFER_MINUTES,
    distanceKm: 0,
    type: "transfer",
    line: fromNode.line,
  });
};

const connectTransfers = (
  graph: SubwayGraph,
  nodes: Record<StationNodeId, RouteNode>,
) => {
  const stationGroups = new Map<string, RouteNode[]>();

  Object.values(nodes).forEach((node) => {
    const group = stationGroups.get(node.stationName) ?? [];
    group.push(node);
    stationGroups.set(node.stationName, group);
  });

  stationGroups.forEach((sameNameNodes) => {
    sameNameNodes.forEach((fromNode, fromIndex) => {
      sameNameNodes.slice(fromIndex + 1).forEach((toNode) => {
        addTransferEdge(graph, fromNode, toNode);
      });
    });
  });
};

export const STATION_NODE_BY_ID = createNodes();

export const SUBWAY_GRAPH: SubwayGraph = Object.keys(
  STATION_NODE_BY_ID,
).reduce<SubwayGraph>((graph, nodeId) => {
  graph[nodeId] = [];
  return graph;
}, {});

ROUTE_EDGE_WEIGHTS.forEach((edgeWeight) =>
  addRideEdge(SUBWAY_GRAPH, edgeWeight),
);
connectTransfers(SUBWAY_GRAPH, STATION_NODE_BY_ID);
