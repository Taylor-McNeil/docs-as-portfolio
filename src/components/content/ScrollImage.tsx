"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";

interface ScrollImageProps {
  src: string;
  alt: string;
  caption?: string;
  width?: number;
  height?: number;
}

export function ScrollImage({
  src,
  alt,
  caption,
  width = 600,
  height = 400,
}: ScrollImageProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const panStart = useRef({ x: 0, y: 0 });
  const panOffset = useRef({ x: 0, y: 0 });
  const imgRef = useRef<HTMLImageElement>(null);
  const lastTouchDistance = useRef<number | null>(null);

  const resetView = useCallback(() => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
    panOffset.current = { x: 0, y: 0 };
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
    resetView();
  }, [resetView]);

  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };

    document.addEventListener("keydown", handleEscape);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [isOpen, close]);

  // Wheel zoom
  const handleWheel = useCallback(
    (e: React.WheelEvent) => {
      e.preventDefault();
      const delta = e.deltaY > 0 ? -0.2 : 0.2;
      setZoom((prev) => {
        const next = Math.min(Math.max(prev + delta, 1), 5);
        if (next === 1) {
          setPan({ x: 0, y: 0 });
          panOffset.current = { x: 0, y: 0 };
        }
        return next;
      });
    },
    []
  );

  // Touch pinch zoom
  const getTouchDistance = (touches: React.TouchList) => {
    const [a, b] = [touches[0], touches[1]];
    return Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);
  };

  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      if (e.touches.length === 2) {
        lastTouchDistance.current = getTouchDistance(e.touches);
      } else if (e.touches.length === 1 && zoom > 1) {
        setIsPanning(true);
        panStart.current = {
          x: e.touches[0].clientX - panOffset.current.x,
          y: e.touches[0].clientY - panOffset.current.y,
        };
      }
    },
    [zoom]
  );

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (e.touches.length === 2 && lastTouchDistance.current !== null) {
        e.preventDefault();
        const dist = getTouchDistance(e.touches);
        const scale = dist / lastTouchDistance.current;
        lastTouchDistance.current = dist;
        setZoom((prev) => Math.min(Math.max(prev * scale, 1), 5));
      } else if (e.touches.length === 1 && isPanning && zoom > 1) {
        const x = e.touches[0].clientX - panStart.current.x;
        const y = e.touches[0].clientY - panStart.current.y;
        setPan({ x, y });
        panOffset.current = { x, y };
      }
    },
    [isPanning, zoom]
  );

  const handleTouchEnd = useCallback(() => {
    lastTouchDistance.current = null;
    setIsPanning(false);
    if (zoom <= 1) {
      resetView();
    }
  }, [zoom, resetView]);

  // Mouse pan
  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (zoom <= 1) return;
      e.preventDefault();
      setIsPanning(true);
      panStart.current = {
        x: e.clientX - panOffset.current.x,
        y: e.clientY - panOffset.current.y,
      };
    },
    [zoom]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!isPanning || zoom <= 1) return;
      const x = e.clientX - panStart.current.x;
      const y = e.clientY - panStart.current.y;
      setPan({ x, y });
      panOffset.current = { x, y };
    },
    [isPanning, zoom]
  );

  const handleMouseUp = useCallback(() => {
    setIsPanning(false);
  }, []);

  // Double-tap / double-click toggle
  const handleDoubleClick = useCallback(() => {
    if (zoom > 1) {
      resetView();
    } else {
      setZoom(2.5);
    }
  }, [zoom, resetView]);

  return (
    <>
      <figure className="m-0">
        <div
          onClick={() => setIsOpen(true)}
          className="border border-border rounded-lg overflow-hidden bg-surface-card cursor-zoom-in"
        >
          <Image
            src={src}
            alt={alt}
            width={width}
            height={height}
            className="w-full h-auto block"
          />
        </div>
        {caption && (
          <figcaption className="mt-3 text-sm text-foreground-muted text-center">
            {caption}
          </figcaption>
        )}
      </figure>

      {/* Lightbox with zoom + pan */}
      {isOpen && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) close();
          }}
          className="fixed inset-0 z-[9999] flex items-center justify-center p-8"
          style={{ background: "rgba(0, 0, 0, 0.9)" }}
        >
          <button
            onClick={close}
            className="absolute top-4 right-4 bg-transparent border-none text-white
              text-3xl cursor-pointer p-2 leading-none hover:opacity-70 transition-opacity"
            aria-label="Close"
          >
            &times;
          </button>

          {/* Zoom hint */}
          {zoom === 1 && (
            <p className="absolute top-4 left-1/2 -translate-x-1/2 text-white/60 text-xs">
              Scroll to zoom &middot; Double-click to enlarge
            </p>
          )}

          <div
            ref={imgRef}
            className="select-none"
            style={{
              maxWidth: "90vw",
              maxHeight: "90vh",
              cursor: zoom > 1 ? (isPanning ? "grabbing" : "grab") : "zoom-in",
              transform: `scale(${zoom}) translate(${pan.x / zoom}px, ${pan.y / zoom}px)`,
              transition: isPanning ? "none" : "transform 0.2s ease-out",
            }}
            onWheel={handleWheel}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onDoubleClick={handleDoubleClick}
          >
            {/* Using img tag in lightbox for full-res display */}
            <img
              src={src}
              alt={alt}
              draggable={false}
              style={{
                maxWidth: "90vw",
                maxHeight: "90vh",
                objectFit: "contain",
              }}
            />
          </div>

          {caption && (
            <p className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white text-sm text-center max-w-[80%]">
              {caption}
            </p>
          )}
        </div>
      )}
    </>
  );
}

/*
 * USAGE EXAMPLE:
 *
 * <ScrollImage
 *   src="/images/screenshot.png"
 *   alt="App screenshot"
 *   caption="Figure 1: The main dashboard"
 *   width={800}
 *   height={500}
 * />
 *
 * Props:
 * - src: string (required) - Image path
 * - alt: string (required) - Alt text for accessibility
 * - caption?: string - Caption displayed below image
 * - width?: number - Image width hint (default: 600)
 * - height?: number - Image height hint (default: 400)
 *
 * ASCII REPRESENTATION:
 *
 * Normal state:
 * ┌─────────────────────────────────────┐
 * │         ┌───────────────┐           │
 * │         │   🔍 IMAGE    │           │  ← click to open
 * │         └───────────────┘           │
 * └─────────────────────────────────────┘
 *        Figure 1: Caption text
 *
 * Lightbox (zoomed):
 * ┌─────────────────────────────────────┐
 * │  Scroll to zoom · Double-click   ✕  │
 * │                                     │
 * │     ┌───────────────────────┐       │
 * │     │                       │       │
 * │     │    ZOOMED IMAGE       │       │  ← scroll/pinch to zoom
 * │     │    (drag to pan)      │       │  ← drag/touch to pan
 * │     │                       │       │
 * │     └───────────────────────┘       │
 * │           Caption text              │
 * └─────────────────────────────────────┘
 *
 * Supports: scroll wheel zoom, pinch zoom (mobile),
 * drag/touch pan when zoomed, double-click/tap toggle,
 * Escape to close.
 */
