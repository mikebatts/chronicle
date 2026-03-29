import type { Metadata } from "next";
import { Inter } from "next/font/google";
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
  // Time-based theme: dark between 7 PM and 7 AM
  // Also re-checks on visibility change (e.g. user opens tab after sunset)
  const themeScript = `
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
  `;

  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  );
}
