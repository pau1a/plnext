/**
 * Analytics module
 *
 * Unified analytics interface for paulalivingstone.com
 *
 * Usage:
 *   import { analytics, track, pageView } from '@/lib/analytics';
 *
 *   track('button_clicked', { button_id: 'hero-cta' });
 *   pageView('/about', 'About Page');
 */

export { analytics, track, pageView } from "./dispatcher";
export type { AnalyticsEvent, AnalyticsVendor, PageViewEvent, ConsentState } from "./types";
export { ga4Vendor } from "./vendors/ga4";
export { posthogVendor } from "./vendors/posthog";
