# Analytics Integration

**Version**: 1.1
**Author**: Paula Livingstone
**Date**: 2025-01-09
**Status**: Active

## Overview

This site supports multi-vendor analytics tracking through a unified dispatcher architecture. Currently integrated:

- **PostHog** - First-party analytics and product insights
- **Google Analytics 4 (GA4)** - Web analytics and audience measurement

All analytics respect user consent and operate only when permission is explicitly granted.

---

## Architecture

### Components

1. **Analytics Dispatcher** (`src/lib/analytics/dispatcher.ts`)
   - Central coordination layer for all analytics vendors
   - Provides unified `track()` and `pageView()` API
   - Handles vendor initialization and lifecycle

2. **Vendor Adapters** (`src/lib/analytics/vendors/`)
   - `ga4.ts` - Google Analytics 4 integration
   - `posthog.ts` - PostHog integration
   - Each implements the `AnalyticsVendor` interface

3. **AnalyticsLoader** (`src/components/analytics-loader.tsx`)
   - Mounted in app shell
   - Observes consent state and route changes
   - Triggers pageview events on navigation
   - Handles late consent grants with catch-up tracking

4. **AnalyticsConsentProvider** (`src/components/analytics-consent-provider.tsx`)
   - Manages user consent state ("granted" | "denied" | "unset")
   - Persists choice in localStorage
   - Provides React context for consent queries

---

## Environment Configuration

### Required Variables

Add these to `.env.local` (see `.env.local.example`):

```bash
# PostHog
NEXT_PUBLIC_POSTHOG_KEY=phc_xxx
NEXT_PUBLIC_POSTHOG_HOST=https://us.i.posthog.com

# Google Analytics 4
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
NEXT_PUBLIC_GA_ENABLED=true
```

### Behavior When Not Configured

- **Missing credentials**: Vendor remains dormant, no errors thrown
- **Empty `GA_MEASUREMENT_ID`**: GA4 skips initialization
- **`GA_ENABLED=false`**: GA4 disabled even if measurement ID present
- Site functions normally without any analytics configured

---

## Consent Flow

### Initial State

- User lands on site → consent = "unset"
- Banner appears (if analytics configured)
- No tracking occurs until consent granted

### Granting Consent

1. User clicks "Allow analytics"
2. Consent saved to localStorage
3. AnalyticsLoader initializes all configured vendors
4. Vendors load scripts asynchronously
5. Initial pageview fired for current page
6. Subsequent route changes tracked automatically

### Late Consent

If user grants consent after initial page load:
- Vendors initialize immediately
- **Catch-up pageview** fired for current URL
- Future navigation tracked normally

### Denying Consent

- Consent saved as "denied"
- No vendor scripts load
- Existing tracking stopped and reset
- Banner dismissed

### Revoking Consent

User can change preference via footer analytics settings:
- Opens preferences modal
- Can switch between granted/denied/unset
- Changing to "denied" stops all tracking and resets vendors

---

## Pageview Tracking

### Automatic Tracking

AnalyticsLoader subscribes to Next.js router events:
- Monitors `usePathname()` and `useSearchParams()`
- Fires one `pageView()` per unique URL
- Deduplicates rapid re-renders of same route

### Manual Tracking

```tsx
import { analytics } from '@/lib/analytics/dispatcher';

// Track pageview
analytics.pageView('/custom-path', 'Custom Page Title');

// Track custom event
analytics.track('button_clicked', {
  button_id: 'cta-hero',
  page: '/about'
});
```

---

## Adding a New Vendor

1. **Create vendor adapter** in `src/lib/analytics/vendors/yourvendor.ts`:

```typescript
import type { AnalyticsVendor } from '../types';

class YourVendor implements AnalyticsVendor {
  readonly name = 'yourvendor';

  isConfigured(): boolean {
    return Boolean(process.env.NEXT_PUBLIC_YOURVENDOR_KEY);
  }

  hasStarted(): boolean {
    // Return true if vendor initialized
  }

  async init(): Promise<void> {
    // Load scripts, initialize SDK
  }

  pageView(event: PageViewEvent): void {
    // Track pageview
  }

  track(event: AnalyticsEvent): void {
    // Track custom event
  }

  optIn(): void {
    // Grant consent
  }

  optOut(): void {
    // Revoke consent
  }

  reset(): void {
    // Clear state
  }
}

export const yourVendor = new YourVendor();
```

