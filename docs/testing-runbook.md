# Testing Runbook

## Manual Continuous Integration Policy

This project intentionally operates without any hosted or automated CI services. All verification tasks are executed manually by contributors before publishing code or cutting a release.

Run the full pipeline with:

```bash
npm run ci:manual
```

The command executes the following steps in order:

1. `npm ci`
2. `npm run lint`
3. `npm run typecheck`
4. `npm run security:audit`
5. `npm run test`

Each invocation writes detailed command output to time-stamped files inside `./.ci-logs/`. Inspect those logs when diagnosing failures. Because there are no remote CI runners, maintaining local parity depends on running this command consistently on trusted machines.
