import "dotenv/config";

import { spawnSync } from "node:child_process";
import { createRequire } from "node:module";

if (process.env.NODE_ENV === "production") {
  console.error("Refusing to reset the database when NODE_ENV=production.");
  process.exit(1);
}

const require = createRequire(import.meta.url);
const prismaCli = require.resolve("prisma");

function runPrisma(args: string[]) {
  const result = spawnSync(process.execPath, [prismaCli, ...args], {
    stdio: "inherit",
    env: process.env,
  });

  if (result.error) {
    throw result.error;
  }

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

console.log("Resetting the development database...");
runPrisma(["migrate", "reset", "--force", "--skip-seed"]);
console.log("Running the seed...");
runPrisma(["db", "seed"]);
