import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
  ComponentRegistry,
  type ComponentRegistrySources,
} from "@/components/interactive/ComponentRegistry";

const SOURCE_FILES = {
  callout: "src/components/content/Callout.tsx",
  "code-tabs": "src/components/content/CodeTabs.tsx",
  "myspace-customizer": "src/components/interactive/MySpaceCustomizer.tsx",
  "story-graph": "src/components/interactive/story-graph/StoryGraph.tsx",
  mermaid: "src/components/content/Mermaid.tsx",
  "tic-tac-toe": "src/components/interactive/TicTacToeGame.tsx",
} as const;

export function loadComponentRegistrySources(): ComponentRegistrySources {
  return Object.fromEntries(
    Object.entries(SOURCE_FILES).map(([id, path]) => [
      id,
      {
        code: readFileSync(join(process.cwd(), path), "utf8"),
        filename: path.split("/").at(-1) ?? path,
      },
    ])
  );
}

export function LiveComponentRegistry() {
  const sources = loadComponentRegistrySources();
  return <ComponentRegistry sources={sources} />;
}
