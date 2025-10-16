# Stage 5 backlog runbook

This runbook converts the Stage 5 backlog into a linear set of engineering tasks. Complete them in order so that downstream work has the required foundations.

## 1. Migrate blog index to keyset pagination
<a href="../../issues/new?title=Stage%205%3A%20Keyset%20pagination&labels=stage-5%2Crunbook&body=%23%23%20Checklist%0A-%20%5B%20%5D%201.%20Audit%20existing%20%60%2Fblog%60%20data%20loading%20and%20UI%20to%20document%20current%20behaviour.%0A-%20%5B%20%5D%202.%20Design%20cursor-based%20data%20contract%20%28API%20route%20or%20server%20action%29%20including%20request%2Fresponse%20types.%0A-%20%5B%20%5D%203.%20Implement%20data%20source%20with%20Supabase%20query%20using%20%60inserted_at%60%20%2B%20slug%20tie-breaker.%0A-%20%5B%20%5D%204.%20Update%20blog%20index%20page%20to%20consume%20cursor%20data%20and%20render%20%22next%2Fprevious%22%20affordances.%0A-%20%5B%20%5D%205.%20Add%20regression%20tests%20%28Vitest%20%2B%20Playwright%20if%20applicable%29%20for%20pagination%20navigation.%0A-%20%5B%20%5D%206.%20Update%20metadata%20generation%20and%20sitemap%20feeds%20to%20use%20cursor-aware%20fetching." class="btn btn-primary" target="_blank" rel="noopener noreferrer">Start Task</a>
1. Audit existing `/blog` data loading and UI to document current behaviour.
2. Design cursor-based data contract (API route or server action) including request/response types.
3. Implement data source with Supabase query using `inserted_at` + slug tie-breaker.
4. Update blog index page to consume cursor data and render "next/previous" affordances.
5. Add regression tests (Vitest + Playwright if applicable) for pagination navigation.
6. Update metadata generation and sitemap feeds to use cursor-aware fetching.

## 2. Surface comment counters on list cards
<a href="../../issues/new?title=Stage%205%3A%20Comment%20counters%20on%20list%20cards&labels=stage-5%2Crunbook&body=%23%23%20Checklist%0A-%20%5B%20%5D%201.%20Extend%20Supabase%20service%20to%20batch%20read%20%60post_comment_counts%60%20for%20visible%20slugs.%0A-%20%5B%20%5D%202.%20Thread%20count%20data%20through%20loader%2C%20React%20query%20cache%2C%20or%20props%20as%20appropriate.%0A-%20%5B%20%5D%203.%20Render%20accessible%20counter%20UI%20on%20blog%20cards%20with%20zero-state%20handling.%0A-%20%5B%20%5D%204.%20Add%20loading%2Ferror%20fallbacks%20%28e.g.%2C%20skeleton%20or%20suppressed%20display%20on%20failure%29.%0A-%20%5B%20%5D%205.%20Write%20tests%20covering%20zero%2C%20plural%2C%20and%20failure%20cases." class="btn btn-primary" target="_blank" rel="noopener noreferrer">Start Task</a>
1. Extend Supabase service to batch read `post_comment_counts` for visible slugs.
2. Thread count data through loader, React query cache, or props as appropriate.
3. Render accessible counter UI on blog cards with zero-state handling.
4. Add loading/error fallbacks (e.g., skeleton or suppressed display on failure).
5. Write tests covering zero, plural, and failure cases.

## 3. Implement caching and stale-while-revalidate policy
<a href="../../issues/new?title=Stage%205%3A%20Caching%20and%20SWR%20policy&labels=stage-5%2Crunbook&body=%23%23%20Checklist%0A-%20%5B%20%5D%201.%20Set%20%60fetch%60%20cache%20hints%20or%20route-level%20%60revalidate%60%20to%2060%20seconds%20with%20SWR%20fallback.%0A-%20%5B%20%5D%202.%20Tag%20responses%20%28per%20slug%20and%20list%29%20to%20enable%20targeted%20revalidation.%0A-%20%5B%20%5D%203.%20Document%20cache%20contract%20and%20expectations%20for%20moderation-triggered%20refresh.%0A-%20%5B%20%5D%204.%20Add%20monitoring%2Flogging%20to%20confirm%20headers%20are%20emitted%20in%20production." class="btn btn-primary" target="_blank" rel="noopener noreferrer">Start Task</a>
1. Set `fetch` cache hints or route-level `revalidate` to 60 seconds with SWR fallback.
2. Tag responses (per slug and list) to enable targeted revalidation.
3. Document cache contract and expectations for moderation-triggered refresh.
4. Add monitoring/logging to confirm headers are emitted in production.

### Cache contract (blog index + metadata)

- **Revalidation window:** All blog index surfaces (`/blog`, RSS, sitemap, and metadata generation) now export `revalidate = 60` and consume the cached Supabase query helper.
- **Cache tags:** The helper exposes `BLOG_LIST_CACHE_TAG` for index-level refreshes and `getBlogPostCacheTag(slug)` for per-article events. Moderation tooling must call `revalidateTag` with both values when a comment is approved/rejected to keep counts fresh without a full site purge.
- **Structured telemetry:** Each call to the loader emits a `blog-cache-hint` JSON log summarising the cursor, applied tags, and active revalidate window. Operations can scrape these logs to verify that CDN/edge responses respect the expected cache headers.

