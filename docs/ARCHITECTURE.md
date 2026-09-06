# Architecture

## Components

```text
8004scan API -> sync job -> Neon agents table -> Next.js marketplace
                                               |
Browser passkey -> Altana smart wallet -> BSC testnet
                    |                    |-> Altana Keystore
                    |                    `-> ERC-8183 Commerce
                    `-> proof payload -> Next.js API -> verify chain -> Neon hires table
```

The browser performs every signing operation. The server never receives a private key or passkey credential.

## Sources of truth

- **Agent discovery:** 8004scan is upstream; Neon is a query cache.
- **Session validity:** Altana Keystore is authoritative; the dashboard checks it on each read.
- **Hire state:** ERC-8183 Commerce plus the confirmed transaction receipt.
- **Application history:** Neon links an Altana wallet, session public key, agent, job ID, and proof hashes.

## Hire sequence

1. The browser creates or recovers an Altana passkey smart wallet.
2. `grantSession` generates a session key and registers its cap, allowlist, and expiry.
3. `hireErc8183Agent` creates and funds a 0.1 test $U job.
4. The browser submits both proofs and the session public key to `POST /api/hire`.
5. The server checks address formats, receipt success, Keystore validity, job client/provider, and FUNDED state.
6. Only verified evidence is persisted.

## Revoke sequence

1. The passkey wallet calls `revokeSession` with the session public key.
2. The browser sends the confirmed revoke hash to the API.
3. The API verifies the receipt and confirms that the Keystore key is invalid.
4. Neon records the revoke hash and cached status.

## Deployment

Deploy `frontend` as the Vercel project root. Configure `DATABASE_URL`, `CRON_SECRET`, and optionally `AGENTSCAN_API_KEY`, `BSC_TESTNET_RPC_URL`, and `NEXT_PUBLIC_SITE_URL`. `vercel.json` triggers the protected registry sync route daily at 01:00 UTC.
