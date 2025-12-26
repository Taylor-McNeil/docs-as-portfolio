"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

export function ScrollToTop() {
  const pathname = usePathname();

  useEffect(() => {
    // Find the main scrollable container and scroll to top
    const main = document.querySelector("main");
    if (main) {
      main.scrollTo(0, 0);
    }
  }, [pathname]);

  return null;
}
