import { memo } from "react";
import {
  NODES,
  EDGES,
  NODE_RADIUS,
  SVG_WIDTH,
  SVG_HEIGHT,
  type NodePosition,
  type AnimationPhase,
  type StoryEdge,
  isEdgeConnectedToNode,
  getConnectedNodeIds,
} from "./data";

const HIT_RADIUS = 28;
const ARROW_GAP = NODE_RADIUS + 6;

interface StoryGraphSVGProps {
  nodePositions: NodePosition[];
  animPhase: AnimationPhase;
  selectedNodeId: number | null;
  mode: "linear" | "graph";
  reducedMotion: boolean;
  viewBoxY: number;
  viewBoxH: number;
  onNodeClick: (id: number) => void;
  onNodePointerDown: (e: React.PointerEvent, id: number) => void;
  onPointerMove: (e: React.PointerEvent) => void;
  onPointerUp: (e: React.PointerEvent) => void;
  onBackgroundClick: () => void;
  onNodeKeyDown: (e: React.KeyboardEvent, id: number) => void;
  svgRef: React.RefObject<SVGSVGElement | null>;
}

function getArrowOpacity(phase: AnimationPhase, mode: string): number {
  if (mode === "graph") return 0;
  if (phase === "linear-exit") return 0;
  if (phase === "linear-enter" || phase === "idle") return 1;
  return 0;
}

function getEdgeOpacity(
  phase: AnimationPhase,
  mode: string,
  selectedNodeId: number | null,
  edge: Pick<StoryEdge, "source" | "target">,
): number {
  if (mode === "linear") return 0;
  if (phase === "graph-exit-edges" || phase === "graph-exit-sim") return 0;
  if (phase === "graph-enter-sim" || phase === "linear-exit") return 0;

  const visible =
    phase === "graph-enter-edges" ||
    phase === "graph-enter-ui" ||
    phase === "idle";
  if (!visible) return 0;

  if (selectedNodeId !== null) {
    return isEdgeConnectedToNode(edge, selectedNodeId) ? 1 : 0.06;
  }
  return 1;
}

function getEdgeStrokeWidth(
  selectedNodeId: number | null,
  edge: Pick<StoryEdge, "source" | "target">,
): number {
  if (selectedNodeId === null) return 2;
  return isEdgeConnectedToNode(edge, selectedNodeId) ? 3 : 2;
}

