export type BlobPurgeStage = 'CONFIGURATION' | 'DB_CONNECT' | 'DB_QUERY' | 'DB_SCHEMA_CHECK' | 'BLOB_LIST' | 'DB_CLASSIFY' | 'DELETE' | 'PURGE';

export type BlobPurgeDiagnostic = {
  stage: BlobPurgeStage;
  errorClass: string;
  causeClass?: string;
  causeCode?: string;
  code?: string;
  httpStatus?: number;
};

const SAFE_ERROR_CLASSES = new Set([
  'Error', 'TypeError', 'RangeError', 'AggregateError', 'AbortError', 'FetchError', 'SocketError',
  'BlobError', 'PrismaClientInitializationError', 'PrismaClientKnownRequestError',
  'PrismaClientUnknownRequestError', 'PrismaClientRustPanicError', 'PrismaClientValidationError',
  'DatabaseError', 'PostgresError',
]);

const SAFE_ERROR_CODES = new Set([
  'ETIMEDOUT', 'ECONNRESET', 'ECONNREFUSED', 'ENOTFOUND', 'EAI_AGAIN', 'EPROTO', 'EPIPE',
  'ERR_SSL_CERTIFICATE', 'ERR_TLS_CERT_ALTNAME_INVALID', 'CERT_HAS_EXPIRED',
  'DEPTH_ZERO_SELF_SIGNED_CERT', 'UNABLE_TO_VERIFY_LEAF_SIGNATURE',
]);

function isSafeErrorCode(value: unknown): value is string {
  return typeof value === 'string' && (
    SAFE_ERROR_CODES.has(value) || /^P\d{4}$/.test(value) || /^[0-9A-Z]{5}$/.test(value)
  );
}

function getErrorChain(error: unknown): Array<Record<string, unknown>> {
  const chain: Array<Record<string, unknown>> = [];
  let current: unknown = error;
  for (let depth = 0; depth < 4 && current && typeof current === 'object'; depth += 1) {
    const item = current as Record<string, unknown>;
    chain.push(item);
    current = item.cause;
  }
  return chain;
}

function getClassName(chain: Array<Record<string, unknown>>): string {
  for (const item of chain) {
    const candidate = typeof item.name === 'string'
      ? item.name
      : (item.constructor as { name?: unknown } | undefined)?.name;
    if (typeof candidate === 'string' && SAFE_ERROR_CLASSES.has(candidate)) return candidate;
  }
  return 'Error';
}

function getHttpStatus(chain: Array<Record<string, unknown>>): number | undefined {
  for (const item of chain) {
    const status = item.status ?? item.statusCode;
    if (typeof status === 'number' && Number.isInteger(status) && status >= 100 && status <= 599) return status;
  }
  return undefined;
}

function getSafeCode(chain: Array<Record<string, unknown>>): string | undefined {
  for (const item of chain) {
    const code = item.code ?? item.errorCode;
    if (isSafeErrorCode(code)) return code;
  }
  return undefined;
}

