# Roadmap

## Completed for submission

- Real 8004scan synchronization into Neon
- Passkey-controlled Altana smart wallet
- Onchain session grant and revoke
- Funded ERC-8183 testnet hire
- Server-side proof verification
- Honest registry metrics and explicit testnet costs
- Daily protected synchronization route
- Responsive and accessible core flows

## Production hardening

- Define an authenticated provider endpoint and encrypted session-signer handoff protocol.
- Add wallet-signed API authentication and replay protection.
- Index Keystore and ERC-8183 events instead of reading per dashboard row.
- Add retry/backoff and observability for the registry cron.
- Add evaluator, delivery, approval, and settlement stages for ERC-8183 jobs.
- Add integration tests against a dedicated funded testnet wallet.
- Complete an external security review before considering mainnet.
