# Database schema

The canonical SQL is `frontend/db/schema.sql`. `npm run db:migrate` applies idempotent incremental changes.

## `agents`

Registry cache keyed by a stable `erc8004-{chainId}-{tokenId}` ID. Registry identity and metrics, normalized categories, capabilities, and the BSC testnet ERC-8183 allowlist are refreshed by the sync job. `source_synced_at` records cache freshness.

## `hires`

Application history keyed by a generated hire ID. Important evidence fields are:

- `altana_wallet_address`: passkey smart wallet that owns the session and job.
- `session_public_key`: key used for live Keystore validation.
- `keystore_tx_hash`: optional registration transaction returned by Altana.
- `erc8183_tx_hash` and `erc8183_job_id`: confirmed funded job evidence.
- `revoke_tx_hash`: confirmed revocation evidence.
- `spend_cap` and `expiry_at`: displayed policy terms.

`status` is a cache for filtering. It is not authoritative; API reads derive the visible state from the Keystore and expiry time.
