/**
 * Shared client setup used by every example.
 *
 * Credentials are read from environment variables (MONIME_SPACE_ID and
 * MONIME_ACCESS_TOKEN). Copy `.env.example` to `.env` and fill in your values,
 * then run an example with a loader that reads `.env`, e.g.:
 *
 *   node --env-file=.env --experimental-strip-types 01-financial-accounts.ts
 *
 * (Node 20.6+ supports `--env-file`; Node 22.6+ can run TypeScript directly
 *  with `--experimental-strip-types`. You can also use `tsx` or `ts-node`.)
 */
import { createClient } from "monime-package";

// The client automatically picks up MONIME_SPACE_ID / MONIME_ACCESS_TOKEN
// from the environment when no options are passed. It throws a helpful error
// if either is missing, so there is nothing else to configure here.
export const client = createClient({});
