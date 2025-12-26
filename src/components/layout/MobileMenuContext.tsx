"use client";

import { createContext, useContext, useState, ReactNode } from "react";

interface MobileMenuContextType {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  close: () => void;
}

const MobileMenuContext = createContext<MobileMenuContextType | null>(null);

export function MobileMenuProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  const close = () => setIsOpen(false);

  return (
    <MobileMenuContext.Provider value={{ isOpen, setIsOpen, close }}>
      {children}
    </MobileMenuContext.Provider>
  );
}

export function useMobileMenu() {
  const context = useContext(MobileMenuContext);
  if (!context) {
    throw new Error("useMobileMenu must be used within a MobileMenuProvider");
  }
  return context;
}
