import { spawnSync } from 'node:child_process';

describe('orphaned assessment Blob purge CLI startup', () => {
  it('loads its module graph and reaches the storage configuration guard without credentials', () => {
    const env = { ...process.env };
    delete env.BLOB_READ_WRITE_TOKEN;
    delete env.DATABASE_URL;

    const result = spawnSync('npm', ['run', 'blob:purge-assessment-orphans'], {
      cwd: process.cwd(),
      env,
      encoding: 'utf8',
    });
    const output = `${result.stdout ?? ''}\n${result.stderr ?? ''}`;

    expect(result.status).toBe(1);
    expect(output).toContain('Required storage configuration is unavailable.');
    expect(output).not.toMatch(/Cannot find module|MODULE_NOT_FOUND/);
  });

  it('loads the shared deletion modules in the QA teardown CLI before validating its arguments', () => {
    const env: NodeJS.ProcessEnv = {
      ...process.env,
      DATABASE_URL: 'postgresql://synthetic:synthetic@invalid.invalid:5432/synthetic',
    };
    delete env.BLOB_READ_WRITE_TOKEN;

    const result = spawnSync('npm', ['run', 'qa:teardown'], {
      cwd: process.cwd(),
      env,
      encoding: 'utf8',
    });
    const output = `${result.stdout ?? ''}\n${result.stderr ?? ''}`;

    expect(result.status).toBe(1);
    expect(output).toContain('QA teardown failed');
    expect(output).not.toMatch(/Cannot find module|MODULE_NOT_FOUND/);
  });
});
