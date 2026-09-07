# UI/UX audit

Audited on 2026-09-07 across the landing page, marketplace, agent detail, dashboard, loading, error, and not-found states.

## Strengths

- The brass, ink, and warm-paper system gives AgentDesk a recognizable identity without relying on common crypto gradients.
- The landing page explains wallet authority, scoped permissions, and funded jobs with real product concepts instead of fabricated metrics.
- Marketplace cards prioritize registry evidence and use consistent tabular formatting for addresses and scores.
- Agent hiring exposes limits, expiry, balances, transaction proofs, recovery, and revoke behavior before or immediately after each consequential action.
- Empty, loading, RPC failure, pending persistence, and orphan-session states all provide a recovery path.

## Improvements completed

- Added a visible pause/resume control to the automatic flow carousel. Hover, keyboard focus, and the operating-system reduced-motion preference also stop movement.
- Made active desktop and mobile navigation visually distinct, including agent detail as part of the marketplace hierarchy.
- Added shareable marketplace query parameters, an accessible search label, result count, selected-filter semantics, and one-action filter reset.
- Reworked the disconnected dashboard from a sparse empty panel into a concise explanation of what opening the permission ledger does and does not authorize.
- Removed inactive revoke controls from ended sessions and separated expired, revoked, and active visual states.
- Added live loading and error semantics, pressed states for duration and category controls, accessible slider naming, and busy states for transaction actions.
- Increased copy-button and duration target sizes and improved small-screen balance layouts.
- Added an observer fallback and no-script rendering fallback so reveal animation cannot leave content permanently invisible.
- Kept error and not-found states inside the persistent product navigation.

## Remaining validation boundary

- Passkey creation, wallet recovery, and transaction approval require manual checks on a supported physical browser and authenticator.
- Final Safari safe-area behavior and the smallest 375 px device class should be checked on real hardware before a production mainnet launch.
- Agent execution and settlement are intentionally outside the current prototype, so their future progress and failure states are not represented yet.
