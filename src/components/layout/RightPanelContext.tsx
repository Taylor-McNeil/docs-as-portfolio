"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";

type PanelWidth = "normal" | "narrow";

interface RightPanelContextType {
  content: ReactNode | null;
  setContent: (content: ReactNode | null) => void;
  width: PanelWidth;
  setWidth: (width: PanelWidth) => void;
  isCollapsed: boolean;
  toggleCollapsed: () => void;
}

const RightPanelContext = createContext<RightPanelContextType | null>(null);

export function RightPanelProvider({ children }: { children: ReactNode }) {
  const [content, setContent] = useState<ReactNode | null>(null);
  const [width, setWidth] = useState<PanelWidth>("normal");
  const [isCollapsed, setIsCollapsed] = useState(false);

  const toggleCollapsed = useCallback(() => setIsCollapsed((prev) => !prev), []);

  return (
    <RightPanelContext.Provider value={{ content, setContent, width, setWidth, isCollapsed, toggleCollapsed }}>
      {children}
    </RightPanelContext.Provider>
  );
}

export function useRightPanel() {
  const context = useContext(RightPanelContext);
  if (!context) {
    throw new Error("useRightPanel must be used within RightPanelProvider");
  }
  return context;
}