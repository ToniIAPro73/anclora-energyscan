/**
 * Initialize the ignored local credentials file for the dedicated QA user.
 * Creates or rotates only the identity declared by PRODUCTION_RUNTIME.md.
 * Never prints the generated password, database URL, or database errors.
 */
import { randomBytes } from 'crypto'
import { closeSync, existsSync, linkSync, openSync, unlinkSync, writeFileSync } from 'fs'
import { resolve } from 'path'

const QA_EMAIL = 'qa.energyscan@anclora.local'
const CREDENTIALS_PATH = resolve(process.cwd(), '.env.qa.local')
const TEMP_PATH = resolve(process.cwd(), '.env.qa.local.bootstrap-tmp')
let stage = 'environment setup'

async function main() {
  if (existsSync(CREDENTIALS_PATH) || existsSync(TEMP_PATH)) {
    throw new Error('A local QA credential target already exists; no account changes made.')
  }

  const { loadEnvConfig } = await import('@next/env')
  loadEnvConfig(process.cwd())

  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is unavailable; no changes made.')
  }

  stage = 'module initialization'
  const { prisma } = await import('../../src/lib/prisma')
  const { hashPassword } = await import('../../src/lib/password')
  const password = randomBytes(32).toString('base64url')
  stage = 'password hashing'
  const passwordHash = await hashPassword(password)
  const content = `QA_EMAIL=${QA_EMAIL}\nQA_PASSWORD=${password}\n`
  let descriptor: number | undefined
  let createdCredentialFile = false

  try {
    stage = 'local file creation'
    // wx prevents overwriting any pre-existing credential file or bootstrap temp file.
    descriptor = openSync(TEMP_PATH, 'wx', 0o600)
    writeFileSync(descriptor, content, { encoding: 'utf8' })
    closeSync(descriptor)
    descriptor = undefined

    // Reserve the final path before changing the password. linkSync fails safely
    // if another process creates the target after the initial existence check.
    stage = 'local file finalization'
    linkSync(TEMP_PATH, CREDENTIALS_PATH)
    createdCredentialFile = true
    unlinkSync(TEMP_PATH)

    stage = 'QA identity bootstrap'
    await prisma.user.upsert({
      where: { email: QA_EMAIL },
      create: { email: QA_EMAIL, name: 'EnergyScan QA', passwordHash },
      update: { passwordHash },
      select: { id: true },
    })

    console.log('Local QA credentials initialized for the contract identity; secret not displayed.')
  } catch (error: unknown) {
    if (descriptor !== undefined) closeSync(descriptor)
    try { unlinkSync(TEMP_PATH) } catch { /* no temp file to remove */ }
    if (createdCredentialFile) {
      try { unlinkSync(CREDENTIALS_PATH) } catch { /* no finalized credential to remove */ }
    }
    const detail = error instanceof Error && error.message.includes('EEXIST')
        ? 'A local QA credential target already exists; it was not overwritten.'
        : 'Database operation or local file operation failed.'
    if (error instanceof Error && !error.message.includes('EEXIST')) {
      const code = (error as NodeJS.ErrnoException & { code?: string }).code
      console.error(`Bootstrap failure category: ${error.name}${code ? ` (${code})` : ''}`)
    }
    throw new Error(detail)
  } finally {
    await prisma.$disconnect()
  }
}

main().catch((error: unknown) => {
  const message = error instanceof Error && error.message.includes('DATABASE_URL')
    ? 'QA credential bootstrap stopped because DATABASE_URL is unavailable.'
    : error instanceof Error && error.message.includes('already exists')
      ? 'QA credential bootstrap stopped because the local credential target already exists; it was not overwritten.'
      : 'QA credential bootstrap failed; inspect configuration without printing secrets.'
  console.error(message)
  if (error instanceof Error && message.includes('failed')) {
    const code = (error as NodeJS.ErrnoException & { code?: string }).code
    console.error(`Failure category: ${error.name}${code ? ` (${code})` : ''}; stage: ${stage}`)
  }
  process.exitCode = 1
})
