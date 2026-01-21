"use client";

import { useTheme } from "next-themes";

export type JsonValue = string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue };

interface JsonRendererProps {
  data: JsonValue;
  isRoot?: boolean;
}

export function JsonRenderer({ data }: JsonRendererProps) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  if (data === null) {
    return <span className="text-foreground-muted">null</span>;
  }

  if (typeof data === "boolean") {
    return <span className="text-yellow-500">{data.toString()}</span>;
  }

  if (typeof data === "number") {
    return <span className="text-blue-400">{data}</span>;
  }

  if (typeof data === "string") {
    if (data.startsWith("http") || data.startsWith("mailto:")) {
      return (
        <a
          href={data}
          target="_blank"
          rel="noopener noreferrer"
          className={`underline break-all ${
            isDark
              ? "text-green-400 decoration-green-900/50 hover:text-green-300"
              : "text-orange-600 decoration-orange-200 hover:text-orange-500"
          }`}
        >
          &quot;{data}&quot;
        </a>
      );
    }
    return (
      <span className={isDark ? "text-green-300" : "text-emerald-600"}>
        &quot;{data}&quot;
      </span>
    );
  }

  if (Array.isArray(data)) {
    if (data.length === 0) {
      return <span className="text-foreground-muted">[]</span>;
    }
    return (
      <span>
        <span className="text-foreground-muted">[</span>
        {data.map((item, index) => (
          <div key={index} className="pl-4">
            <JsonRenderer data={item} isRoot={false} />
            {index < data.length - 1 && <span className="text-foreground-muted">,</span>}
          </div>
        ))}
        <span className="text-foreground-muted">]</span>
      </span>
    );
  }

  if (typeof data === "object") {
    const entries = Object.entries(data);
    if (entries.length === 0) {
      return <span className="text-foreground-muted">{"{}"}</span>;
    }
    return (
      <span>
        <span className="text-foreground-muted">{"{"}</span>
        {entries.map(([key, value], index) => (
          <div key={key} className="pl-4">
            <span className={isDark ? "text-blue-300" : "text-indigo-600"}>
              &quot;{key}&quot;
            </span>
            <span className="text-foreground-muted">: </span>
            <JsonRenderer data={value} isRoot={false} />
            {index < entries.length - 1 && <span className="text-foreground-muted">,</span>}
          </div>
        ))}
        <span className="text-foreground-muted">{"}"}</span>
      </span>
    );
  }

  return <span>{String(data)}</span>;
}

/*
 * USAGE EXAMPLE:
 *
 * import { JsonRenderer, JsonValue } from "@/components/content/JsonRenderer";
 *
 * const apiResponse: JsonValue = {
 *   id: "msg_123",
 *   type: "message",
 *   content: [
 *     { type: "text", text: "Hello!" }
 *   ],
 *   model: "claude-3",
 *   usage: {
 *     input_tokens: 10,
 *     output_tokens: 25
 *   }
 * };
 *
 * <pre className="font-mono text-sm">
 *   <JsonRenderer data={apiResponse} />
 * </pre>
 *
 * Props:
 * - data: JsonValue (required) - JSON data to render
 * - isRoot?: boolean - Internal prop for recursion
 *
 * ASCII REPRESENTATION:
 *
 * {
 *     "id": "msg_123",           <- strings in green
 *     "type": "message",
 *     "usage": {
 *         "input_tokens": 10,    <- numbers in blue
 *         "output_tokens": 25
 *     },
 *     "active": true             <- booleans in yellow
 * }
 *
 * Features:
 * - Recursive rendering for nested objects/arrays
 * - Color-coded by type (strings, numbers, booleans, null)
 * - URLs become clickable links
 * - Theme-aware colors (dark/light mode)
 * - Proper indentation with pl-4
 */