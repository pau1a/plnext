_Last updated: 2025-10-14 by PL_

# Paula Livingstone Web Experience

This repository powers Paula Livingstone’s personal site and portfolio, combining writing, project highlights, and contact routes in one place.

All design, architecture, and content rules live in [`/docs/`](docs/), so start there when planning changes.

**Stack:** Next.js 15 app directory, React 19, Bootstrap utility layer, Framer Motion, next-themes, and custom SCSS tokens.
**Data layer:** Supabase (Postgres) for comments and contact records — see [`docs/09-database-and-services.md`](docs/09-database-and-services.md).

## Local development

Run the site locally:

```bash
npm run dev
```

Static export via `next export` is supported for CDN uploads once content stabilises.

For architecture, palette, and writing standards, see `/docs/`.

> **Quality Assurance:**
> Run `npm run ci:manual` before any release build. This command executes the complete test and lint pipeline locally. The repository has no remote CI runners by policy.

## Wallet demo flow

Set the wallet experience mode once at build time via the environment variable below. Demo mode is the default.

```bash
export NEXT_PUBLIC_WALLET_MODE=demo # swap to `live` after wiring real providers
```

- UI entry point: `src/components/WalletStub.tsx` (rendered within the wallet demo page).
- Demo-only API routes live under `src/app/api/demo/*` and hard fail when the mode is not `demo`.
- Live stubs are available under `src/app/api/*` (non-demo paths) and currently respond with HTTP 501 until the respective integrations are completed.
- Contract reference for live anchoring: `contracts/PostRegistry.sol`.

### Flip to live checklist

1. Replace the `pretendConnect` logic in `src/components/WalletStub.tsx` with a viem- or ethers-powered connect flow (request accounts, sign SIWE), then call `POST /api/siwe/verify`.
2. Swap `fakeSendTip` usage for one of:
   - Direct on-chain transfer (viem `sendTransaction` or ERC-20 `writeContract`), or
   - A relayer-backed flow via `POST /api/tips/create-intent`, followed by `POST /api/tips/record` once the tx hash is known.
3. Update the UI client calls from `/api/demo/*` to the live `/api/*` endpoints and implement each handler:
   - `src/app/api/tips/*.ts` — payment intents and tx recording.
   - `src/app/api/integrity/*.ts` — proof anchoring and verification.
   - `src/app/api/humanity/*.ts` — WebAuthn registration/assertion plus staking.
4. Deploy `contracts/PostRegistry.sol`, wire `/api/integrity/anchor` to call the contract, and persist receipts.
5. Review the new `src/app/proofs-privacy/page.tsx` copy to ensure the storage policy matches the live deployment.
6. Re-run the QA checklist (below) with `NEXT_PUBLIC_WALLET_MODE=live` to confirm demo code paths no longer execute.

### Manual QA checklist

- [ ] `NEXT_PUBLIC_WALLET_MODE=demo` — Connect button yields a pseudo address, no wallet prompt surfaces.
- [ ] Tip flow — Submitting the modal writes a fake tx hash and appends to recent tips; address persists across refresh via `sessionStorage`.
- [ ] Integrity verify — Demo badge returns `verified: true` and displays the mock hash.
- [ ] Humanity attest — Score and attestation count increment; receipt export surfaces demo JSON.
- [ ] `NEXT_PUBLIC_WALLET_MODE=live` — Demo API calls are rejected; live stubs respond with 501 and UI surfaces the error.
- [ ] Security spot-check — Search for `eth_sendTransaction` / `personal_sign` to confirm they are gated behind live-only branches.
- [ ] Accessibility — Buttons remain keyboard focusable, modals close via Escape, and labels announce state changes.
