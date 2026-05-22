/**
 * Idempotent script: preserve admin user, delete all others, seed demo requests.
 *
 * Run: ts-node --compiler-options '{"module":"commonjs"}' scripts/reset-admin-demo-data.ts
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const ADMIN_EMAIL = (process.env.ADMIN_EMAILS || '').split(',').map((e) => e.trim().toLowerCase()).filter(Boolean)[0] || 'pmi140979@gmail.com';

async function main() {
  console.log(`Admin email: ${ADMIN_EMAIL}`);

  // 1. Ensure admin user exists (do NOT delete or modify)
  const adminUser = await prisma.user.findUnique({ where: { email: ADMIN_EMAIL } });
  if (!adminUser) {
    console.warn(`⚠️  Admin user ${ADMIN_EMAIL} not found. Skipping user cleanup to avoid accidental data loss.`);
  } else {
    console.log(`✓ Admin user found: ${adminUser.id}`);

    // 2. Delete all non-admin users (cascade handles sessions, accounts, assessments)
    const deleted = await prisma.user.deleteMany({
      where: { email: { not: ADMIN_EMAIL } },
    });
    console.log(`✓ Deleted ${deleted.count} non-admin user(s)`);
  }

  // 3. Delete all professional access requests
  await prisma.professionalAccessRequest.deleteMany({});
  console.log('✓ Cleared ProfessionalAccessRequest table');

  // 4. Delete all providers (cascade handles ProviderAccount, leads, credit ledger, subscriptions)
  await prisma.provider.deleteMany({});
  console.log('✓ Cleared Provider table');

  // 5. Create demo professional access requests
  const professionalRequests = [
    { name: 'Juan', email: 'toni.ballesteros.73@gmail.com', status: 'PENDING' },
    { name: 'Pepe', email: 'supertoniia@gmail.com', status: 'PENDING' },
  ];
  for (const req of professionalRequests) {
    await prisma.professionalAccessRequest.create({ data: req });
    console.log(`✓ Created ProfessionalAccessRequest: ${req.name} <${req.email}>`);
  }

  // 6. Create demo providers
  const providers = [
    { name: 'Luis', email: 'tonitonib.2018@gmail.com', categories: 'Solar', zones: 'Madrid', status: 'PENDING' },
    { name: 'Carlos', email: 'antonio@anclora.com', categories: 'Solar', zones: 'Barcelona', status: 'PENDING' },
  ];
  for (const p of providers) {
    await prisma.provider.create({ data: p });
    console.log(`✓ Created Provider: ${p.name} <${p.email}>`);
  }

  console.log('\n✅ Done. DB reset to demo state.');
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
