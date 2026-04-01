import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import Script from "next/script";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://thischronicle.com"),
  title: "Chronicle — Guess the Year",
  description: "A daily history guessing game. One event. Guess the year.",
  openGraph: {
    title: "Chronicle",
    description: "A daily history guessing game.",
    url: "https://thischronicle.com",
    siteName: "Chronicle",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "Chronicle — A daily history guessing game",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Chronicle — Guess the Year",
    description: "A daily history guessing game. One event. Guess the year.",
    images: ["/opengraph-image"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <head>
        <Script id="theme-script" strategy="beforeInteractive">{`
          (function() {
            function getTheme() {
              var h = new Date().getHours();
              return (h >= 19 || h < 7) ? 'dark' : 'light';
            }
            document.documentElement.setAttribute('data-theme', getTheme());
            document.addEventListener('visibilitychange', function() {
              if (!document.hidden) {
                document.documentElement.setAttribute('data-theme', getTheme());
              }
            });
          })();
        `}</Script>
      </head>
      <body className="antialiased">
        {children}
        <Analytics />
      </body>
    </html>
  );
}
