"use client";

import { useEffect, useMemo, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { MethodBadge } from "@/components/navigation/MethodBadge";
import { constellationStars } from "./constellationData";
import { ConstellationScene } from "./constellationScene";
import styles from "./ConstellationHero.module.css";

const legend = [
  { label: "career, oldest left", color: "var(--color-edge-character)" },
  { label: "break", color: "var(--color-foreground-muted)" },
  { label: "docs & tutorials", color: "var(--color-edge-clue)" },
  { label: "aampersand devlogs", color: "var(--color-edge-promise)" },
];

export function ConstellationHero() {
  const heroRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const tipRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<ConstellationScene | null>(null);
  const router = useRouter();
  const { resolvedTheme } = useTheme();
  const { stars, trail } = useMemo(() => constellationStars(), []);

  useEffect(() => {
    if (!heroRef.current || !canvasRef.current || !tipRef.current) return;
    const scene = new ConstellationScene({
      canvas: canvasRef.current,
      tip: tipRef.current,
      scope: heroRef.current,
      stars,
      trail,
      onOpen: (href) => router.push(href),
    });
    sceneRef.current = scene;
    return () => {
      scene.destroy();
      sceneRef.current = null;
    };
  }, [stars, trail, router]);

  // next-themes flips the class on <html>; repaint the sky once it has.
  useEffect(() => {
    sceneRef.current?.setTheme();
  }, [resolvedTheme]);

  return (
    <div className={styles.frame}>
      <div ref={heroRef} className={styles.hero}>
        <canvas
          ref={canvasRef}
          className={styles.canvas}
          role="img"
          aria-label="A map of Taylor's work: career releases, docs and tutorials, and aampersand devlogs, connected as a graph"
        />

        {/* The same map as links, for keyboards and screen readers. */}
        <nav aria-label="Map of my work" className="sr-only">
          <ul>
            {stars.map((s) => (
              <li key={s.id}>
                <Link href={s.href}>
                  {s.label}: {s.meta}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className={styles.copy} data-hero-copy>
          <div className="flex flex-wrap items-center gap-2.5 font-mono text-xs text-foreground-muted">
            <MethodBadge method="GET" active size="md" />
            <span>/taylor-mcneil/readme</span>
            <span className="rounded bg-accent-success/10 px-1.5 py-0.5 text-accent-success">200 OK</span>
          </div>
          <h1 className={styles.headline}>I design developer systems that reduce friction and scale adoption.</h1>
          <p className={styles.lede}>
            75,000+ developers across 6 continents have used something I wrote to get unstuck. Tap or hover the map to
            see what.
          </p>
          <div className="flex flex-wrap gap-2.5">
            <Link
              href="/quickstart"
              className="inline-flex items-center rounded-md border border-accent bg-accent px-3.5 py-2.5 text-sm font-medium text-surface-bg hover:opacity-90"
            >
              Quickstart
            </Link>
            <Link
              href="/aampersand"
              className="inline-flex items-center rounded-md border border-border bg-surface-card px-3.5 py-2.5 text-sm font-medium text-foreground-heading hover:border-accent"
            >
              About aampersand
            </Link>
          </div>
          <div aria-hidden="true" className="flex flex-wrap gap-x-3.5 gap-y-1 font-mono text-[11px] text-foreground-muted">
            {legend.map((item) => (
              <span key={item.label} className="inline-flex items-center gap-1.5">
                <i className={styles.legendSwatch} style={{ background: item.color }} />
                {item.label}
              </span>
            ))}
          </div>
        </div>

        <div className={`${styles.status} flex items-center gap-2 font-mono text-[11px] text-foreground-muted`}>
          <span className="rounded bg-accent-success/10 px-1.5 py-0.5 text-accent-success">● availability</span>
          &quot;Busy building&quot;
        </div>

        <div ref={tipRef} className={styles.tip} hidden />
      </div>
    </div>
  );
}
