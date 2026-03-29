import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Chronicle — Guess the Year",
  description: "A daily history guessing game. One event. One image. Guess the year.",
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
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
