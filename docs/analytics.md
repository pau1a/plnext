# Analytics Integration

**Version**: 1.2
**Author**: Paula Livingstone
**Date**: 2025-01-09
**Status**: Active

## Overview

This site supports multi-vendor analytics tracking through a unified dispatcher architecture. Currently integrated:

- **Umami** - Self-hosted, cookie-free, privacy-first analytics (consent-exempt)
- **Google Analytics 4 (GA4)** - Web analytics and audience measurement (consent-required)
- **PostHog** - First-party analytics and product insights (consent-required)

### Consent Model

- **Umami** runs unconditionally (no cookies, no PII, GDPR-compliant by design)
- **GA4 and PostHog** require explicit user consent before tracking

---

## Architecture

### Components

1. **Analytics Dispatcher** (`src/lib/analytics/dispatcher.ts`)
   - Central coordination layer for all analytics vendors
   - Provides unified `track()` and `pageView()` API
   - Handles vendor initialization and lifecycle

2. **Vendor Adapters** (`src/lib/analytics/vendors/`)
   - `umami.ts` - Umami self-hosted analytics (consent-free)
   - `ga4.ts` - Google Analytics 4 integration (consent-required)
   - `posthog.ts` - PostHog integration (consent-required)
   - Each implements the `AnalyticsVendor` interface

3. **AnalyticsLoader** (`src/components/analytics-loader.tsx`)
   - Mounted in app shell
   - Initializes consent-free vendors immediately (Umami)
   - Initializes consent-required vendors after consent granted (GA4, PostHog)
   - Tracks pageviews on route changes
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
# Umami (Self-hosted, Privacy-First)
# Consent-free analytics - runs unconditionally
NEXT_PUBLIC_UMAMI_WEBSITE_ID=YOUR_UUID_FROM_DASHBOARD
NEXT_PUBLIC_UMAMI_SCRIPT=https://cdn.networklayer.co.uk/analytics/s-v1.js
NEXT_PUBLIC_UMAMI_HOST=/e

# PostHog
NEXT_PUBLIC_POSTHOG_KEY=phc_xxx
NEXT_PUBLIC_POSTHOG_HOST=https://us.i.posthog.com

# Google Analytics 4
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
NEXT_PUBLIC_GA_ENABLED=true
```

### Behavior When Not Configured

- **Missing credentials**: Vendor remains dormant, no errors thrown
- **Empty `UMAMI_WEBSITE_ID`**: Umami skips initialization
- **Empty `GA_MEASUREMENT_ID`**: GA4 skips initialization
- **`GA_ENABLED=false`**: GA4 disabled even if measurement ID present
- Site functions normally without any analytics configured

### Umami Server Setup

For detailed instructions on deploying Umami on your VPS, see [umami-server-setup.md](./umami-server-setup.md). Key requirements:
- PostgreSQL database
- Node.js 18+
- Apache reverse proxy for `/e` endpoint
- CDN script delivery at configured URL

---

## Consent Flow

### Initial State

- User lands on site → consent = "unset"
- **Umami begins tracking immediately** (consent-free, no cookies, no PII)
- Banner appears (if consent-required vendors configured)
- GA4/PostHog remain dormant until consent granted

### Granting Consent

1. User clicks "Allow analytics"
2. Consent saved to localStorage
3. AnalyticsLoader initializes consent-required vendors (GA4, PostHog)
4. Vendors load scripts asynchronously
5. Initial pageview fired for current page
6. Subsequent route changes tracked automatically
7. **Umami continues tracking** (already initialized, unaffected by consent)

### Late Consent

If user grants consent after initial page load:
- Vendors initialize immediately
- **Catch-up pageview** fired for current URL
- Future navigation tracked normally

### Denying Consent

- Consent saved as "denied"
- No consent-required vendor scripts load (GA4, PostHog)
- Existing consent-required tracking stopped and reset
- Banner dismissed
- **Umami continues tracking** (consent-exempt vendor)

### Revoking Consent

User can change preference via footer analytics settings:
- Opens preferences modal
- Can switch between granted/denied/unset
- Changing to "denied" stops consent-required tracking (GA4, PostHog) and resets vendors
- **Umami tracking unaffected** (consent-exempt, no user opt-out available)

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
[Analytics] Initialized consent-free vendor: umami
[Umami] Initialized with website ID: abc123-...
[Umami] Pageview: { url: '/about', title: 'About | Paula Livingstone' }
[Analytics] Initialized ga4
[GA4] Initialized with measurement ID: G-XXXXXXXXXX
[GA4] Pageview: { url: '/about', title: 'About | Paula Livingstone' }
[PostHog] Pageview: { url: '/about' }
```

### Umami Dashboard

1. Open `https://stats.paulalivingstone.com` (or your Umami dashboard URL)
2. Select your website from the dashboard
3. Navigate between pages on your site
4. Verify pageviews appear in realtime
5. Check "Realtime" tab to see active visitors

**Network Tab Verification:**
- Filter by `/e` in DevTools Network tab
- Navigate between pages
- Verify POST requests to `/e` return `200 OK` with body `{ok: 1}`
- Check request payload contains `website`, `url`, `title` properties

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

### Umami Privacy Model

