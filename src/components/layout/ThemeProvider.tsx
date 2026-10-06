'use client';

import { ThemeProvider as NextThemesProvider } from "next-themes";
import { ReactNode } from "react";
import { usePathname } from "next/navigation";

export function ThemeProvider({children}: {children: ReactNode}){
    const isEntryPreview = usePathname() === "/tools/entry-editor/preview";
    // The frame owns its theme independently of the author's application theme.
    // next-themes ignores nested providers, so let the frame supply the provider.
    if (isEntryPreview) return children;
    return(
        <NextThemesProvider attribute= "class" defaultTheme="dark" enableSystem={false}>
            {children}
        </NextThemesProvider>
    )
}