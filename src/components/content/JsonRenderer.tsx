"use client";

import { useTheme } from "next-themes";

type JsonValue = string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue };

interface JsonRendererProps {
  data: JsonValue;
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
    if (data.startsWith("http")) {
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
          <div key={index} className="pl-5">
            <JsonRenderer data={item} />
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
          <div key={key} className="pl-5 flex">
            <span className={`mr-2 ${isDark ? "text-blue-300" : "text-indigo-600"}`}>
              &quot;{key}&quot;:
            </span>
            <div className="flex-1">
              <JsonRenderer data={value} />
              {index < entries.length - 1 && <span className="text-foreground-muted">,</span>}
            </div>
          </div>
        ))}
        <span className="text-foreground-muted">{"}"}</span>
      </span>
    );
  }

  return <span>{String(data)}</span>;
}