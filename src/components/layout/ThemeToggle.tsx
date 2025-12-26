"use client";

import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import { useSyncExternalStore } from "react";

// Subscribe to nothing - we just need a stable reference
const subscribe = () => () => {};

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  // Use useSyncExternalStore to safely check if we're mounted on client
  const mounted = useSyncExternalStore(
    subscribe,
    () => true,  // Client: mounted
    () => false  // Server: not mounted
  );

  if (!mounted) return <div className="w-8 h-8" />; // Prevent hydration mismatch

  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="p-2 rounded-full hover:bg-surface-card text-foreground-muted transition-colors"
      title="Toggle theme"
    >
      {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
    </button>
  );
}