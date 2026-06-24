/**
 * Phase 1.5 placeholder seed.
 *
 * The seed STRATEGY is defined in PHASE-1-DOMAIN-MODEL.md (§6):
 *   1. Admin user(s)  — upsert by email, credentials from env.
 *   2. Categories     — upsert a fixed bilingual set.
 *   3. Products       — upsert a small bilingual set per category.
 *
 * Implementation is intentionally deferred — no database writes happen in
 * this phase. This file exists only so `prisma db seed` is wired and boots.
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main(): Promise<void> {
  // TODO (later phase): idempotent upserts per the strategy above.
  console.log('[seed] placeholder — no data written (Phase 1.5).');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
