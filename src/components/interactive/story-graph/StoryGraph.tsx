"use client";

import { useState, useCallback, useRef, useEffect, useSyncExternalStore } from "react";
import { StoryGraphSVG } from "./StoryGraphSVG";
import { useForceSimulation } from "./useForceSimulation";
import {
  NODES,
  EDGES,
  CONNECTION_TYPES,
  SVG_HEIGHT,
  computeLinearPositions,
  getEdgesForNode,
  getConnectedNodeIds,
  type ViewMode,
  type AnimationPhase,
  type NodePosition,
} from "./data";

const DRAG_THRESHOLD = 5;
const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

function subscribeToReducedMotion(onStoreChange: () => void) {
  const mq = window.matchMedia(REDUCED_MOTION_QUERY);
  mq.addEventListener("change", onStoreChange);
  return () => mq.removeEventListener("change", onStoreChange);
}

function getReducedMotionSnapshot() {
  return window.matchMedia(REDUCED_MOTION_QUERY).matches;
}

export function StoryGraph() {
  const [mode, setMode] = useState<ViewMode>("linear");
  const [animPhase, setAnimPhase] = useState<AnimationPhase>("idle");
  const [selectedNodeId, setSelectedNodeId] = useState<number | null>(null);
  const [nodePositions, setNodePositions] = useState<NodePosition[]>(
    computeLinearPositions,
  );
  const reducedMotion = useSyncExternalStore(
    subscribeToReducedMotion,
    getReducedMotionSnapshot,
    () => false,
  );
  const [viewBox, setViewBox] = useState({ y: 130, h: 120 });
  const viewBoxRef = useRef({ y: 130, h: 120 });

  const svgRef = useRef<SVGSVGElement>(null);
  const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const dragState = useRef<{
    nodeId: number;
    startX: number;
    startY: number;
    dragged: boolean;
  } | null>(null);

  useEffect(() => {
    const targetY = mode === "linear" ? 130 : 0;
    const targetH = mode === "linear" ? 120 : SVG_HEIGHT;
    if (reducedMotion) {
      const raf = requestAnimationFrame(() => {
        viewBoxRef.current = { y: targetY, h: targetH };
        setViewBox({ y: targetY, h: targetH });
      });
      return () => cancelAnimationFrame(raf);
    }
    const startY = viewBoxRef.current.y;
    const startH = viewBoxRef.current.h;
    const duration = 400;
    let start: number | null = null;
    let raf: number;
    const step = (ts: number) => {
      if (!start) start = ts;
      const t = Math.min((ts - start) / duration, 1);
      const ease = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
      const y = startY + (targetY - startY) * ease;
      const h = startH + (targetH - startH) * ease;
      viewBoxRef.current = { y, h };
      setViewBox({ y, h });
      if (t < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [mode, reducedMotion]);

  const clearTimeouts = useCallback(() => {
    for (const t of timeoutsRef.current) clearTimeout(t);
    timeoutsRef.current = [];
  }, []);

  const schedule = useCallback(
    (fn: () => void, ms: number) => {
      const t = setTimeout(fn, ms);
      timeoutsRef.current.push(t);
      return t;
    },
    [],
  );

  const simRunning = mode === "graph" && animPhase !== "graph-exit-sim" && animPhase !== "graph-exit-edges";

  const { fixNode, releaseNode } = useForceSimulation(
    simRunning,
    reducedMotion,
    useCallback((positions: NodePosition[]) => {
      setNodePositions(positions);
    }, []),
  );

  const handleModeSwitch = useCallback(
    (newMode: ViewMode) => {
      if (newMode === mode || animPhase !== "idle") return;
      clearTimeouts();
      setSelectedNodeId(null);

      if (reducedMotion) {
        setMode(newMode);
        if (newMode === "linear") {
          setNodePositions(computeLinearPositions());
        }
        setAnimPhase("idle");
        return;
      }

      if (newMode === "graph") {
        setAnimPhase("linear-exit");
        schedule(() => {
          setMode("graph");
          setAnimPhase("graph-enter-sim");
          schedule(() => {
            setAnimPhase("graph-enter-edges");
            schedule(() => {
              setAnimPhase("graph-enter-ui");
              schedule(() => setAnimPhase("idle"), 150);
            }, EDGES.length * 50 + 150);
          }, 600);
        }, 200);
      } else {
        setAnimPhase("graph-exit-edges");
        schedule(() => {
          setAnimPhase("graph-exit-sim");
          setMode("linear");
          setNodePositions(computeLinearPositions());
          schedule(() => {
            setAnimPhase("linear-enter");
            schedule(() => setAnimPhase("idle"), 350);
          }, 850);
        }, 250);
      }
    },
    [mode, animPhase, reducedMotion, clearTimeouts, schedule],
  );

  const handleNodeClick = useCallback(
    (id: number) => {
      if (mode !== "graph") return;
      if (dragState.current?.dragged) return;
      setSelectedNodeId((prev) => (prev === id ? null : id));
    },
    [mode],
  );

  const handleBackgroundClick = useCallback(() => {
    setSelectedNodeId(null);
  }, []);

  const handleNodePointerDown = useCallback(
    (e: React.PointerEvent, id: number) => {
      if (mode !== "graph") return;
      e.preventDefault();
      (e.target as SVGElement).setPointerCapture(e.pointerId);
      dragState.current = {
        nodeId: id,
        startX: e.clientX,
        startY: e.clientY,
        dragged: false,
      };
    },
    [mode],
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!dragState.current) return;
      const dx = e.clientX - dragState.current.startX;
      const dy = e.clientY - dragState.current.startY;
      if (
        !dragState.current.dragged &&
        Math.abs(dx) + Math.abs(dy) < DRAG_THRESHOLD
      ) {
        return;
      }
      dragState.current.dragged = true;

      const svg = svgRef.current;
      if (!svg) return;
      const pt = svg.createSVGPoint();
      pt.x = e.clientX;
      pt.y = e.clientY;
      const ctm = svg.getScreenCTM();
      if (!ctm) return;
      const svgPt = pt.matrixTransform(ctm.inverse());

      fixNode(dragState.current.nodeId, svgPt.x, svgPt.y);
    },
    [fixNode],
  );

  const handlePointerUp = useCallback(
    () => {
      if (!dragState.current) return;
      if (dragState.current.dragged) {
        releaseNode(dragState.current.nodeId);
      }
      dragState.current = null;
    },
    [releaseNode],
  );

  const handleNodeKeyDown = useCallback(
    (e: React.KeyboardEvent, id: number) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        handleNodeClick(id);
      } else if (e.key === "Escape") {
        setSelectedNodeId(null);
      }
    },
    [handleNodeClick],
  );

  const showGraphUI =
    mode === "graph" &&
    (animPhase === "graph-enter-ui" ||
      animPhase === "idle" ||
      animPhase === "graph-exit-edges");

  const graphUIOpacity =
    showGraphUI && animPhase !== "graph-exit-edges" ? 1 : 0;

  const selectedNode =
    selectedNodeId !== null
      ? NODES.find((n) => n.id === selectedNodeId)
      : null;
  const selectedEdges =
    selectedNodeId !== null ? getEdgesForNode(selectedNodeId) : [];
  const connectedCount =
    selectedNodeId !== null ? getConnectedNodeIds(selectedNodeId).size - 1 : 0;

  return (
    <div className="my-8">
      {/* Toggle */}
      <div className="flex justify-center gap-2 mb-6">
        <button
          onClick={() => handleModeSwitch("linear")}
          aria-pressed={mode === "linear"}
          className="transition-colors"
          style={{
            padding: "8px 20px",
            fontSize: "14px",
            fontWeight: mode === "linear" ? 500 : 400,
            fontFamily: "var(--font-sans)",
            background:
              mode === "linear"
                ? "var(--color-surface-card)"
                : "transparent",
            color:
              mode === "linear"
                ? "var(--color-foreground)"
                : "var(--color-foreground-muted)",
            border: "0.5px solid var(--color-border)",
            borderRadius: "2px",
            cursor: "pointer",
          }}
        >
          How we read it
        </button>
        <button
          onClick={() => handleModeSwitch("graph")}
          aria-pressed={mode === "graph"}
          className="transition-colors"
          style={{
            padding: "8px 20px",
            fontSize: "14px",
            fontWeight: mode === "graph" ? 500 : 400,
            fontFamily: "var(--font-sans)",
            background:
              mode === "graph"
                ? "var(--color-surface-card)"
                : "transparent",
            color:
              mode === "graph"
                ? "var(--color-foreground)"
                : "var(--color-foreground-muted)",
            border: "0.5px solid var(--color-border)",
            borderRadius: "2px",
            cursor: "pointer",
          }}
        >
          How it actually works
        </button>
      </div>

      {/* SVG */}
      <StoryGraphSVG
        nodePositions={nodePositions}
        animPhase={animPhase}
        selectedNodeId={selectedNodeId}
        mode={mode}
        reducedMotion={reducedMotion}
        viewBoxY={viewBox.y}
        viewBoxH={viewBox.h}
        onNodeClick={handleNodeClick}
        onNodePointerDown={handleNodePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onBackgroundClick={handleBackgroundClick}
        onNodeKeyDown={handleNodeKeyDown}
        svgRef={svgRef}
      />

      {/* Legend */}
      <div
        className="flex flex-wrap justify-center gap-x-5 gap-y-1 mt-4"
        style={{
          opacity: graphUIOpacity,
          transition: reducedMotion ? "none" : "opacity 300ms ease",
          pointerEvents: graphUIOpacity === 0 ? "none" : "auto",
          height: graphUIOpacity === 0 && mode === "linear" ? 0 : "auto",
          overflow: "hidden",
        }}
      >
        {CONNECTION_TYPES.map((ct) => (
          <div key={ct.type} className="flex items-center gap-1.5">
            <div
              style={{
                width: 16,
                height: 2.5,
                backgroundColor: ct.color,
                borderRadius: 1,
              }}
            />
            <span
              style={{
                fontSize: "12px",
                color: "var(--color-foreground-muted)",
                fontFamily: "var(--font-sans)",
              }}
            >
              {ct.label}
            </span>
          </div>
        ))}
      </div>

      {/* Detail panel */}
      <div
        aria-live="polite"
        className="mt-4"
        style={{
          opacity: graphUIOpacity,
          transition: reducedMotion ? "none" : "opacity 300ms ease",
          pointerEvents: graphUIOpacity === 0 ? "none" : "auto",
          minHeight: mode === "graph" ? "72px" : 0,
          background: "var(--color-surface-card)",
          border: "1px solid var(--color-border)",
          borderRadius: "8px",
          padding: graphUIOpacity === 0 && mode === "linear" ? 0 : "12px 16px",
          overflow: "hidden",
          height: graphUIOpacity === 0 && mode === "linear" ? 0 : "auto",
        }}
      >
        {selectedNode ? (
          <div>
            <p
              style={{
                fontSize: "15px",
                fontWeight: 500,
                color: "var(--color-foreground)",
                margin: 0,
                marginBottom: "8px",
              }}
            >
              {selectedNode.label} connects to {connectedCount} other
              chapter{connectedCount !== 1 ? "s" : ""}
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              {selectedEdges.map((edge, i) => {
                const otherNodeId =
                  edge.source === selectedNodeId ? edge.target : edge.source;
                const otherNode = NODES.find((n) => n.id === otherNodeId);
                const typeInfo = CONNECTION_TYPES.find(
                  (ct) => ct.type === edge.type,
                );
                return (
                  <div
                    key={i}
                    style={{
                      display: "flex",
                      alignItems: "baseline",
                      gap: "8px",
                      fontSize: "13px",
                      lineHeight: 1.6,
                      color: "var(--color-foreground-muted)",
                    }}
                  >
                    <span
                      style={{
                        display: "inline-block",
                        width: "8px",
                        height: "8px",
                        borderRadius: "50%",
                        backgroundColor: typeInfo?.color ?? edge.color,
                        flexShrink: 0,
                        marginTop: "4px",
                      }}
                    />
                    <span>
                      <strong
                        style={{
                          color: "var(--color-foreground)",
                          fontWeight: 600,
                        }}
                      >
                        {otherNode?.label}
                      </strong>{" "}
                      — {edge.description}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <p
            style={{
              fontSize: "13px",
              fontStyle: "italic",
              color: "var(--color-foreground-muted)",
              margin: 0,
            }}
          >
            tap a chapter to see its connections
          </p>
        )}
      </div>
    </div>
  );
}
