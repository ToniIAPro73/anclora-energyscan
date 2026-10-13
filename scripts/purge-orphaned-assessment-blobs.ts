import { formatOrphanedBlobPurgeReport } from '../src/lib/orphaned-assessment-blob-purge';
import { getConfiguredBlobPurgeBatchLimit, runOrphanedAssessmentBlobPurge } from '../src/lib/orphaned-assessment-blob-purge-runtime';
import { BlobPurgeStageError, formatBlobPurgeDiagnostic, toBlobPurgeDiagnostic, type BlobPurgeStage } from '../src/lib/blob-purge-diagnostics';

function parseArgs(args: string[]) {
  let apply = false;
  let batchLimit: number | undefined;
  for (let index = 0; index < args.length; index += 1) {
    if (args[index] === '--apply') {
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
  return { apply, batchLimit };
}

async function main() {
  let stage: BlobPurgeStage = 'CONFIGURATION';
  try {
    const { apply, batchLimit } = parseArgs(process.argv.slice(2));
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
    const diagnostic = error instanceof BlobPurgeStageError
      ? error.diagnostic
      : toBlobPurgeDiagnostic(stage, error);
    console.error(formatBlobPurgeDiagnostic(diagnostic));
    process.exitCode = 1;
  }
}

void main();
