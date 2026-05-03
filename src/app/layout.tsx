import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Geist, Geist_Mono } from 'next/font/google'
import localFont from 'next/font/local'
import { ThemeProvider } from "@/components/layout/ThemeProvider";
import { Shell } from "@/components/layout/Shell";
import { Sidebar } from "@/components/layout/Sidebar";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

const plusJakarta = Plus_Jakarta_Sans({ 
  subsets: ['latin'],
  variable: '--font-sans'
})

const jetbrainsMono = localFont({
  src: '../../public/fonts/jetbrains-mono-400.woff2',
  variable: '--font-jetbrains',
  display: 'swap',
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
      <body className={`${plusJakarta.variable} ${jetbrainsMono.variable} ${geistMono.variable} ${geistSans.variable} antialiased`} suppressHydrationWarning>
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
