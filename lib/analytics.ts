import { track as vercelTrack } from '@vercel/analytics';

type AllowedPropertyValues = string | number | boolean | null | undefined;

export function track(event: string, properties?: Record<string, AllowedPropertyValues>) {
  if (typeof window !== 'undefined') {
    vercelTrack(event, properties);
  }
}
