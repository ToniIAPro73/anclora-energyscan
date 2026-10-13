import { formatOrphanedBlobPurgeReport } from '../src/lib/orphaned-assessment-blob-purge';
import { getConfiguredBlobPurgeBatchLimit, runOrphanedAssessmentBlobPurge } from '../src/lib/orphaned-assessment-blob-purge-runtime';
import { formatBlobPurgeDiagnostic, isBlobPurgeStageError, toBlobPurgeDiagnostic, type BlobPurgeStage } from '../src/lib/blob-purge-diagnostics';

function parseArgs(args: string[]) {
  let apply = false;
  let checkDb = false;
  let batchLimit: number | undefined;
  for (let index = 0; index < args.length; index += 1) {
    if (args[index] === '--check-db') {
      checkDb = true;
    } else if (args[index] === '--apply') {
      apply = true;
    } else if (args[index] === '--batch-limit') {
      const raw = args[index + 1];
      const parsed = Number(raw);
      if (!raw || !Number.isSafeInteger(parsed)) throw new Error('Batch limit is invalid.');
      batchLimit = parsed;
      index += 1;
    } else {
      throw new Error('Unsupported purge option.');
    }
  }
  if (checkDb && (apply || batchLimit !== undefined)) throw new Error('Database check cannot be combined with purge options.');
  return { apply, batchLimit, checkDb };
}

async function main() {
  let stage: BlobPurgeStage = 'CONFIGURATION';
  try {
    const { apply, batchLimit, checkDb } = parseArgs(process.argv.slice(2));
    if (checkDb) {
      if (!process.env.DATABASE_URL) {
        console.error('Required database configuration is unavailable.');
        process.exitCode = 1;
        return;
      }
      const configuredBatchLimit = getConfiguredBlobPurgeBatchLimit();
      stage = 'DB_CONNECT';
      await runOrphanedAssessmentBlobPurge({ checkOnly: true, batchLimit: configuredBatchLimit });
      console.log('Database check passed (DB_CONNECT).');
      return;
    }
    if (!process.env.BLOB_READ_WRITE_TOKEN || !process.env.DATABASE_URL) {
      console.error('Required storage configuration is unavailable.');
      process.exitCode = 1;
      return;
    }

    const configuredBatchLimit = batchLimit ?? getConfiguredBlobPurgeBatchLimit();
    stage = 'DB_CONNECT';
    const result = await runOrphanedAssessmentBlobPurge(
      { apply, batchLimit: configuredBatchLimit },
      undefined,
      (diagnostic) => console.error(formatBlobPurgeDiagnostic(diagnostic)),
    );
    console.log(formatOrphanedBlobPurgeReport(result, apply));
    if (result.failed > 0) process.exitCode = 1;
  } catch (error) {
    const diagnostic = isBlobPurgeStageError(error)
      ? error.diagnostic
      : toBlobPurgeDiagnostic(stage, error);
    console.error(formatBlobPurgeDiagnostic(diagnostic));
    process.exitCode = 1;
  }
}

void main();
