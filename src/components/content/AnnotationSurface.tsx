"use client";

import {
  useEffect,
  useId,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
  type SyntheticEvent,
} from "react";
import {
  annotationPath,
  createAnnotationMarkId,
  DEFAULT_ANNOTATION_ARTBOARD,
  type AnnotationMark,
  type AnnotationPoint,
  type AnnotationTool,
  type TextAnnotation,
} from "./annotation-model";

const DEFAULT_INK = "#43a6f6";

interface AnnotationSurfaceProps {
  children: ReactNode;
  label: string;
  marks: AnnotationMark[];
  artboard?: { width: number; height: number };
  className?: string;
  contentBounds?: { x: number; y: number; width: number; height: number };
  showBackground?: boolean;
  tool?: AnnotationTool;
  penColor?: string;
  textColor?: string;
  selectedMarkId?: string | null;
  onSelectMark?: (id: string | null) => void;
  onChange?: (marks: AnnotationMark[]) => void;
}

interface ActiveStroke {
  pointerId: number;
  type: "ink" | "arrow";
  points: AnnotationPoint[];
  color?: string;
}

interface ActiveTextMove {
  pointerId: number;
  id: string;
  start: AnnotationPoint;
  origin: AnnotationPoint;
  position: AnnotationPoint;
  moved: boolean;
}

interface PendingText {
  id?: string;
  point: AnnotationPoint;
  value: string;
  width: number;
  color: string;
}

function pointFromClient(
  clientX: number,
  clientY: number,
  element: Element,
  artboard: { width: number; height: number },
): AnnotationPoint {
  const bounds = element.getBoundingClientRect();
  return {
    x: Math.max(0, Math.min(artboard.width, ((clientX - bounds.left) / bounds.width) * artboard.width)),
    y: Math.max(0, Math.min(artboard.height, ((clientY - bounds.top) / bounds.height) * artboard.height)),
  };
}

function markColor(mark: AnnotationMark): string {
  return mark.color ?? DEFAULT_INK;
}

function textHeight(mark: TextAnnotation): number {
  const size = mark.size ?? 34;
  const width = mark.width ?? 310;
  const charactersPerLine = Math.max(1, Math.floor(width / (size * 0.58)));
  const visualLines = mark.text.split("\n").reduce(
    (total, line) => total + Math.max(1, Math.ceil(line.length / charactersPerLine)),
    0,
  );

  return Math.max(size * 1.5, visualLines * size * 1.16 + 12);
}

function markBottom(mark: AnnotationMark): number {
  if (mark.type === "text") {
    const height = textHeight(mark);
    const width = mark.width ?? 310;
    const rotation = ((mark.rotation ?? 0) * Math.PI) / 180;
    const rotatedHeight = Math.abs(Math.sin(rotation)) * width + Math.abs(Math.cos(rotation)) * height;
    return mark.y + height / 2 + rotatedHeight / 2;
  }

  const pointBottom = mark.points.reduce((bottom, point) => Math.max(bottom, point.y), 0);
  return pointBottom + (mark.width ?? (mark.type === "arrow" ? 4 : 5)) / 2 + (mark.type === "arrow" ? 16 : 0);
}

