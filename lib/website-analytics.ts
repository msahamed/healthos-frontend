"use client";

type EventProperties = Record<string, string | number | boolean>;

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    FS?: {
      event?: (name: string, properties?: EventProperties) => void;
    };
  }
}

/** Send the same product signal to both website analytics tools. */
export function trackWebsiteEvent(
  name: string,
  properties: EventProperties = {},
) {
  window.gtag?.("event", name, properties);
  window.FS?.event?.(name, properties);
}

