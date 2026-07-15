import { Method } from "@/components/content/navigation";

interface MethodBadgeProps {
  method: Method;
  active?: boolean;
  size?: "sm" | "md" | "lg";
}

const methodStyles: Record<Method, string> = {
  GET: "bg-method-get-bg text-method-get border-method-get/30",
  POST: "bg-method-post-bg text-method-post border-method-post/30",
  PUT: "bg-method-put-bg text-method-put border-method-put/30",
  PATCH: "bg-method-patch-bg text-method-patch border-method-patch/30",
  HEAD:  "bg-method-head-bg text-method-head border-method-head/30",
  OPTIONS: "bg-method-options-bg text-method-options border-method-options/30",
};

const inactiveStyle = "border-border text-foreground-muted bg-transparent";

const sizeStyles = {
  sm: "text-[9px] px-1 py-0.5",
  md: "text-xs px-2 py-1",
  lg: "text-sm px-3 py-1.5",
};

export function MethodBadge({ method, active = false, size = "sm" }: MethodBadgeProps) {
  return (
    <span
      className={`font-mono font-medium rounded border ${sizeStyles[size]} ${
        active ? methodStyles[method] : inactiveStyle
      }`}
    >
      {method}
    </span>
  );
}