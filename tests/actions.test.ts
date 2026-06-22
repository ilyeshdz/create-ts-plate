import { describe, it, expect } from 'vitest';
import { emit } from '@ilyeshdz/ts-plate';
import { buildTree } from '../src/actions.js';

describe('buildTree', () => {
  it('should emit files for oxlint-oxfmt formatter', async () => {
    const tree = buildTree({ name: 'test-proj', formatter: 'oxlint-oxfmt' });
    const outputs = await emit(tree);

    const paths = outputs.map((o) => o.path);
    expect(paths).toContain('test-proj/package.json');
    expect(paths).toContain('test-proj/src/index.ts');
    expect(paths).toContain('test-proj/tests/index.test.ts');
    expect(paths).toContain('test-proj/vitest.config.ts');
    expect(paths).toContain('test-proj/oxlintrc.json');
    expect(paths).toContain('test-proj/.oxfmtrc.json');
    expect(paths).toContain('test-proj/tsconfig.json');
    expect(paths).toContain('test-proj/tsdown.config.ts');
    expect(paths).toContain('test-proj/.gitignore');
    expect(paths).toContain('test-proj/.husky/pre-commit');
    expect(paths).toContain('test-proj/.vscode/settings.json');
    expect(paths).toContain('test-proj/.github/workflows/ci.yml');
    expect(paths).toContain('test-proj/.github/workflows/release.yml');
  });

  it('should emit files for eslint-prettier formatter', async () => {
    const tree = buildTree({ name: 'lint-proj', formatter: 'eslint-prettier' });
    const outputs = await emit(tree);

    const paths = outputs.map((o) => o.path);
    expect(paths).toContain('lint-proj/eslint.config.js');
    expect(paths).toContain('lint-proj/.prettierrc');
    expect(paths).not.toContain('lint-proj/oxlintrc.json');
    expect(paths).not.toContain('lint-proj/.oxfmtrc.json');
    expect(paths).not.toContain('lint-proj/biome.json');
  });

  it('should emit files for biome formatter', async () => {
    const tree = buildTree({ name: 'bio-proj', formatter: 'biome' });
    const outputs = await emit(tree);

    const paths = outputs.map((o) => o.path);
    expect(paths).toContain('bio-proj/biome.json');
    expect(paths).not.toContain('bio-proj/oxlintrc.json');
    expect(paths).not.toContain('bio-proj/.oxfmtrc.json');
    expect(paths).not.toContain('bio-proj/eslint.config.js');
    expect(paths).not.toContain('bio-proj/.prettierrc');
  });

  it('should always include vitest files', async () => {
    const tree = buildTree({ name: 'test-vitest', formatter: 'oxlint-oxfmt' });
    const outputs = await emit(tree);

    const paths = outputs.map((o) => o.path);
    expect(paths).toContain('test-vitest/vitest.config.ts');
    expect(paths).toContain('test-vitest/tests/index.test.ts');
  });

  it('should include test scripts in package.json', async () => {
    const tree = buildTree({ name: 'check-scripts', formatter: 'oxlint-oxfmt' });
    const outputs = await emit(tree);

    const pkgOutput = outputs.find((o) => o.path === 'check-scripts/package.json');
    expect(pkgOutput).toBeDefined();
    if (pkgOutput && pkgOutput.type === 'file') {
      const pkg = JSON.parse(pkgOutput.content as string);
      expect(pkg.scripts.test).toBe('vitest run');
      expect(pkg.scripts['test:watch']).toBe('vitest');
      expect(pkg.devDependencies.vitest).toBeDefined();
    }
  });

  it('should have correct eslint and prettier deps', async () => {
    const tree = buildTree({ name: 'eslint-proj', formatter: 'eslint-prettier' });
    const outputs = await emit(tree);
    const pkgOutput = outputs.find((o) => o.path === 'eslint-proj/package.json');
    expect(pkgOutput).toBeDefined();
    if (pkgOutput && pkgOutput.type === 'file') {
      const pkg = JSON.parse(pkgOutput.content as string);
      expect(pkg.devDependencies.eslint).toBeDefined();
      expect(pkg.devDependencies['@eslint/js']).toBeDefined();
      expect(pkg.devDependencies.prettier).toBeDefined();
    }
  });

  it('should have correct biome deps', async () => {
    const tree = buildTree({ name: 'biome-proj', formatter: 'biome' });
    const outputs = await emit(tree);
    const pkgOutput = outputs.find((o) => o.path === 'biome-proj/package.json');
    expect(pkgOutput).toBeDefined();
    if (pkgOutput && pkgOutput.type === 'file') {
      const pkg = JSON.parse(pkgOutput.content as string);
      expect(pkg.devDependencies['@biomejs/biome']).toBeDefined();
      expect(pkg.scripts.lint).toBe('biome lint .');
      expect(pkg.scripts.fmt).toBe('biome format --write .');
    }
  });
});
