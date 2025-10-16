_Last updated: 2025-10-23 by gpt-5-codex_

# Analytics Instrumentation

## Vendor

- **Provider:** [PostHog](https://posthog.com/)
- **Rationale:** Privacy-first event analytics with EU/US hosting options, first-party ingestion, and feature flags if expansion is needed later. Supports a no-cookie mode that aligns with the existing privacy baseline.

## Required environment variables

| Name | Scope | Description |
| --- | --- | --- |
| `NEXT_PUBLIC_POSTHOG_KEY` | Client | Public API key from the PostHog project (Project settings → General → Project API key). |
| `NEXT_PUBLIC_POSTHOG_HOST` | Client | Optional. Override to a self-hosted or EU data plane (defaults to `https://us.i.posthog.com`). |

Populate the values in the hosting provider’s secret manager for production/staging and in `.env.local` for development. The keys are read at build time; restart `npm run dev` after editing.

## Consent model

- Tracking is disabled by default (`consent === "unset"`).
- A banner prompts visitors to opt in or decline. Choices are stored in `localStorage` (`plnext.analytics-consent`).
- Enabling consent initialises PostHog with cookie-less persistence, registers the `analytics_consent` property, and records an `analytics_consent_updated` event.
- Denying consent immediately opts the SDK out and suppresses future captures until the visitor re-enables analytics.
- Visitors can revisit their choice from the footer “Analytics preferences” controls.

## Events

| Event | Trigger | Properties |
| --- | --- | --- |
| `$pageview` | On route transitions when consent is granted. | `$current_url` (path + query) |
| `analytics_consent_updated` | When the visitor accepts or declines analytics. | `status` (`granted`/`denied`) |
| `ui_theme_toggle` | Theme toggle button activated with analytics enabled. | `theme` (`light`/`dark`) |

## Smoke tests

1. Start the dev server: `npm run dev`.
2. Load `http://localhost:3000` in a private window. Confirm the consent banner appears.
3. Click **Allow analytics**. In the browser devtools network tab, filter for `app.posthog.com` (or custom host) and check that `analytics_consent_updated` and `$pageview` requests are sent.
4. Navigate to `/about` via the header. A second `$pageview` should fire.
5. Toggle the theme switcher; confirm a `ui_theme_toggle` event with the target theme value.
6. In the footer controls, click **Disable**. Subsequent navigation should not emit network requests.

## Troubleshooting

| Symptom | Resolution |
| --- | --- |
| Consent banner never appears | Ensure `NEXT_PUBLIC_POSTHOG_KEY` is defined at build time. Without a key the components remain inert. |
| No network requests after allowing analytics | Confirm the browser is not blocking third-party requests and that the configured host matches the PostHog project region. |
| Events persist after opting out | Clear browser storage (`localStorage` and cookies) and reload. If the issue persists, verify no other scripts re-initialise PostHog. |
| Type errors on build (`posthog-js` missing types) | Run `npm install` to ensure dependencies are in sync. |

## Rollout checklist

- [ ] Provision PostHog project and copy the API key.
- [ ] Set `NEXT_PUBLIC_POSTHOG_KEY`/`NEXT_PUBLIC_POSTHOG_HOST` secrets for each environment.
- [ ] Deploy. Run smoke tests on staging before promoting to production.
- [ ] Update the privacy policy to reference PostHog analytics and the consent workflow.
