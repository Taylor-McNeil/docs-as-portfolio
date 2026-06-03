import type { Metadata } from "next";
import localFont from 'next/font/local'
import { ThemeProvider } from "@/components/layout/ThemeProvider";
import { Shell } from "@/components/layout/Shell";
import { Sidebar } from "@/components/layout/Sidebar";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

const sansFont = localFont({
  src: [
    {
      path: '../../public/fonts/dm-sans-latin-400.woff2',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../../public/fonts/dm-sans-latin-italic-400.woff2',
      weight: '400',
      style: 'italic',
    },
  ],
  variable: '--font-sans',
  display: 'swap',
})

const jetbrainsMono = localFont({
  src: '../../public/fonts/jetbrains-mono-400.woff2',
  variable: '--font-jetbrains',
  display: 'swap',
})


export const metadata: Metadata = {
  title: {
    default: "Taylor McNeil — Developer, Writer, Builder",
    template: "%s · Taylor McNeil",
  },
  description: "Technical writing, dev tutorials, case studies, and the development blog for aampersand — a visual narrative management tool for fiction writers.",
  metadataBase: new URL("https://taylormcneil.dev"),
  alternates: {
    canonical: 'https://taylormcneil.dev',
  },
  openGraph: {
    title: "Taylor McNeil",
    description: "Technical writing, dev tutorials, case studies, and the development blog for aampersand — a visual narrative management tool for fiction writers.",
    url: "https://taylormcneil.dev",
    siteName: "Taylor McNeil",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Taylor McNeil",
    description: "Technical writing, dev tutorials, case studies, and the development blog for aampersand — a visual narrative management tool for fiction writers.",
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
      <body className={`${sansFont.variable} ${jetbrainsMono.variable} antialiased`} suppressHydrationWarning>
        <ThemeProvider>
          <Shell sidebar={<Sidebar />}>
            {children}
          </Shell>
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  );
}
