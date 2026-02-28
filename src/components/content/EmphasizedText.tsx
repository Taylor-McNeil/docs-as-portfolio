import { ReactNode } from "react";

type EmphasizedColor = "green" | "blue" | "purple" | "orange" | "pink" | "yellow" | "cyan";

interface EmphasizedTextProps {
  children: ReactNode;
  color?: EmphasizedColor;
}

const colorStyles: Record<EmphasizedColor, string> = {
  green: "dark:text-accent-success text-accent-success dark:bg-transparent bg-accent-success/10",
  blue: "dark:text-method-get text-method-get dark:bg-transparent bg-method-get/10",
  purple: "dark:text-method-patch text-method-patch dark:bg-transparent bg-method-patch/10",
  orange: "dark:text-method-put text-method-put dark:bg-transparent bg-method-put/10",
  pink: "dark:text-pink-400 text-pink-600 dark:bg-transparent bg-pink-500/10",
  yellow: "dark:text-yellow-400 text-yellow-600 dark:bg-transparent bg-yellow-500/10",
  cyan: "dark:text-cyan-400 text-cyan-600 dark:bg-transparent bg-cyan-500/10",
};

export function EmphasizedText({ children, color = "orange" }: EmphasizedTextProps) {
  return (
    <span className={`font-semibold px-1 rounded ${colorStyles[color]}`}>
      {children}
    </span>
  );
}

/*
 * USAGE EXAMPLE:
 *
 * import { EmphasizedText } from "@/components/content/EmphasizedText";
 *
 * <p>
 *   <EmphasizedText>I had to stop trusting the prose.</EmphasizedText>
 *   <EmphasizedText color="purple">Purple emphasis</EmphasizedText>
 *   <EmphasizedText color="green">Green emphasis</EmphasizedText>
 * </p>
 *
 * Props:
 * - children: ReactNode (required) - The text to emphasize
 * - color?: "green" | "blue" | "purple" | "orange" | "pink" | "yellow" | "cyan"
 *   (default: "orange") - Color matching the badge/method color system
 *
 * Colors map to design tokens:
 * - green: accent-success (shipped/shipping)
 * - blue: method-get (built/building)
 * - purple: method-patch (led/leading)
 * - orange: method-put (improved/improving)
 * - pink: pink-400/600 (writing)
 * - yellow: yellow-400/600 (consulting)
 * - cyan: cyan-400/600 (iterating)
 */
