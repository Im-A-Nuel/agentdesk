import { syncAgents } from "../src/lib/sync-agents.ts";
syncAgents()
  .then((agents) => console.log(`Synced ${agents.length} agents from 8004scan.`))
  .catch((error) => { console.error(error instanceof Error ? error.message : error); process.exit(1); });
