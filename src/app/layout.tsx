import type { Metadata } from "next";
import { Plus_Jakarta_Sans, JetBrains_Mono, Geist, Geist_Mono } from 'next/font/google'
import { ThemeProvider } from "@/components/layout/ThemeProvider";
import { Shell } from "@/components/layout/Shell";
import { Sidebar } from "@/components/layout/Sidebar";
import "./globals.css";

const plusJakarta = Plus_Jakarta_Sans({ 
  subsets: ['latin'],
  variable: '--font-sans'
})

const jetbrainsMono = JetBrains_Mono({ 
  subsets: ['latin'],
  variable: '--font-jetbrains'
})

const geistMono = Geist_Mono({ 
  subsets: ['latin'],
  variable: '--font-geist-mono'
})

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});


export const metadata: Metadata = {
  title: "Taylor McNeil | Docs-as-Portfolio",
  description: "Developer Experience Engineer",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${plusJakarta.variable} ${jetbrainsMono.variable} ${geistMono.variable} ${geistSans.variable} antialiased`} suppressHydrationWarning>
        <ThemeProvider>
          <Shell sidebar={<Sidebar />}>
            {children}
          </Shell>
        </ThemeProvider>
      </body>
    </html>
  );
}