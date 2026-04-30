import { useEffect, useRef, useCallback } from "react";
import {
  forceSimulation,
  forceLink,
  forceManyBody,
  forceCenter,
  forceCollide,
  forceX,
  forceY,
  type Simulation,
  type SimulationNodeDatum,
  type SimulationLinkDatum,
} from "d3-force";
import {
  NODES,
  EDGES,
  SVG_WIDTH,
  SVG_HEIGHT,
  NODE_RADIUS,
  type NodePosition,
} from "./data";

interface SimNode extends SimulationNodeDatum {
  id: number;
}

interface SimLink extends SimulationLinkDatum<SimNode> {
  source: number | SimNode;
  target: number | SimNode;
}

export function useForceSimulation(
  running: boolean,
  reducedMotion: boolean,
  onTick: (positions: NodePosition[]) => void,
) {
  const simRef = useRef<Simulation<SimNode, SimLink> | null>(null);
  const rafRef = useRef<number | null>(null);
  const nodesRef = useRef<SimNode[]>([]);

  const onTickRef = useRef(onTick);
  onTickRef.current = onTick;

  const stopSim = useCallback(() => {
    if (simRef.current) {
      simRef.current.stop();
      simRef.current = null;
    }
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  }, []);

  const fixNode = useCallback((nodeId: number, x: number, y: number) => {
    const node = nodesRef.current.find((n) => n.id === nodeId);
    if (node && simRef.current) {
      node.fx = x;
      node.fy = y;
      simRef.current.alpha(0.3).restart();
    }
  }, []);

  const releaseNode = useCallback((nodeId: number) => {
    const node = nodesRef.current.find((n) => n.id === nodeId);
    if (node) {
      node.fx = null;
      node.fy = null;
    }
  }, []);

  useEffect(() => {
    if (!running) {
      stopSim();
      return;
    }

    const centerY = SVG_HEIGHT / 2 - 20;
    const centerX = SVG_WIDTH / 2;

    const simNodes: SimNode[] = NODES.map((n) => ({
      id: n.id,
      x: (n.linearXPercent / 100) * SVG_WIDTH,
      y: SVG_HEIGHT / 2 - 10,
    }));
    nodesRef.current = simNodes;

    const simLinks: SimLink[] = EDGES.map((e) => ({
      source: e.source,
      target: e.target,
    }));

    const keepInBounds = () => {
      const padX = NODE_RADIUS + 10;
      const padTop = NODE_RADIUS + 10;
      const padBottom = NODE_RADIUS + 40;
      for (const node of simNodes) {
        if (node.x !== undefined) node.x = Math.max(padX, Math.min(SVG_WIDTH - padX, node.x));
        if (node.y !== undefined) node.y = Math.max(padTop, Math.min(SVG_HEIGHT - padBottom, node.y));
      }
    };

    const sim = forceSimulation<SimNode>(simNodes)
      .alphaDecay(0.05)
      .velocityDecay(0.4)
      .force(
        "link",
        forceLink<SimNode, SimLink>(simLinks)
          .id((d) => d.id)
          .distance(155)
          .strength(0.35),
      )
      .force("charge", forceManyBody().strength(-450))
      .force("center", forceCenter(centerX, centerY))
      .force("collide", forceCollide(NODE_RADIUS + 30))
      .force("y", forceY(centerY).strength(0.04))
      .force("x", forceX(centerX).strength(0.02))
      .on("tick", () => {
        keepInBounds();
        if (reducedMotion) return;
        if (rafRef.current) return;
        rafRef.current = requestAnimationFrame(() => {
          rafRef.current = null;
          onTickRef.current(
            simNodes.map((n) => ({ id: n.id, x: n.x!, y: n.y! })),
          );
        });
      });

    simRef.current = sim;

    if (reducedMotion) {
      sim.stop();
      for (let i = 0; i < 300; i++) sim.tick();
      keepInBounds();
      onTickRef.current(
        simNodes.map((n) => ({ id: n.id, x: n.x!, y: n.y! })),
      );
    }

    return () => stopSim();
  }, [running, reducedMotion, stopSim]);

  return { simRef, fixNode, releaseNode };
}
