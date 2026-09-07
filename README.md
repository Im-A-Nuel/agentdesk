# AgentDesk

AgentDesk is a discovery-to-hire marketplace for ERC-8004 agents on BNB Smart Chain testnet. It synchronizes real registry records from 8004scan, creates a passkey-controlled Altana smart wallet, grants a scoped session in the Altana Keystore, and funds an ERC-8183 job with test $U.

## What is real

- Agent identity, descriptions, scores, feedback counts, and validations come from 8004scan.
- Session registration and revocation are confirmed against the Altana Keystore on chain ID 97.
- Each hire is verified from its BSC testnet receipt and ERC-8183 job state before Neon stores it.
- The dashboard re-reads Keystore validity instead of trusting its cached status.
- No fake agents, fake transaction hashes, or fabricated usage metrics are used at runtime.

## Stack

- Next.js 16, React 19, TypeScript, Tailwind CSS 4
- Altana SDK 0.7.1 and viem
- ERC-8004 discovery through 8004scan
- Neon serverless Postgres
- Vercel cron for daily registry synchronization

## Local setup

```bash
cd frontend
npm install
cp .env.example .env.local
npm run db:seed
npm run dev
```

`db:seed` is intentionally non-fictional: it applies migrations and synchronizes live registry data. Set `DATABASE_URL` first.

## Validate

```bash
npm run typecheck
npm run build
```

## Demo flow

1. Open an agent from the marketplace.
2. Create or recover the Altana passkey wallet.
3. Copy its address and fund it with test BNB.
4. Claim test $U from the agent page.
5. Choose a daily limit and duration, then grant and fund the job.
6. Open both hashes in BscScan.
7. Open the dashboard and revoke the session onchain.

The fixed demo job budget is 0.1 test $U. AgentDesk charges no platform fee.

The current prototype does not deliver the private session signer to a provider process. It proves
the permission lifecycle and funded ERC-8183 hire, not autonomous execution or settlement.

## Documentation

- `docs/ARCHITECTURE.md`
- `docs/REQUIREMENTS.md`
- `docs/SCHEMA.md`
- `docs/ROADMAP.md`
- `docs/DEMO.md`
- `frontend/DESIGN.md`

## Repository policy

This is a solo hackathon repository. Commits use the owner's configured Git identity and do not include automated co-author attribution.