export const StoryGraphSVG = memo(function StoryGraphSVG({
  nodePositions,
  animPhase,
  selectedNodeId,
  mode,
  reducedMotion,
  viewBoxY,
  viewBoxH,
  onNodeClick,
  onNodePointerDown,
  onPointerMove,
  onPointerUp,
  onBackgroundClick,
  onNodeKeyDown,
  svgRef,
}: StoryGraphSVGProps) {
  const connectedIds =
    selectedNodeId !== null ? getConnectedNodeIds(selectedNodeId) : null;

  const posMap = new Map(nodePositions.map((p) => [p.id, p]));

  const arrowOpacity = getArrowOpacity(animPhase, mode);

  const isReturning = animPhase === "graph-exit-sim" || animPhase === "linear-enter";

  function getNodeTransition(nodeIndex: number): string {
    if (reducedMotion) return "none";
    if (!isReturning) return "none";
    const delay = nodeIndex * 60;
    return `transform 500ms cubic-bezier(0.4, 0, 0.2, 1) ${delay}ms`;
  }

  return (
    <svg
      ref={svgRef}
      viewBox={`0 ${viewBoxY} ${SVG_WIDTH} ${viewBoxH}`}
      role="img"
      aria-label="Interactive visualization of chapter connections in a story. Toggle between linear reading order and a web of narrative connections."
      style={{
        width: "100%",
        height: "auto",
        display: "block",
        touchAction: "none",
        userSelect: "none",
      }}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
    >
      <title>Story structure: linear vs. graph</title>

      <defs>
        <marker
          id="sg-arrow"
          viewBox="0 0 10 10"
          refX="10"
          refY="5"
          markerWidth="8"
          markerHeight="8"
          orient="auto-start-reverse"
        >
          <path
            d="M 0 2 L 10 5 L 0 8"
            fill="none"
            stroke="var(--color-foreground-muted)"
            strokeWidth="1.5"
          />
        </marker>
      </defs>

      {/* Background click target */}
      <rect
        x="0"
        y="0"
        width={SVG_WIDTH}
        height={SVG_HEIGHT}
        fill="transparent"
        onClick={onBackgroundClick}
      />

      {/* Graph-mode edges */}
      <g>
        {EDGES.map((edge, i) => {
          const sp = posMap.get(edge.source);
          const tp = posMap.get(edge.target);
          if (!sp || !tp) return null;
          const opacity = getEdgeOpacity(
            animPhase,
            mode,
            selectedNodeId,
            edge,
          );
          const sw = getEdgeStrokeWidth(selectedNodeId, edge);
          const delay =
            animPhase === "graph-enter-edges" && !reducedMotion
              ? `${i * 50}ms`
              : "0ms";
          return (
            <line
              key={`edge-${i}`}
              x1={sp.x}
              y1={sp.y}
              x2={tp.x}
              y2={tp.y}
              stroke={edge.color}
              strokeWidth={sw}
              strokeLinecap="round"
              opacity={opacity}
              style={{
                transition: reducedMotion
                  ? "none"
                  : `opacity 150ms ease ${delay}, stroke-width 150ms ease`,
              }}
            />
          );
        })}
      </g>

      {/* Linear-mode arrows */}
      <g>
        {NODES.slice(0, -1).map((node, i) => {
          const curr = posMap.get(node.id);
          const next = posMap.get(NODES[i + 1].id);
          if (!curr || !next) return null;
          return (
            <line
              key={`arrow-${i}`}
              x1={curr.x + ARROW_GAP}
              y1={curr.y}
              x2={next.x - ARROW_GAP}
              y2={next.y}
              stroke="var(--color-foreground-muted)"
              strokeWidth="1.5"
              markerEnd="url(#sg-arrow)"
              opacity={arrowOpacity}
              style={{
                transition: reducedMotion ? "none" : "opacity 350ms ease",
              }}
            />
          );
        })}
      </g>

      {/* Nodes */}
      <g>
        {NODES.map((node) => {
          const pos = posMap.get(node.id);
          if (!pos) return null;
          const isSelected = selectedNodeId === node.id;
          const isDimmed =
            connectedIds !== null && !connectedIds.has(node.id);
          const nodeOpacity = isDimmed ? 0.2 : 1;

          return (
            <g
              key={node.id}
              style={{
                transform: `translate(${pos.x}px, ${pos.y}px)`,
                transition: getNodeTransition(node.id),
                cursor: "pointer",
              }}
              role="button"
              tabIndex={0}
              aria-label={`${node.label}${isSelected ? ", selected" : ""}`}
              onClick={(e) => {
                e.stopPropagation();
                onNodeClick(node.id);
              }}
              onPointerDown={(e) => onNodePointerDown(e, node.id)}
              onKeyDown={(e) => onNodeKeyDown(e, node.id)}
            >
              {/* Invisible hit target */}
              <circle r={HIT_RADIUS} fill="transparent" />
              <circle
                r={NODE_RADIUS}
                fill="var(--color-node-fill)"
                stroke={
                  isSelected
                    ? "var(--color-accent)"
                    : "var(--color-node-stroke)"
                }
                strokeWidth={isSelected ? 3 : 2}
                opacity={nodeOpacity}
                style={{
                  transition: reducedMotion
                    ? "none"
                    : "opacity 200ms ease, stroke 200ms ease, stroke-width 200ms ease",
                }}
              />
              <text
                y={NODE_RADIUS + 16}
                textAnchor="middle"
                fontSize="12"
                fontFamily="var(--font-sans)"
                fill="var(--color-foreground-muted)"
                opacity={nodeOpacity}
                style={{
                  transition: reducedMotion ? "none" : "opacity 200ms ease",
                  pointerEvents: "none",
                }}
              >
                {node.label}
              </text>
            </g>
          );
        })}
      </g>
    </svg>
  );
});
