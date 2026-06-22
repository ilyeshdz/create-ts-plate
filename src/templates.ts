export type FormatterChoice = 'oxlint-oxfmt' | 'eslint-prettier' | 'biome';

export function scaffoldSrc(name: string) {
  return `#!/usr/bin/env node
import { file, emit, write } from '@ilyeshdz/ts-plate';

const arg = process.argv[2] || '${name}';

async function main() {
  const tree = file('hello.txt', \`Hello from \${arg}!\`);
  const outputs = await emit(tree);
  await write(outputs);
  console.log(\`Created \${arg}\`);
}

main().catch(console.error);
`;
}

export const githubCiYml = (fmt: FormatterChoice) => {
  const checkSteps: string[] = [];
  if (fmt === 'oxlint-oxfmt') {
    checkSteps.push('pnpm lint', 'pnpm fmt:check', 'pnpm test', 'pnpm build');
  } else if (fmt === 'eslint-prettier') {
    checkSteps.push('pnpm lint', 'pnpm fmt:check', 'pnpm test', 'pnpm build');
  } else {
    checkSteps.push('pnpm lint', 'pnpm fmt:check', 'pnpm test', 'pnpm build');
  }
  const steps = checkSteps.map((s) => `      - run: ${s}`).join('\n');
  return `name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  check:
    runs-on: ubuntu-latest
    steps:
       - uses: actions/checkout@v5
      - uses: pnpm/action-setup@v5
      - uses: actions/setup-node@v5
        with:
          node-version: 22
          cache: pnpm
      - run: pnpm install --frozen-lockfile
${steps}
`;
};

export const githubReleaseYml = `name: Release

on:
  push:
    tags:
      - 'v*'

jobs:
  release:
    runs-on: ubuntu-latest
    permissions:
      contents: write
      id-token: write
    steps:
      - uses: actions/checkout@v5
        with:
          fetch-depth: 0
      - name: Configure Git
        run: |
          git config user.name "github-actions[bot]"
          git config user.email "github-actions[bot]@users.noreply.github.com"
      - uses: pnpm/action-setup@v5
      - uses: actions/setup-node@v5
        with:
          node-version: 22
          cache: pnpm
      - run: pnpm install --frozen-lockfile
      - run: pnpm build
      - name: Create GitHub Release from changelog
        run: |
          sed -n '/^## v/,/^## v/p' CHANGELOG.md | sed '$d' > .release-notes.md
          gh release create "\${{ github.ref_name }}" --notes-file .release-notes.md
        env:
          GITHUB_TOKEN: \${{ secrets.GITHUB_TOKEN }}
`;

export const oxlintrcJson = JSON.stringify(
  {
    $schema:
      'https://raw.githubusercontent.com/oxc-project/oxc/refs/heads/master/crates/oxc_linter/schema/oxlintrc.schema.json',
    rules: {
      'no-console': 'warn',
      'no-unused-vars': 'warn',
      eqeqeq: 'error',
      'no-undef': 'error',
    },
  },
  null,
  2,
);

export const oxfmtrcJson = JSON.stringify(
  {
    $schema: './node_modules/oxfmt/configuration_schema.json',
    ignorePatterns: ['pnpm-lock.yaml'],
    singleQuote: true,
  },
  null,
  2,
);

export const eslintConfig = `import js from '@eslint/js';

export default [
  js.configs.recommended,
  {
    rules: {
      'no-console': 'warn',
      'no-unused-vars': 'warn',
      eqeqeq: 'error',
      'no-undef': 'error',
    },
  },
];
`;

export const prettierrc = JSON.stringify(
  {
    semi: true,
    singleQuote: true,
    trailingComma: 'all',
    printWidth: 100,
    tabWidth: 2,
  },
  null,
  2,
);

export const biomeJson = JSON.stringify(
  {
    $schema: 'https://biomejs.dev/schemas/1.9.4/schema.json',
    vcs: { enabled: true, clientKind: 'git', useIgnoreFile: true },
    formatter: { enabled: true, indentStyle: 'space', lineWidth: 100 },
    linter: { enabled: true, rules: { recommended: true } },
    javascript: { formatter: { quoteStyle: 'single', semicolons: 'always' } },
    files: { ignore: ['pnpm-lock.yaml', 'dist'] },
  },
  null,
  2,
);

export const tsconfigJson = JSON.stringify(
  {
    compilerOptions: {
      strict: true,
      target: 'ESNext',
      module: 'ESNext',
      moduleResolution: 'bundler',
      outDir: 'dist',
      rootDir: 'src',
      declaration: true,
    },
    include: ['src'],
  },
  null,
  2,
);

export const tsdownConfig = `import { defineConfig } from 'tsdown'

export default defineConfig({
  dts: false,
  exports: true,
  format: 'esm',
  target: 'node18',
  platform: 'node',
})
`;