## 4. Verify ISR rebuild and CDN asset caching
<a href="../../issues/new?title=Stage%205%3A%20Verify%20ISR%20rebuild%20and%20CDN%20caching&labels=stage-5%2Crunbook&body=%23%23%20Checklist%0A-%20%5B%20%5D%201.%20Create%20server%20action%20or%20API%20endpoint%20to%20trigger%20on-demand%20revalidation%20by%20tag%2Fpath.%0A-%20%5B%20%5D%202.%20Script%20local%20and%20staging%20verification%20of%20ISR%20rebuilds%2C%20recording%20timings%20and%20outcomes.%0A-%20%5B%20%5D%203.%20Validate%20CDN%20asset%20caching%20rules%20%28headers%2C%20compression%29%20and%20capture%20evidence.%0A-%20%5B%20%5D%204.%20Document%20the%20verification%20steps%20in%20operations%20runbook." class="btn btn-primary" target="_blank" rel="noopener noreferrer">Start Task</a>
1. Create server action or API endpoint to trigger on-demand revalidation by tag/path.
2. Script local and staging verification of ISR rebuilds, recording timings and outcomes.
3. Validate CDN asset caching rules (headers, compression) and capture evidence.
4. Document the verification steps in operations runbook.

## 5. Add analytics instrumentation
<a href="../../issues/new?title=Stage%205%3A%20Analytics%20instrumentation&labels=stage-5%2Crunbook&body=%23%23%20Checklist%0A-%20%5B%20%5D%201.%20Select%20analytics%20provider%20and%20confirm%20environment%20variables%2Fsecrets.%0A-%20%5B%20%5D%202.%20Integrate%20provider%20script%20or%20component%20in%20the%20app%20shell%20with%20hydration%20safeguards.%0A-%20%5B%20%5D%203.%20Implement%20consent%20banner%2Ftoggles%20if%20required%20by%20privacy%20policy.%0A-%20%5B%20%5D%204.%20Smoke-test%20navigation%2C%20page%20view%2C%20and%20key%20interaction%20events.%0A-%20%5B%20%5D%205.%20Document%20analytics%20configuration%20and%20troubleshooting." class="btn btn-primary" target="_blank" rel="noopener noreferrer">Start Task</a>
1. Select analytics provider and confirm environment variables/secrets.
2. Integrate provider script or component in the app shell with hydration safeguards.
3. Implement consent banner/toggles if required by privacy policy.
4. Smoke-test navigation, page view, and key interaction events.
5. Document analytics configuration and troubleshooting.

## 6. Build moderation backend surface
<a href="../../issues/new?title=Stage%205%3A%20Moderation%20backend%20surface&labels=stage-5%2Crunbook&body=%23%23%20Checklist%0A-%20%5B%20%5D%201.%20Define%20RBAC%20requirements%20and%20extend%20auth%20middleware%20for%20admin-only%20routes.%0A-%20%5B%20%5D%202.%20Scaffold%20admin%20route%20%28e.g.%2C%20%60%2Fadmin%2Fcomments%60%29%20with%20protected%20layout.%0A-%20%5B%20%5D%203.%20Implement%20moderation%20queue%20views%20with%20filtering%2C%20pagination%2C%20and%20search.%0A-%20%5B%20%5D%204.%20Wire%20actions%20to%20update%20comment%20status%20via%20Supabase%20service%20key%20calls.%0A-%20%5B%20%5D%205.%20Add%20optimistic%20UI%20%2B%20cache%20invalidation%20hooks%20that%20trigger%20ISR%20revalidation.%0A-%20%5B%20%5D%206.%20Record%20audit%20log%20events%20for%20every%20moderation%20action.%0A-%20%5B%20%5D%207.%20Write%20end-to-end%20tests%20covering%20positive%20and%20negative%20authorization%20flows." class="btn btn-primary" target="_blank" rel="noopener noreferrer">Start Task</a>
1. Define RBAC requirements and extend auth middleware for admin-only routes.
2. Scaffold admin route (e.g., `/admin/comments`) with protected layout.
3. Implement moderation queue views with filtering, pagination, and search.
4. Wire actions to update comment status via Supabase service key calls.
5. Add optimistic UI + cache invalidation hooks that trigger ISR revalidation.
6. Record audit log events for every moderation action.
7. Write end-to-end tests covering positive and negative authorization flows.

## 7. Close-out tasks
<a href="../../issues/new?title=Stage%205%3A%20Close-out%20tasks&labels=stage-5%2Crunbook&body=%23%23%20Checklist%0A-%20%5B%20%5D%201.%20Update%20documentation%20%28README%2C%20runbooks%29%20reflecting%20new%20flows.%0A-%20%5B%20%5D%202.%20Ensure%20environment%20variables%20are%20populated%20in%20all%20deployment%20targets.%0A-%20%5B%20%5D%203.%20Capture%20learnings%2C%20open%20follow-up%20issues%2C%20and%20hand%20off%20to%20operations." class="btn btn-primary" target="_blank" rel="noopener noreferrer">Start Task</a>
1. Update documentation (README, runbooks) reflecting new flows.
2. Ensure environment variables are populated in all deployment targets.
3. Capture learnings, open follow-up issues, and hand off to operations.
