#!/usr/bin/env node
import { file, dir, root, emit, write, when } from '@ilyeshdz/ts-plate';
import inquirer from 'inquirer';
import Listr from 'listr';

const scaffoldSrc = (name: string) => `#!/usr/bin/env node
import { file, emit, write } from '@ilyeshdz/ts-plate';

const name = process.argv[2] || 'my-project';

async function main() {
  const tree = file('hello.txt', \`Hello from \${name}!\`);
  const outputs = await emit(tree);
  await write(outputs);
  console.log(\`Created \${name}\`);
}

main().catch(console.error);
`;

const githubCiYml = `name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: pnpm
      - run: pnpm install --frozen-lockfile
      - run: pnpm lint
      - run: pnpm fmt:check
      - run: pnpm build
`;

const githubReleaseYml = `name: Release

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
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0
      - uses: pnpm/action-setup@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: pnpm
      - run: pnpm install --frozen-lockfile
      - run: pnpm build
      - run: npx changelogen@latest gh release
        env:
          GITHUB_TOKEN: \${{ secrets.GITHUB_TOKEN }}
      - run: pnpm publish
        env:
          NODE_AUTH_TOKEN: \${{ secrets.NPM_TOKEN }}
`;

const oxlintrcJson = JSON.stringify(
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

const oxfmtrcJson = JSON.stringify(
  {
    $schema: './node_modules/oxfmt/configuration_schema.json',
    ignorePatterns: ['pnpm-lock.yaml'],
    singleQuote: true,
  },
  null,
  2,
);

const tsconfigJson = JSON.stringify(
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

const tsdownConfig = `import { defineConfig } from 'tsdown'

export default defineConfig({
  dts: false,
  exports: true,
  format: 'esm',
  target: 'node18',
  platform: 'node',
})
`;

const vscodeSettings = JSON.stringify(
  { 'js/ts.tsdk.path': 'node_modules/typescript/lib' },
  null,
  2,
);

function buildPackageJson(name: string) {
  const pkg = {
    name,
    type: 'module',
    version: '0.0.1',
    description: `CLI scaffolded with create-ts-plate`,
    bin: { [name]: './dist/index.mjs' },
    exports: {
      '.': './dist/index.mjs',
      './package.json': './package.json',
    },
    files: ['dist'],
    scripts: {
      build: 'tsdown',
      dev: 'tsdown --watch',
      lint: 'oxlint .',
      'lint:fix': 'oxlint --fix .',
      fmt: 'oxfmt .',
      'fmt:check': 'oxfmt --check .',
      check: 'oxlint . && oxfmt --check . && tsdown',
      release: 'changelogen --release',
      'release:minor': 'changelogen --release --minor',
      'release:major': 'changelogen --release --major',
      'release:patch': 'changelogen --release --patch',
      prepare: 'husky',
    },
    'lint-staged': {
      '*.{js,ts,jsx,tsx,mjs,mts,cjs,cts}': ['oxlint --fix', 'oxfmt'],
      '*.{json,md,yaml}': ['oxfmt'],
    },
    dependencies: {
      '@ilyeshdz/ts-plate': '^0.5.1',
      inquirer: '^12.0.0',
      listr: '^0.14.3',
    },
    devDependencies: {
      '@types/listr': '^0.14.10',
      changelogen: '^0.6.0',
      husky: '^9.0.0',
      'lint-staged': '^17.0.0',
      oxfmt: '^0.55.0',
      oxlint: '^1.70.0',
      tsdown: '^0.22.0',
      typescript: '^6.0.3',
    },
  };
  return JSON.stringify(pkg, null, 2);
}

async function main() {
  const args = process.argv.slice(2);
  const projectName =
    args[0] ||
    (
      await inquirer.prompt<{ name: string }>([
        {
          type: 'input',
          name: 'name',
          message: 'Project name:',
          default: 'my-cli',
          validate: (input: string) => input.trim().length > 0 || 'Project name is required',
        },
      ])
    ).name;

  const answers = await inquirer.prompt<{ install: boolean }>([
    {
      type: 'confirm',
      name: 'install',
      message: 'Install dependencies now?',
      default: true,
    },
  ]);

  const tree = root(
    dir(
      projectName,
      file('package.json', buildPackageJson(projectName)),
      file('tsdown.config.ts', tsdownConfig),
      file('tsconfig.json', tsconfigJson),
      file('oxlintrc.json', oxlintrcJson),
      file('.oxfmtrc.json', oxfmtrcJson),
      file('src/index.ts', scaffoldSrc(projectName)),
      file(
        'README.md',
        `# ${projectName}\n\nA CLI scaffolded with [create-ts-plate](https://github.com/ilyeshdz/create-ts-plate).\n`,
      ),
      file('.gitignore', 'node_modules\ndist\n*.tsbuildinfo\n'),
      file('.husky/pre-commit', 'pnpm exec lint-staged\n'),
      file('.vscode/settings.json', vscodeSettings),
      dir('.github/workflows', file('ci.yml', githubCiYml), file('release.yml', githubReleaseYml)),
    ),
  );

  const tasks = new Listr([
    {
      title: 'Generating project files',
      task: async () => {
        const outputs = await emit(tree);
        await write(outputs);
      },
    },
    {
      title: 'Installing dependencies',
      skip: () => (!answers.install ? 'Skipping installation' : undefined),
      task: async () => {
        const { execSync } = await import('node:child_process');
        execSync('pnpm install', { cwd: projectName, stdio: 'pipe' });
      },
    },
    {
      title: 'Setting up git repository',
      task: async () => {
        const { execSync } = await import('node:child_process');
        try {
          execSync('git init', { cwd: projectName, stdio: 'pipe' });
          execSync('git add .', { cwd: projectName, stdio: 'pipe' });
          execSync('git commit -m "chore: initial commit"', { cwd: projectName, stdio: 'pipe' });
        } catch {
          // git not available or already a repo
        }
      },
    },
  ]);

  await tasks.run();

  console.log(`\nDone! Created ${projectName}.\n`);
  console.log(`  cd ${projectName}`);
  console.log('  pnpm dev');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
