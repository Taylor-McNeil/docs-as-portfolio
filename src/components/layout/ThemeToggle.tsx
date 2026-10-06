"use client";

import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import { useSyncExternalStore } from "react";

export function ThemeToggle({ nativeTooltip = true }: { nativeTooltip?: boolean } = {}) {
  const { theme, setTheme } = useTheme();
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  if (!mounted) return <span aria-hidden="true" className="block h-8 w-8" />; // Prevent hydration mismatch

  return (
    <button
      type="button"
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="p-2 rounded-full hover:bg-surface-card text-foreground-muted transition-colors"
      title={nativeTooltip ? "Toggle theme" : undefined}
      aria-label="Toggle theme"
    >
      {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
    </button>
  );
}
