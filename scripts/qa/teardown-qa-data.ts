/** Explicit, fail-closed teardown for the persistent QA identity. */
import { isAbsolute, relative, resolve } from 'path'

const QA_EMAIL = 'qa.energyscan@anclora.local'
type Deps = { prisma: any; deleteStoredAttachment: (path: string) => Promise<unknown> }

type Options = { mode: 'assessments' | 'attachments' | 'identity'; ids: string[]; apply: boolean; confirm?: string }

function parseArgs(args: string[]): Options {
  const result: Options = { mode: 'assessments', ids: [], apply: false }
  let identityMode = false
  let attachmentsMode = false
  for (let i = 0; i < args.length; i++) {
    const arg = args[i]
    if (arg === '--assessment-id' || arg === '--attachments-only' || arg === '--confirm') {
      const value = args[++i]
      if (!value || value.startsWith('--')) throw new Error('An explicit identifier is required.')
      if (arg === '--confirm') result.confirm = value
      else {
        if (arg === '--attachments-only') attachmentsMode = true
        result.ids.push(value)
      }
    } else if (arg === '--delete-identity') identityMode = true
    else if (arg === '--apply') result.apply = true
    else throw new Error('Unsupported teardown option.')
  }
  if (identityMode && (attachmentsMode || result.ids.length)) throw new Error('Choose one teardown mode.')
  if (!identityMode && !result.ids.length) throw new Error('An explicit assessment ID or identity mode is required.')
  if (attachmentsMode && result.ids.length !== 1) throw new Error('Attachments-only mode accepts one assessment ID.')
  if (result.confirm && !identityMode) throw new Error('Confirmation is only valid for identity teardown.')
  if (identityMode) result.mode = 'identity'
  else result.mode = attachmentsMode ? 'attachments' : 'assessments'
  return result
}

function validateStoragePath(value: string, assessmentId: string, userId: string) {
  if (value.startsWith('blob:')) {
    const path = value.slice(5)
    if (!path || path.startsWith('/') || path.split('/').includes('..') ||
      !(path.startsWith(`assessments/${assessmentId}/`) || path.startsWith(`assessment-drafts/${userId}/`))) {
      throw new Error('Unexpected attachment storage path; teardown aborted.')
    }
    return
  }
  const root = resolve(process.cwd(), 'uploads', 'assessments', assessmentId)
  const resolved = resolve(value)
  const rel = relative(root, resolved)
  if (!isAbsolute(value) || rel.startsWith('..') || isAbsolute(rel)) throw new Error('Unexpected attachment storage path; teardown aborted.')
}

async function attachmentRecords(tx: any, assessmentIds: string[]) {
  return tx.assessmentAttachment.findMany({ where: { assessmentId: { in: assessmentIds } }, select: { id: true, assessmentId: true, path: true } }) as Promise<Array<{id:string; assessmentId:string; path:string}>>
}

async function countSnapshot(tx: any, assessmentIds: string[], attachmentIds: string[], userId: string, includeUser = false) {
  const assessmentWhere = assessmentIds.length ? { id: { in: assessmentIds } } : { userId }
  const attachmentWhere = assessmentIds.length ? { assessmentId: { in: assessmentIds } } : { assessment: { userId } }
  const count = async (model: string, where: unknown) => Number(await tx[model].count({ where }))
  const values: Record<string, number> = {
    assessments: await count('assessment', assessmentWhere),
    attachments: await count('assessmentAttachment', attachmentWhere),
    attachmentAnalyses: await count('attachmentAnalysis', attachmentIds.length ? { attachmentId: { in: attachmentIds } } : assessmentIds.length ? { attachment: { assessmentId: { in: assessmentIds } } } : { attachment: { assessment: { userId } } }),
  }
  if (includeUser) values.users = await count('user', { id: userId })
  if (!assessmentIds.length) {
    for (const [label, model] of Object.entries({ accounts:'account', sessions:'session', passwordResetTokens:'passwordResetToken', leads:'lead', emailLogs:'emailLog', analyticsEvents:'analyticsEventLog', providerAccounts:'providerAccount', professionalBranding:'professionalBranding', budgetReviews:'budgetReview' })) values[label] = await count(model, { userId })
  }
  return values
}

async function deleteAssessmentRows(tx: any, assessmentIds: string[], attachmentIds: string[]) {
  const assessmentWhere = { assessmentId: { in: assessmentIds } }
  const runs = await tx.estimateRun.findMany({ where: assessmentWhere, select: { id: true } })
  const runIds = runs.map((r: {id:string}) => r.id)
  // Explicit child rows first; no cascade is relied upon for the teardown contract.
  if (attachmentIds.length) await tx.attachmentAnalysis.deleteMany({ where: { attachmentId: { in: attachmentIds } } })
  await tx.energyCertificate.deleteMany({ where: assessmentWhere })
  await tx.rehabBudget.deleteMany({ where: assessmentWhere })
  await tx.cadastralRecord.deleteMany({ where: assessmentWhere })
  await tx.dataFieldSource.deleteMany({ where: assessmentWhere })
  await tx.checkoutRecovery.deleteMany({ where: assessmentWhere })
  if (runIds.length) await tx.estimateLine.deleteMany({ where: { estimateRunId: { in: runIds } } })
  await tx.estimateRun.deleteMany({ where: assessmentWhere })
  await tx.lead.deleteMany({ where: assessmentWhere })
  await tx.analyticsEventLog.deleteMany({ where: assessmentWhere })
  await tx.emailLog.deleteMany({ where: assessmentWhere })
  await tx.assessmentAttachment.deleteMany({ where: { id: { in: attachmentIds } } })
  await tx.assessment.deleteMany({ where: { id: { in: assessmentIds } } })
}