- **No cookies**: Umami uses no cookies whatsoever
- **No PII**: No personal identifiable information collected
- **First-party data**: All data stays on your server
- **GDPR-compliant by design**: Consent-exempt under GDPR/ePrivacy
- **Cookie-free fingerprinting**: Uses daily-rotating salted hash of IP + user agent for session tracking
- **IP anonymization**: IP addresses never stored, only hashed

### IP Anonymization

- **Umami**: IP never stored, only used for daily-rotating hash
- **GA4**: Configured with `anonymize_ip: true` by default
- **PostHog**: IP anonymization configurable

### Cookie Policy

- **Umami**: No cookies, ever
- **Before consent (GA4/PostHog)**: No cookies set
- **After consent**: GA cookies (`_ga`, `_ga_*`), PostHog memory-only
- **After denial**: All cookies cleared (GA4/PostHog only)

### Data Retention

- **Umami**: Configurable in Umami dashboard (default: unlimited)
- **PostHog**: persistence = "memory" (session-only)
- **GA4**: Standard GA4 retention (configurable in GA4 admin)

### GDPR Compliance

**Umami:**
- No consent required (no cookies, no PII)
- GDPR-compliant by design
- User cannot opt out (consent-exempt tracking)

**GA4 & PostHog:**
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

### Umami Not Tracking

**Check environment:**
```bash
echo $NEXT_PUBLIC_UMAMI_WEBSITE_ID
echo $NEXT_PUBLIC_UMAMI_SCRIPT
echo $NEXT_PUBLIC_UMAMI_HOST
```

**Check browser console:**
- Look for `[Umami] Initialized` log
- Verify no script loading errors
- Check Network tab for POST requests to `/e` endpoint

**Check tracking endpoint:**
```bash
curl -X POST https://paulalivingstone.com/e \
  -H "Content-Type: application/json" \
  -d '{"type":"event","payload":{"website":"YOUR_UUID","url":"/test"}}'
# Should return: {"ok":1}
```

**Check server logs:**
```bash
# Umami service logs
sudo journalctl -u umami -f

# Apache logs for /e endpoint
sudo tail -f /var/log/apache2/paulalivingstone.com-access.log | grep " /e "
```

**Common issues:**
- `/e` endpoint not proxied correctly → Check Apache configuration
- Script URL incorrect or not accessible → Verify CDN delivery
- Website ID mismatch → Verify UUID matches Umami dashboard
- Umami service not running → Check `systemctl status umami`

---

## Performance

### Bundle Impact

- **Umami**: ~2KB (external script, loaded from CDN)
- **PostHog**: ~45KB (dynamic import, loaded only when configured)
- **GA4**: ~28KB (external script, loaded via CDN)
- Total impact: < 1% on Lighthouse performance score

### Script Loading Strategy

- **Umami**: `async` with manual insertion, loads immediately (consent-free)
- **GA4**: `async` with manual insertion, loads after consent
- **PostHog**: Dynamic `import()` on first use, loads after consent
- All scripts load **after** page interactive
- No blocking of FCP or LCP

### Recommendations

- Keep `send_page_view: false` to avoid double-tracking
- Use `track()` sparingly for critical events only
- Avoid tracking on every render/scroll event

---

## Testing Checklist

**General:**
- [ ] Site loads without any analytics credentials configured (no errors)
- [ ] Lighthouse performance unaffected (< 1 point delta)

**Umami (Consent-Free):**
- [ ] Umami tracks pageviews immediately on page load (no consent required)
- [ ] POST requests to `/e` endpoint return `200 OK` with `{ok: 1}`
- [ ] Umami dashboard shows realtime pageviews
- [ ] Umami continues tracking after denying consent (consent-exempt)
- [ ] No cookies set by Umami
- [ ] DevTools Network tab shows script loaded from CDN URL

**GA4 & PostHog (Consent-Required):**
- [ ] Banner appears when consent-required vendors configured + consent unset
- [ ] Denying consent dismisses banner, no consent-required tracking occurs
- [ ] Granting consent loads consent-required scripts and fires initial pageview
- [ ] Route changes fire exactly one pageview each (all vendors)
- [ ] Late consent grants fire catch-up pageview for consent-required vendors
- [ ] Revoking consent stops consent-required tracking and clears cookies
- [ ] Custom events tracked via `analytics.track()` (all active vendors)
- [ ] GA4 DebugView shows pageviews in realtime

---

## Future Enhancements

- ~~Admin backend UI for managing GA measurement ID~~ ✅ **Implemented** ([/admin/settings/analytics](src/app/admin/settings/analytics/page.tsx))
- Server-side GA4 events for non-JS clients
- Enhanced e-commerce tracking
- Custom dimension support
- Integration with AdSense
- A/B testing framework
- Umami custom events tracking (currently only pageviews)
- Multi-site Umami configuration (currently single website)

---

## Support

For questions or issues:
- Check browser console for error logs
- Verify environment variables set correctly
- Review this documentation
- For Umami server issues, see [umami-server-setup.md](./umami-server-setup.md)
- Contact: Paula Livingstone

---

## Related Documentation

- **[Umami Server Setup Guide](./umami-server-setup.md)** - Complete deployment guide for self-hosted Umami analytics server

---

**Last Updated**: 2025-01-09
**Maintained By**: Paula Livingstone
