export type ConnectionType = "character" | "clue" | "promise" | "consequence";
export type ViewMode = "linear" | "graph";
export type AnimationPhase =
  | "idle"
  | "linear-exit"
  | "graph-enter-sim"
  | "graph-enter-edges"
  | "graph-enter-ui"
  | "graph-exit-edges"
  | "graph-exit-sim"
  | "linear-enter";

export interface StoryNode {
  id: number;
  label: string;
  linearXPercent: number;
}

export interface StoryEdge {
  source: number;
  target: number;
  type: ConnectionType;
  color: string;
  description: string;
}

export interface ConnectionTypeInfo {
  type: ConnectionType;
  color: string;
  label: string;
}

export interface NodePosition {
  id: number;
  x: number;
  y: number;
}

export const CONNECTION_TYPES: ConnectionTypeInfo[] = [
  { type: "character", color: "var(--color-edge-character)", label: "Character" },
  { type: "clue", color: "var(--color-edge-clue)", label: "Clue" },
  { type: "promise", color: "var(--color-edge-promise)", label: "Promise" },
  { type: "consequence", color: "var(--color-edge-consequence)", label: "Consequence" },
];

export const NODES: StoryNode[] = [
  { id: 0, label: "Prologue", linearXPercent: 8 },
  { id: 1, label: "Ch 3", linearXPercent: 26 },
  { id: 2, label: "Ch 8", linearXPercent: 44 },
  { id: 3, label: "Ch 14", linearXPercent: 62 },
  { id: 4, label: "Ch 27", linearXPercent: 80 },
  { id: 5, label: "Ch 41", linearXPercent: 93 },
];

export const EDGE_COLOR_VAR: Record<ConnectionType, string> = {
  character: "var(--color-edge-character)",
  clue: "var(--color-edge-clue)",
  promise: "var(--color-edge-promise)",
  consequence: "var(--color-edge-consequence)",
};

export const EDGES: StoryEdge[] = [
  {
    source: 0,
    target: 2,
    type: "character",
    color: EDGE_COLOR_VAR.character,
    description:
      "Azim is introduced — he reappears at the academy",
  },
  {
    source: 0,
    target: 4,
    type: "clue",
    color: EDGE_COLOR_VAR.clue,
    description:
      "a necklace is mentioned in passing — it becomes a major reveal",
  },
  {
    source: 0,
    target: 3,
    type: "promise",
    color: EDGE_COLOR_VAR.promise,
    description:
      "Ghazi watches Reid get mugged and says nothing — the story owes the reader an answer",
  },
  {
    source: 1,
    target: 3,
    type: "consequence",
    color: EDGE_COLOR_VAR.consequence,
    description:
      "Reid lies during interrogation — the lie catches up to him",
  },
  {
    source: 0,
    target: 5,
    type: "character",
    color: EDGE_COLOR_VAR.character,
    description:
      "the obsidian gauntlet is described — the description must match when it returns",
  },
  {
    source: 1,
    target: 5,
    type: "promise",
    color: EDGE_COLOR_VAR.promise,
    description:
      "a line about the school — it becomes central to the plot",
  },
];

export const SVG_WIDTH = 680;
export const SVG_HEIGHT = 380;
export const NODE_RADIUS = 20;
export const NODE_Y = SVG_HEIGHT / 2 - 10;

export function computeLinearPositions(): NodePosition[] {
  return NODES.map((n) => ({
    id: n.id,
    x: (n.linearXPercent / 100) * SVG_WIDTH,
    y: NODE_Y,
  }));
}

export function getEdgesForNode(nodeId: number): StoryEdge[] {
  return EDGES.filter((e) => e.source === nodeId || e.target === nodeId);
}

export function getConnectedNodeIds(nodeId: number): Set<number> {
  const ids = new Set<number>();
  ids.add(nodeId);
  for (const e of EDGES) {
    if (e.source === nodeId) ids.add(e.target);
    if (e.target === nodeId) ids.add(e.source);
  }
  return ids;
}

export function isEdgeConnectedToNode(
  edge: Pick<StoryEdge, "source" | "target">,
  nodeId: number,
): boolean {
  return edge.source === nodeId || edge.target === nodeId;
}