export function AnnotationSurface({
  children,
  label,
  marks,
  artboard = DEFAULT_ANNOTATION_ARTBOARD,
  className = "",
  contentBounds,
  showBackground = true,
  tool,
  penColor = DEFAULT_INK,
  textColor = DEFAULT_INK,
  selectedMarkId,
  onSelectMark,
  onChange,
}: AnnotationSurfaceProps) {
  const markerId = `annotation-arrow-${useId().replaceAll(":", "")}`;
  const overlayRef = useRef<SVGSVGElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [activeStroke, setActiveStroke] = useState<ActiveStroke | null>(null);
  const [activeTextMove, setActiveTextMove] = useState<ActiveTextMove | null>(null);
  const [pendingText, setPendingText] = useState<PendingText | null>(null);
  const [renderedContentBottom, setRenderedContentBottom] = useState<number | null>(null);
  const editing = Boolean(tool && onChange);
  const resolvedContentBounds = contentBounds ?? {
    x: artboard.width * 0.245,
    y: artboard.height * 0.074,
    width: artboard.width * 0.71,
    height: artboard.height * 0.852,
  };
  const marksBottom = marks.reduce((bottom, mark) => Math.max(bottom, markBottom(mark)), 0);
  const presentationHeight = editing || renderedContentBottom === null
    ? artboard.height
    : Math.min(
      artboard.height,
      Math.max(artboard.height * 0.4, renderedContentBottom, marksBottom) + 36,
    );

  useEffect(() => {
    if (editing) return;

    const content = contentRef.current;
    if (!content) return;

    const measure = () => {
      const svg = content.querySelector<SVGSVGElement>("svg");
      const viewBox = svg?.viewBox.baseVal;
      if (!viewBox || viewBox.width <= 0 || viewBox.height <= 0) return;

      const scale = Math.min(
        resolvedContentBounds.width / viewBox.width,
        resolvedContentBounds.height / viewBox.height,
      );
      const renderedHeight = viewBox.height * scale;
      const nextBottom = resolvedContentBounds.y + (resolvedContentBounds.height - renderedHeight) / 2 + renderedHeight;
      setRenderedContentBottom((current) => current !== null && Math.abs(current - nextBottom) < 0.5 ? current : nextBottom);
    };

    const animationFrame = window.requestAnimationFrame(measure);
    const mutationObserver = new MutationObserver(measure);
    mutationObserver.observe(content, { attributes: true, childList: true, subtree: true });
    const resizeObserver = new ResizeObserver(measure);
    resizeObserver.observe(content);

    return () => {
      window.cancelAnimationFrame(animationFrame);
      mutationObserver.disconnect();
      resizeObserver.disconnect();
    };
  }, [
    editing,
    resolvedContentBounds.height,
    resolvedContentBounds.width,
    resolvedContentBounds.y,
  ]);

  const commitText = () => {
    if (!pendingText || !onChange) return;
    const text = pendingText.value.trim();
    if (pendingText.id) {
      if (text) {
        onChange(marks.map((mark) => (
          mark.id === pendingText.id && mark.type === "text"
            ? { ...mark, text }
            : mark
        )));
      } else {
        onChange(marks.filter((mark) => mark.id !== pendingText.id));
        onSelectMark?.(null);
      }
    } else if (text) {
      const id = createAnnotationMarkId();
      onChange([
        ...marks,
        {
          id,
          type: "text",
          x: pendingText.point.x,
          y: pendingText.point.y,
          text,
          color: pendingText.color,
          size: 34,
          width: pendingText.width,
          rotation: 0,
        },
      ]);
      onSelectMark?.(id);
    }
    setPendingText(null);
  };

  const beginTextEditing = (mark: TextAnnotation) => {
    onSelectMark?.(mark.id);
    setPendingText({
      id: mark.id,
      point: { x: mark.x, y: mark.y },
      value: mark.text,
      width: mark.width ?? 310,
      color: markColor(mark),
    });
  };

  const handlePointerDown = (event: ReactPointerEvent<SVGSVGElement>) => {
    if (!editing || !overlayRef.current) return;

    if (tool === "erase") return;
    const point = pointFromClient(event.clientX, event.clientY, overlayRef.current, artboard);

    if (tool === "select") {
      onSelectMark?.(null);
      return;
    }

    if (tool === "text") {
      event.preventDefault();
      setPendingText({ point, value: "", width: 310, color: textColor });
      return;
    }

    event.currentTarget.setPointerCapture(event.pointerId);
    setActiveStroke({
      pointerId: event.pointerId,
      type: tool === "arrow" ? "arrow" : "ink",
      points: [point],
      color: tool === "pen" ? penColor : undefined,
    });
  };

  const handlePointerMove = (event: ReactPointerEvent<SVGSVGElement>) => {
    if (!activeStroke || activeStroke.pointerId !== event.pointerId || !overlayRef.current) return;
    const point = pointFromClient(event.clientX, event.clientY, overlayRef.current, artboard);
    setActiveStroke((current) => {
      if (!current) return null;
      if (current.type === "arrow") return { ...current, points: [current.points[0], point] };
      const previous = current.points[current.points.length - 1];
      if (Math.hypot(point.x - previous.x, point.y - previous.y) < 2) return current;
      return { ...current, points: [...current.points, point] };
    });
  };

  const finishStroke = (event: ReactPointerEvent<SVGSVGElement>) => {
    if (!activeStroke || activeStroke.pointerId !== event.pointerId || !onChange) return;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    if (activeStroke.points.length > 1) {
      onChange([
        ...marks,
        {
          id: createAnnotationMarkId(),
          type: activeStroke.type,
          points: activeStroke.points,
          color: activeStroke.color,
          width: activeStroke.type === "arrow" ? 4 : 5,
        },
      ]);
    }
    setActiveStroke(null);
  };

  const removeMark = (event: SyntheticEvent<Element>, id: string) => {
    if (tool !== "erase" || !onChange) return;
    event.stopPropagation();
    onChange(marks.filter((mark) => mark.id !== id));
    if (selectedMarkId === id) onSelectMark?.(null);
  };

  const handleTextButton = (mark: TextAnnotation) => {
    if (tool === "erase") {
      if (!onChange) return;
      onChange(marks.filter((candidate) => candidate.id !== mark.id));
      if (selectedMarkId === mark.id) onSelectMark?.(null);
      return;
    }
    if (tool !== "select" && tool !== "text") return;
    beginTextEditing(mark);
  };

  const beginTextMove = (event: ReactPointerEvent<HTMLButtonElement>, mark: TextAnnotation) => {
    if (tool !== "select" || !overlayRef.current) return;
    event.preventDefault();
    event.stopPropagation();
    event.currentTarget.setPointerCapture(event.pointerId);
    onSelectMark?.(mark.id);
    const point = pointFromClient(event.clientX, event.clientY, overlayRef.current, artboard);
    setActiveTextMove({
      pointerId: event.pointerId,
      id: mark.id,
      start: point,
      origin: { x: mark.x, y: mark.y },
      position: { x: mark.x, y: mark.y },
      moved: false,
    });
  };

  const moveText = (event: ReactPointerEvent<HTMLButtonElement>, mark: TextAnnotation) => {
    if (!activeTextMove || activeTextMove.id !== mark.id || activeTextMove.pointerId !== event.pointerId || !overlayRef.current) return;
    event.preventDefault();
    const point = pointFromClient(event.clientX, event.clientY, overlayRef.current, artboard);
    const width = mark.width ?? 310;
    const height = textHeight(mark);
    const position = {
      x: Math.max(0, Math.min(artboard.width - width, activeTextMove.origin.x + point.x - activeTextMove.start.x)),
      y: Math.max(0, Math.min(artboard.height - height, activeTextMove.origin.y + point.y - activeTextMove.start.y)),
    };
    setActiveTextMove((current) => current ? {
      ...current,
      position,
      moved: current.moved || Math.hypot(point.x - current.start.x, point.y - current.start.y) >= 3,
    } : null);
  };

  const finishTextMove = (event: ReactPointerEvent<HTMLButtonElement>, mark: TextAnnotation) => {
    if (!activeTextMove || activeTextMove.id !== mark.id || activeTextMove.pointerId !== event.pointerId) return;
    event.preventDefault();
    event.stopPropagation();
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    if (activeTextMove.moved && onChange) {
      onChange(marks.map((candidate) => (
        candidate.id === mark.id && candidate.type === "text"
          ? { ...candidate, ...activeTextMove.position }
          : candidate
      )));
    } else {
      beginTextEditing(mark);
    }
    setActiveTextMove(null);
  };

  const cancelTextMove = (event: ReactPointerEvent<HTMLButtonElement>, mark: TextAnnotation) => {
    if (!activeTextMove || activeTextMove.id !== mark.id || activeTextMove.pointerId !== event.pointerId) return;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    setActiveTextMove(null);
  };

  const renderedMarks = activeStroke
    ? [...marks, { id: "active-stroke", type: activeStroke.type, points: activeStroke.points, color: activeStroke.color } as AnnotationMark]
    : marks;

  return (
    <figure className={`my-6 overflow-x-auto ${className}`.trim()}>
      <div
        className={`relative min-w-[680px] overflow-hidden rounded-xl ${showBackground ? "border border-border bg-surface-terminal shadow-sm" : editing ? "border border-dashed border-border/70 bg-transparent" : "border border-transparent bg-transparent"}`}
        style={{ aspectRatio: `${artboard.width} / ${presentationHeight}` }}
        data-annotation-surface
        data-annotation-background={showBackground ? "filled" : "transparent"}
        data-annotation-presentation-height={Math.round(presentationHeight)}
      >
        <div
          ref={contentRef}
          className="absolute flex items-center justify-center overflow-hidden [&_.mermaid-diagram]:!my-0 [&_.mermaid-diagram]:h-full [&_.mermaid-diagram>div]:h-full [&_svg[id^='mermaid']]:!h-full [&_svg[id^='mermaid']]:!w-full"
          style={{
            left: `${(resolvedContentBounds.x / artboard.width) * 100}%`,
            top: `${(resolvedContentBounds.y / presentationHeight) * 100}%`,
            width: `${(resolvedContentBounds.width / artboard.width) * 100}%`,
            height: `${(resolvedContentBounds.height / presentationHeight) * 100}%`,
          }}
        >
          {children}
        </div>

        <svg
          ref={overlayRef}
          viewBox={`0 0 ${artboard.width} ${presentationHeight}`}
          className={`absolute inset-0 h-full w-full ${editing ? "touch-none" : "pointer-events-none"}`}
          aria-hidden="true"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={finishStroke}
          onPointerCancel={finishStroke}
        >
          <defs>
            <marker
              id={markerId}
              viewBox="0 0 12 12"
              refX="10"
              refY="6"
              markerWidth="8"
              markerHeight="8"
              orient="auto-start-reverse"
            >
              <path d="M 1 1 L 11 6 L 1 11 z" fill={DEFAULT_INK} />
            </marker>
          </defs>

          {renderedMarks.map((mark) => {
            if (mark.type === "text") {
              const position = activeTextMove?.id === mark.id ? activeTextMove.position : mark;
              const width = mark.width ?? 310;
              const height = textHeight(mark);
              const rotation = mark.rotation ?? 0;
              const isSelected = editing && selectedMarkId === mark.id;
              const isPending = pendingText?.id === mark.id;
              return (
                <g
                  key={mark.id}
                  transform={rotation ? `rotate(${rotation} ${position.x + width / 2} ${position.y + height / 2})` : undefined}
                >
                  {isSelected && !isPending && (
                    <rect
                      x={position.x - 8}
                      y={position.y - 8}
                      width={width + 16}
                      height={height + 16}
                      rx={8}
                      fill="none"
                      stroke={DEFAULT_INK}
                      strokeWidth={2}
                      strokeDasharray="8 6"
                      pointerEvents="none"
                    />
                  )}
                  <foreignObject
                    x={position.x}
                    y={position.y}
                    width={width}
                    height={height}
                    className={tool === "erase" ? "cursor-crosshair" : tool === "select" || tool === "text" ? "cursor-text" : undefined}
                    style={{ overflow: "visible", opacity: isPending ? 0 : 1 }}
                  >
                    <div
                      style={{
                        color: markColor(mark),
                        fontFamily: '"Bradley Hand", "Comic Sans MS", cursive',
                        fontSize: `${mark.size ?? 34}px`,
                        fontWeight: 600,
                        lineHeight: 1.12,
                        whiteSpace: "pre-wrap",
                      }}
                    >
                      {mark.text}
                    </div>
                  </foreignObject>
                </g>
              );
            }

            const path = annotationPath(mark.points);
            const isArrow = mark.type === "arrow";
            return (
              <g key={mark.id} onPointerDown={(event) => removeMark(event, mark.id)}>
                <path
                  d={path}
                  fill="none"
                  stroke={markColor(mark)}
                  strokeWidth={mark.width ?? (isArrow ? 4 : 5)}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  markerEnd={isArrow ? `url(#${markerId})` : undefined}
                />
                {tool === "erase" && mark.id !== "active-stroke" && (
                  <path
                    d={path}
                    fill="none"
                    stroke="transparent"
                    strokeWidth={24}
                    strokeLinecap="round"
                    className="cursor-crosshair"
                  />
                )}
              </g>
            );
          })}
        </svg>

        {editing && (tool === "select" || tool === "text" || tool === "erase") && marks.map((mark) => {
          if (mark.type !== "text" || pendingText?.id === mark.id) return null;
          const position = activeTextMove?.id === mark.id ? activeTextMove.position : mark;
          const width = mark.width ?? 310;
          const height = textHeight(mark);
          return (
            <button
              key={`text-hit-${mark.id}`}
              type="button"
              aria-label={`${tool === "erase" ? "Remove" : tool === "select" ? "Move or edit" : "Edit"} annotation text: ${mark.text.replaceAll("\n", " ")}`}
              onClick={tool === "select" ? undefined : () => handleTextButton(mark)}
              onPointerDown={tool === "select" ? (event) => beginTextMove(event, mark) : undefined}
              onPointerMove={tool === "select" ? (event) => moveText(event, mark) : undefined}
              onPointerUp={tool === "select" ? (event) => finishTextMove(event, mark) : undefined}
              onPointerCancel={tool === "select" ? (event) => cancelTextMove(event, mark) : undefined}
              onKeyDown={tool === "select" ? (event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  beginTextEditing(mark);
                }
              } : undefined}
              className={`absolute z-[5] rounded outline-none focus-visible:ring-2 focus-visible:ring-accent ${tool === "erase" ? "cursor-crosshair" : tool === "select" ? "touch-none cursor-move" : "cursor-text"}`}
              style={{
                left: `${(position.x / artboard.width) * 100}%`,
                top: `${(position.y / presentationHeight) * 100}%`,
                width: `${(width / artboard.width) * 100}%`,
                height: `${(height / presentationHeight) * 100}%`,
                transform: mark.rotation ? `rotate(${mark.rotation}deg)` : undefined,
                backgroundColor: "transparent",
              }}
            />
          );
        })}

        {pendingText && (
          <div
            className="absolute z-10"
            style={{
              left: `${(pendingText.point.x / artboard.width) * 100}%`,
              top: `${(pendingText.point.y / presentationHeight) * 100}%`,
              width: `${(pendingText.width / artboard.width) * 100}%`,
            }}
          >
            <textarea
              autoFocus
              aria-label="Annotation text"
              rows={3}
              value={pendingText.value}
              onChange={(event) => setPendingText({ ...pendingText, value: event.target.value })}
              onBlur={commitText}
              onKeyDown={(event) => {
                if (event.key === "Escape") {
                  event.preventDefault();
                  setPendingText(null);
                }
                if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) {
                  event.preventDefault();
                  commitText();
                }
              }}
              className="w-full resize-y rounded-md border border-accent bg-surface-bg/95 p-2 text-sm shadow-xl outline-none"
              style={{ color: pendingText.color }}
              placeholder="Type the note…"
            />
            <p className="mt-1 rounded bg-surface-bg/90 px-1.5 py-1 text-[10px] leading-tight text-foreground-muted shadow">
              Enter adds a line break · Cmd/Ctrl+Enter saves
            </p>
          </div>
        )}
      </div>
      <figcaption className="sr-only">{label}</figcaption>
    </figure>
  );
}
