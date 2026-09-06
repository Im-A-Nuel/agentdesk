# Requirements

## Delivered MVP

- [x] Discover BSC testnet ERC-8004 agents in four semantic categories.
- [x] Display registry-derived descriptions, scores, feedbacks, validations, and ownership.
- [x] Create or recover a passkey-controlled Altana wallet.
- [x] Display wallet address plus test BNB and test $U balances.
- [x] Claim Altana test $U and link to a public test BNB faucet.
- [x] Require a finite duration and user-selected test $U cap.
- [x] Register a scoped Altana session and return its real transaction hash.
- [x] Create and fund an ERC-8183 job with 0.1 test $U.
- [x] Reject unconfirmed or mismatched onchain evidence at the API boundary.
- [x] Re-read Keystore state on the dashboard.
- [x] Revoke a session onchain and verify the result before recording it.
- [x] Provide loading, error, empty, keyboard-focus, and responsive states.

## Constraints

- Chain ID is fixed to BNB Smart Chain testnet (`97`).
- The demo requires a browser with passkey support.
- A complete transaction demo requires faucet-funded test BNB.
- Mainnet deployment, autonomous agent execution, settlement, and dispute evaluation are outside the MVP.
