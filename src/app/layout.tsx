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
  title: {
    default: "Taylor McNeil | Developer Experience Engineer",
    template: "%s | Taylor McNeil", // Pages just set "Quickstart" → becomes "Quickstart | Taylor McNeil"
  },
  description: "I design developer systems that reduce friction and scale adoption.",
  metadataBase: new URL("https://taylormcneil.dev"),
  openGraph: {
    title: "Taylor McNeil",
    description: "I design developer systems that reduce friction and scale adoption.",
    url: "https://taylormcneil.dev",
    siteName: "Taylor McNeil",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Taylor McNeil",
    description: "I design developer systems that reduce friction and scale adoption.",
  },
  robots: {
    index: true,
    follow: true,
  },
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