function classifyCode(stage: BlobPurgeStage, chain: Array<Record<string, unknown>>, status?: number): string {
  const isDatabase = stage === 'DB_CONNECT' || stage === 'DB_QUERY' || stage === 'DB_SCHEMA_CHECK' || stage === 'DB_CLASSIFY';
  const codes = chain.flatMap((item) => [item.code, item.errorCode]).filter(isSafeErrorCode);
  const messages = chain.map((item) => typeof item.message === 'string' ? item.message : '').join(' ').toLowerCase();

  if (codes.some((code) => ['P2021', 'P2022', '42P01', '42703'].includes(code)) ||
      /(?:table|relation|column).{0,120}(?:does not exist|not found|missing|unknown)/i.test(messages) ||
      /unknown (?:argument|field)|does not have a field named|invalid field/i.test(messages)) {
    return 'ERR_DB_SCHEMA';
  }
  if (isDatabase && ((status === 401 || status === 403) || codes.some((code) => ['P1000', '28P01'].includes(code)) || /password authentication failed|authentication failed|invalid database credentials|credentials? rejected|sasl/i.test(messages))) {
    return 'ERR_DB_AUTH';
  }
  if (!isDatabase && ((status === 401 || status === 403) || /invalid token|token rejected|unauthorized|forbidden|credentials? rejected|authentication failed/i.test(messages))) {
    return 'ERR_BLOB_AUTH';
  }
  if (codes.some((code) => ['ETIMEDOUT', 'P1002', 'P1008', 'P2024', '57014'].includes(code)) || /timed? ?out|timeout/i.test(messages)) {
    return isDatabase ? 'ERR_DB_TIMEOUT' : 'ERR_BLOB_TIMEOUT';
  }
  if (isDatabase && (codes.includes('ECONNREFUSED') || codes.includes('P1001') || /econnrefused|connection refused|connect.*refused|can't reach database server|cannot reach database server/i.test(messages))) {
    return 'ERR_DB_CONNREFUSED';
  }
  if (isDatabase && (codes.includes('ECONNRESET') || codes.includes('P1017') || /connection terminated unexpectedly|server closed the connection|connection reset/i.test(messages))) {
    return 'ERR_DB_CONNRESET';
  }
  if (isDatabase && /database .{0,80}does not exist|unknown database/i.test(messages)) return 'ERR_DB_DATABASE';
  if (isDatabase && /invalid (?:database )?url|connection string is invalid|unsupported protocol/i.test(messages)) return 'ERR_DB_URL';
  if (codes.some((code) => code.startsWith('ERR_SSL') || code.startsWith('CERT_') || ['EPROTO', 'P1011'].includes(code)) || /ssl|tls|certificate/i.test(messages)) {
    return isDatabase ? 'ERR_DB_SSL' : 'ERR_BLOB_SSL';
  }
  if (status !== undefined) return `ERR_HTTP_${status}`;
  if (stage === 'DB_CONNECT' || stage === 'DB_QUERY' || stage === 'DB_SCHEMA_CHECK') return 'ERR_DB_PREFLIGHT';
  return getSafeCode(chain) ?? 'ERR_PURGE_STAGE';
}

export function toBlobPurgeDiagnostic(stage: BlobPurgeStage, error: unknown): BlobPurgeDiagnostic {
  if (error instanceof BlobPurgeStageError) return error.diagnostic;
  const chain = getErrorChain(error);
  const httpStatus = getHttpStatus(chain);
  const cause = chain.length > 1 ? chain[1] : undefined;
  const causeClass = cause ? getClassName(chain.slice(1)) : undefined;
  const causeCode = cause ? getSafeCode([cause]) : undefined;
  return {
    stage,
    errorClass: getClassName(chain),
    ...(causeClass && causeClass !== 'Error' ? { causeClass } : {}),
    ...(causeCode ? { causeCode } : {}),
    code: classifyCode(stage, chain, httpStatus),
    ...(httpStatus === undefined ? {} : { httpStatus }),
  };
}

export class BlobPurgeStageError extends Error {
  readonly diagnostic: BlobPurgeDiagnostic;
  readonly cause: unknown;

  constructor(stage: BlobPurgeStage, error: unknown) {
    super('Blob purge stage failed.', { cause: error });
    this.name = 'BlobPurgeStageError';
    this.cause = error;
    this.diagnostic = toBlobPurgeDiagnostic(stage, error);
  }
}

export function formatBlobPurgeDiagnostic(diagnostic: BlobPurgeDiagnostic): string {
  const fields = [
    `stage=${diagnostic.stage}`,
    `error_class=${diagnostic.errorClass}`,
    `code=${diagnostic.code ?? 'ERR_PURGE_STAGE'}`,
  ];
  if (diagnostic.causeClass) fields.push(`cause_class=${diagnostic.causeClass}`);
  if (diagnostic.causeCode) fields.push(`cause_code=${diagnostic.causeCode}`);
  if (diagnostic.httpStatus !== undefined) fields.push(`http_status=${diagnostic.httpStatus}`);
  return `Blob purge failed. ${fields.join(' ')}`;
}
