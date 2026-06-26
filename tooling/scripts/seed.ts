/**
 * Main seed orchestrator. Runs all seeders in dependency order:
 *   1. catalog (genres, studios, shelves) — all envs
 *   2. admin (superadmin user) — local + staging only
 *   3. anime (sample entries) — local + staging only
 *
 * Usage: pnpm db:seed
 */
import { main as seedCatalog } from "./seed-catalog";
import { main as seedAdmin } from "./seed-admin";
import { main as seedAnime } from "./seed-anime";

async function main() {
  console.log("[seed] orchestrator started");
  await seedCatalog();
  await seedAdmin();
  await seedAnime();
  console.log("[seed] orchestrator done");
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("[seed] failed:", err);
    process.exit(1);
  });