2. **Register vendor** in `dispatcher.ts`:

```typescript
import { yourVendor } from './vendors/yourvendor';

constructor() {
  this.registerVendor(ga4Vendor);
  this.registerVendor(posthogVendor);
  this.registerVendor(yourVendor); // Add here
}
```

3. **Add environment variables** to `.env.local.example`

4. **Update this documentation**

---

## Verification

### Development Console

When `NODE_ENV=development`, all vendors log activity:

```
[Analytics] Initialized ga4
[GA4] Initialized with measurement ID: G-XXXXXXXXXX
[GA4] Pageview: { url: '/about', title: 'About | Paula Livingstone' }
[PostHog] Pageview: { url: '/about' }
```

### Google Analytics DebugView

1. Open GA4 property → Admin → DebugView
2. Add `?debug_mode=true` to site URL
3. Navigate between pages
4. Verify `page_view` events appear in realtime

### Chrome DevTools

**Network Tab:**
- Filter by "google-analytics.com" or "googletagmanager.com"
- Verify `gtag/js` script loaded
- Check `collect` requests on pageviews

**Application Tab:**
- localStorage → `plnext.analytics-consent` = "granted"
- Cookies → `_ga`, `_ga_*` present (after consent)

---

## Privacy & Compliance

### IP Anonymization

GA4 configured with `anonymize_ip: true` by default.

### Cookie Policy

- **Before consent**: No cookies set
- **After consent**: GA cookies (`_ga`, `_ga_*`), PostHog memory-only
- **After denial**: All cookies cleared

### Data Retention

- PostHog: persistence = "memory" (session-only)
- GA4: Standard GA4 retention (configurable in GA4 admin)

### GDPR Compliance

- Explicit opt-in required
- Consent state persisted
- User can revoke at any time
- No tracking before consent

---

## Troubleshooting

### GA4 Not Tracking

**Check environment:**
```bash
echo $NEXT_PUBLIC_GA_MEASUREMENT_ID
echo $NEXT_PUBLIC_GA_ENABLED
```

**Check browser console:**
- Look for `[GA4] Initialized` log
- Verify no script loading errors
- Check Network tab for `gtag/js` request

**Check consent:**
- localStorage → `plnext.analytics-consent` should be "granted"
- Try granting consent again via banner or footer preferences

### Duplicate Pageviews

Verify `send_page_view: false` in GA4 config (already set by default). Our implementation handles pageviews manually to ensure accurate SPA tracking.

### Consent Not Persisting

Check localStorage quota and permissions. Try:
```javascript
localStorage.setItem('test', '1');
localStorage.getItem('test'); // Should return '1'
```

---

## Performance

### Bundle Impact

- **PostHog**: ~45KB (dynamic import, loaded only when configured)
- **GA4**: ~28KB (external script, loaded via CDN)
- Total impact: < 1% on Lighthouse performance score

### Script Loading Strategy

- GA4 script: `async` with manual insertion
- PostHog: Dynamic `import()` on first use
- Both load **after** page interactive
- No blocking of FCP or LCP

### Recommendations

- Keep `send_page_view: false` to avoid double-tracking
- Use `track()` sparingly for critical events only
- Avoid tracking on every render/scroll event

---

## Testing Checklist

- [ ] Site loads without GA credentials (no errors)
- [ ] Banner appears when analytics configured + consent unset
- [ ] Denying consent dismisses banner, no tracking occurs
- [ ] Granting consent loads scripts and fires initial pageview
- [ ] Route changes fire exactly one pageview each
- [ ] Late consent grants fire catch-up pageview
- [ ] Revoking consent stops tracking and clears cookies
- [ ] Custom events tracked via `analytics.track()`
- [ ] GA4 DebugView shows pageviews in realtime
- [ ] Lighthouse performance unaffected (< 1 point delta)

---

## Future Enhancements

- Admin backend UI for managing GA measurement ID
- Server-side GA4 events for non-JS clients
- Enhanced e-commerce tracking
- Custom dimension support
- Integration with AdSense
- A/B testing framework

---

## Support

For questions or issues:
- Check browser console for error logs
- Verify environment variables set correctly
- Review this documentation
- Contact: [Your contact details]

---

**Last Updated**: 2025-01-09
**Maintained By**: Paula Livingstone
