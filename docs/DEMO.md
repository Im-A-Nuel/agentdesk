# Demo runbook

## Preparation

1. Set `DATABASE_URL` in `frontend/.env.local`.
2. Run `npm run db:seed` from `frontend`.
3. Run `npm run dev` and open the printed local URL.
4. Confirm the marketplace displays synchronized agents.

## Onchain demo

1. Open an agent and select **Open Altana wallet**.
2. Approve passkey creation or recovery.
3. Copy the wallet address.
4. Use the linked BNB testnet faucet to send test BNB to that address.
5. Return to the agent page and claim test $U.
6. Select a spend cap and duration, then start the hire.
7. Approve the session registration and funded job transactions.
8. Open the Keystore and ERC-8183 hashes in BscScan.
9. Open **Dashboard**, choose the active session, and revoke it.
10. Confirm the revoke hash and refreshed Keystore status.

## Troubleshooting

- **Passkey prompt cancelled:** run the action again and approve the browser prompt.
- **Insufficient funds:** fund the displayed Altana wallet address, not an injected wallet address.
- **Registry empty:** verify `DATABASE_URL`, then run `npm run sync:agents`.
- **Cron unauthorized:** set `CRON_SECRET`; Vercel sends it as a bearer token to cron routes.
- **RPC error:** retry or set `BSC_TESTNET_RPC_URL` to a reliable chain ID 97 endpoint.
