import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About — Chronicle",
  description: "About Chronicle, a daily history guessing game.",
};

export default function AboutPage() {
  return (
    <main className="min-h-screen flex flex-col">
      <header className="py-4 px-4 border-b border-[var(--border)]">
        <div className="max-w-md mx-auto">
          <Link
            href="/"
            className="text-2xl font-semibold tracking-[-0.02em] hover:opacity-70 transition-opacity"
            style={{ fontFamily: "var(--font-serif)" }}
          >
            Chronicle
          </Link>
        </div>
      </header>

      <section className="flex-1 px-4 py-16">
        <div className="max-w-md mx-auto space-y-6">
          <h1
            className="text-2xl font-semibold tracking-[-0.02em]"
            style={{ fontFamily: "var(--font-serif)" }}
          >
            About
          </h1>
          <p className="text-[var(--text-secondary)] leading-relaxed">
            Chronicle is a daily history guessing game. One event, one year to
            guess.
          </p>
          <p className="text-[var(--text-secondary)] leading-relaxed">
            Built by{" "}
            <a
              href="https://x.com/mikebatts_"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--accent)] underline underline-offset-4 hover:opacity-70 transition-opacity"
            >
              @mikebatts_
            </a>{" "}
            on X.
          </p>
        </div>
      </section>
    </main>
  );
}