export async function runQaTeardown(args: string[], deps: Deps): Promise<string> {
  const options = parseArgs(args)
  const user = await deps.prisma.user.findUnique({ where: { email: QA_EMAIL }, select: { id: true } })
  if (!user) throw new Error('Contract QA identity is unavailable; teardown aborted.')
  if (options.mode === 'identity' && options.confirm !== user.id) throw new Error('Identity confirmation does not match; teardown aborted.')

  let assessments: Array<{id:string; userId?:string|null}>
  if (options.mode === 'identity') assessments = await deps.prisma.assessment.findMany({ where: { userId: user.id }, select: { id: true, userId: true } })
  else {
    assessments = await deps.prisma.assessment.findMany({ where: { id: { in: Array.from(new Set(options.ids)) }, userId: user.id }, select: { id: true, userId: true } })
    if (assessments.length !== new Set(options.ids).size) throw new Error('Assessment is not owned by QA identity or does not exist; teardown aborted.')
  }
  const assessmentIds = assessments.map((a) => a.id)
  if (options.mode === 'identity') {
    const foreign = await deps.prisma.assessment.count({ where: { id: { in: assessmentIds }, userId: { not: user.id } } })
    if (foreign) throw new Error('Unexpected ownership state; teardown aborted.')
  }
  const attachments = await deps.prisma.assessmentAttachment.findMany({ where: { assessmentId: { in: assessmentIds } }, select: { id: true, assessmentId: true, path: true } })
  for (const attachment of attachments) validateStoragePath(attachment.path, attachment.assessmentId, user.id)
  const counts = await countSnapshot(deps.prisma, assessmentIds, attachments.map((a: {id:string}) => a.id), user.id, options.mode === 'identity')
  const format = (items: Record<string, number>) => Object.entries(items).map(([k,v]) => `${k}: ${v}`).join('\n')
  if (!options.apply) return `DRY RUN — no changes made\n${format(counts)}`

  // Blob is external to PostgreSQL; delete objects inside the DB transaction callback and before row mutations.
  try {
    await deps.prisma.$transaction(async (tx: any) => {
      const current = await attachmentRecords(tx, assessmentIds)
      for (const item of current) validateStoragePath(item.path, item.assessmentId, user.id)
      try { for (const item of current) await deps.deleteStoredAttachment(item.path) }
      catch { throw new Error('Blob deletion failed; database rows were not deleted.') }
      if (options.mode === 'attachments') {
        await tx.attachmentAnalysis.deleteMany({ where: { attachmentId: { in: current.map((a) => a.id) } } })
        await tx.energyCertificate.deleteMany({ where: { assessmentId: { in: assessmentIds }, attachmentId: { in: current.map((a) => a.id) } } })
        await tx.rehabBudget.deleteMany({ where: { assessmentId: { in: assessmentIds }, attachmentId: { in: current.map((a) => a.id) } } })
        await tx.assessmentAttachment.deleteMany({ where: { id: { in: current.map((a) => a.id) } } })
      } else {
        await deleteAssessmentRows(tx, assessmentIds, attachments.map((a: {id:string}) => a.id))
        if (options.mode === 'identity') {
          for (const model of ['account','session','passwordResetToken','lead','emailLog','analyticsEventLog','providerAccount','professionalBranding','budgetReview']) await tx[model].deleteMany({ where: { userId: user.id } })
          await tx.user.deleteMany({ where: { id: user.id, email: QA_EMAIL } })
        }
      }
      const after = options.mode === 'attachments'
        ? { attachments: await tx.assessmentAttachment.count({ where: { assessmentId: { in: assessmentIds } } }), attachmentAnalyses: await tx.attachmentAnalysis.count({ where: { attachment: { assessmentId: { in: assessmentIds } } } }) }
        : await countSnapshot(tx, options.mode === 'identity' ? [] : assessmentIds, [], user.id, options.mode === 'identity')
      const nonzero = Object.entries(after).filter(([, n]) => n !== 0)
      if (nonzero.length) throw new Error('Post-delete verification failed; transaction rolled back.')
    }, { isolationLevel: 'Serializable' })
  } catch (error) {
    if (error instanceof Error && error.message.includes('Blob')) throw new Error('Blob deletion failed; database rows were not deleted.')
    throw error
  }
  const verified: Record<string, number> = Object.fromEntries(Object.keys(counts).map((k) => [k, 0]))
  return `APPLIED — VERIFIED ZERO\n${format(verified)}`
}

async function main() {
  const { loadEnvConfig } = await import('@next/env')
  loadEnvConfig(process.cwd())
  if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL unavailable.')
  const [{ prisma }, { deleteStoredAttachment }] = await Promise.all([import('../../src/lib/prisma'), import('../../src/lib/blob-storage')])
  try { console.log(await runQaTeardown(process.argv.slice(2), { prisma, deleteStoredAttachment })) }
  finally { await prisma.$disconnect() }
}

if (process.argv[1] && resolve(process.argv[1]) === resolve(__filename)) {
  main().catch(() => { console.error('QA teardown failed; no secrets or database details are displayed.'); process.exitCode = 1 })
}
