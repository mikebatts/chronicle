import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Chronicle — Guess the Year",
  description: "A daily history guessing game. One event. Guess the year.",
  openGraph: {
    title: "Chronicle",
    description: "A daily history guessing game.",
    url: "https://thischronicle.com",
    siteName: "Chronicle",
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
        {/* Vercel Analytics - loads the tracking script */}
        <Script
          src="/_vercel/insights/script.js"
          strategy="afterInteractive"
          data-sdkn="@vercel/analytics"
          data-sdkv="2.0.1"
        />
      </head>
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
