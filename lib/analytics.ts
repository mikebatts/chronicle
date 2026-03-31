// Simple analytics helper that wraps Vercel Analytics
// This avoids importing the Analytics component which caused hydration issues

declare global {
  interface Window {
    va?: (...args: unknown[]) => void;
    vaq?: unknown[][];
  }
}

export function track(event: string, properties?: Record<string, unknown>) {
  if (typeof window !== 'undefined' && window.va) {
    window.va(event, properties);
  }
}
