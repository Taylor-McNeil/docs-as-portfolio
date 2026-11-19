"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export interface RandomRuleCard {
  number: number;
  rule: string;
  href: string;
  postTitle?: string;
  toneClass: string;
}

/**
 * Picks `count` rules at random with no two numbers next to each other
 * (so never #12 and #13 together). Falls back to fewer if the pool is tiny.
 */
export function pickNonSequential<T extends { number: number }>(
  pool: T[],
  count: number,
  random: () => number = Math.random,
): T[] {
  const shuffled = [...pool];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  const picked: T[] = [];
  for (const candidate of shuffled) {
    if (picked.every((p) => Math.abs(p.number - candidate.number) > 1)) picked.push(candidate);
    if (picked.length === count) break;
  }
  return picked.sort((a, b) => a.number - b.number);
}

/** Spread evenly (first, middle, last) for the server render, so the HTML is stable; the browser re-picks at random. */
function initialPick(pool: RandomRuleCard[], count: number): RandomRuleCard[] {
  if (pool.length <= count) return pool;
  const step = (pool.length - 1) / (count - 1);
  return Array.from({ length: count }, (_, i) => pool[Math.round(i * step)]);
}

export function RandomRules({ rules, count = 3 }: { rules: RandomRuleCard[]; count?: number }) {
  const [picked, setPicked] = useState(() => initialPick(rules, count));

  useEffect(() => {
    // Randomness has to wait for the browser, or the server and client HTML would disagree.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPicked(pickNonSequential(rules, count));
  }, [rules, count]);

  return (
    <ol className="grid gap-3 md:grid-cols-3" data-random-rules>
      {picked.map((rule) => (
        <li key={rule.number}>
          <Link
            href={rule.href}
            className="flex h-full flex-col gap-3 border border-border-card bg-surface-card p-4 transition-colors hover:border-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            <span className={`font-mono text-xs font-semibold ${rule.toneClass}`}>
              #{String(rule.number).padStart(2, "0")}
            </span>
            <span className="text-sm font-semibold leading-6 text-foreground-heading">{rule.rule}</span>
            {rule.postTitle && (
              <span className="mt-auto font-mono text-[10px] text-foreground-muted">{rule.postTitle}</span>
            )}
          </Link>
        </li>
      ))}
    </ol>
  );
}
