/**
 * Analytics types for vendor-agnostic event tracking
 */

export type AnalyticsEvent = {
  name: string;
  properties?: Record<string, unknown>;
};

export type PageViewEvent = {
  url: string;
  title?: string;
  referrer?: string;
};

export interface AnalyticsVendor {
  /** Unique identifier for this vendor */
  readonly name: string;

  /** Whether this vendor requires user consent before tracking */
  readonly requiresConsent?: boolean;

  /** Check if vendor is configured (has required credentials) */
  isConfigured(): boolean;

  /** Check if vendor has been initialized */
  hasStarted(): boolean;

  /** Initialize the vendor (load scripts, setup) */
  init(): Promise<void>;

  /** Track a pageview */
  pageView(event: PageViewEvent): void;

  /** Track a custom event */
  track(event: AnalyticsEvent): void;

  /** Opt in to tracking (consent granted) */
  optIn(): void;

  /** Opt out of tracking (consent denied) */
  optOut(): void;

  /** Reset vendor state and clear stored data */
  reset(): void;
}

export type ConsentState = "granted" | "denied" | "unset";