export const vitestConfig = `import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['tests/**/*.test.ts'],
  },
});
`;

export const scaffoldTestFile = `import { describe, it, expect } from 'vitest';
import { file, emit } from '@ilyeshdz/ts-plate';

describe('my-cli', () => {
  it('should emit a hello file', async () => {
    const tree = file('hello.txt', 'Hello World');
    const outputs = await emit(tree);
    expect(outputs).toHaveLength(1);
    expect(outputs[0].type).toBe('file');
    if (outputs[0].type === 'file') {
      expect(outputs[0].content).toBe('Hello World');
    }
  });
});
`;

export const vscodeSettings = JSON.stringify(
  { 'js/ts.tsdk.path': 'node_modules/typescript/lib' },
  null,
  2,
);

export function buildPackageJson(name: string, formatter: FormatterChoice) {
  const scripts: Record<string, string> = {
    build: 'tsdown',
    dev: 'tsdown --watch',
    test: 'vitest run',
    'test:watch': 'vitest',
    release: 'changelogen --release',
    'release:minor': 'changelogen --release --minor',
    'release:major': 'changelogen --release --major',
    'release:patch': 'changelogen --release --patch',
    prepare: 'husky',
  };

  const lintStaged: Record<string, string[]> = {};

  const deps: Record<string, string> = {
    '@ilyeshdz/ts-plate': '^0.5.1',
    inquirer: '^12.0.0',
    listr: '^0.14.3',
  };

  const devDeps: Record<string, string> = {
    '@types/listr': '^0.14.10',
    changelogen: '^0.6.0',
    husky: '^9.0.0',
    'lint-staged': '^17.0.0',
    tsdown: '^0.22.0',
    typescript: '^6.0.3',
    vitest: '^3.0.0',
  };

  if (formatter === 'oxlint-oxfmt') {
    scripts.lint = 'oxlint .';
    scripts['lint:fix'] = 'oxlint --fix .';
    scripts.fmt = 'oxfmt .';
    scripts['fmt:check'] = 'oxfmt --check .';
    scripts.check = 'oxlint . && oxfmt --check . && vitest run && tsdown';
    lintStaged['*.{js,ts,jsx,tsx,mjs,mts,cjs,cts}'] = ['oxlint --fix', 'oxfmt'];
    lintStaged['*.{json,md,yaml}'] = ['oxfmt'];
    devDeps.oxfmt = '^0.55.0';
    devDeps.oxlint = '^1.70.0';
  } else if (formatter === 'eslint-prettier') {
    scripts.lint = 'eslint .';
    scripts['lint:fix'] = 'eslint --fix .';
    scripts.fmt = 'prettier --write .';
    scripts['fmt:check'] = 'prettier --check .';
    scripts.check = 'eslint . && prettier --check . && vitest run && tsdown';
    lintStaged['*.{js,ts,jsx,tsx,mjs,mts,cjs,cts}'] = ['eslint --fix', 'prettier --write'];
    lintStaged['*.{json,md,yaml}'] = ['prettier --write'];
    devDeps.eslint = '^9.0.0';
    devDeps['@eslint/js'] = '^9.0.0';
    devDeps.prettier = '^3.0.0';
  } else {
    scripts.lint = 'biome lint .';
    scripts['lint:fix'] = 'biome lint --write .';
    scripts.fmt = 'biome format --write .';
    scripts['fmt:check'] = 'biome format --check .';
    scripts.check = 'biome check . && vitest run && tsdown';
    lintStaged['*.{js,ts,jsx,tsx,mjs,mts,cjs,cts}'] = [
      'biome lint --write',
      'biome format --write',
    ];
    lintStaged['*.{json,md,yaml}'] = ['biome format --write'];
    devDeps['@biomejs/biome'] = '^1.9.0';
  }

  const pkg: Record<string, unknown> = {
    name,
    type: 'module',
    version: '0.0.1',
    description: 'CLI scaffolded with create-ts-plate',
    bin: { [name]: './dist/index.mjs' },
    exports: {
      '.': './dist/index.mjs',
      './package.json': './package.json',
    },
    files: ['dist'],
    scripts,
    'lint-staged': lintStaged,
    dependencies: deps,
    devDependencies: devDeps,
  };

  return JSON.stringify(pkg, null, 2);
}

export function getFormatterConfigFiles(fmt: FormatterChoice): Record<string, string> {
  if (fmt === 'oxlint-oxfmt') {
    return {
      'oxlintrc.json': oxlintrcJson,
      '.oxfmtrc.json': oxfmtrcJson,
    };
  }
  if (fmt === 'eslint-prettier') {
    return {
      'eslint.config.js': eslintConfig,
      '.prettierrc': prettierrc,
    };
  }
  return {
    'biome.json': biomeJson,
  };
}
