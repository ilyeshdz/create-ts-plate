#!/usr/bin/env node
import { file, dir, root, emit, write, when } from '@ilyeshdz/ts-plate';
import inquirer from 'inquirer';
import Listr from 'listr';

type Answers = {
  typescript: boolean;
  tests: boolean;
  cli: boolean;
  install: boolean;
};

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
          default: 'my-ts-plate-project',
          validate: (input: string) => input.trim().length > 0 || 'Project name is required',
        },
      ])
    ).name;

  const answers = await inquirer.prompt<Answers>([
    {
      type: 'confirm',
      name: 'typescript',
      message: 'Add TypeScript?',
      default: true,
    },
    {
      type: 'confirm',
      name: 'tests',
      message: 'Add vitest for testing?',
      default: true,
    },
    {
      type: 'confirm',
      name: 'cli',
      message: 'Is this a CLI tool?',
      default: true,
    },
    {
      type: 'confirm',
      name: 'install',
      message: 'Install dependencies now?',
      default: true,
    },
  ]);

  const ext = answers.typescript ? 'ts' : 'js';

  const tree = root(
    dir(
      projectName,
      file(
        'package.json',
        JSON.stringify(
          {
            name: projectName,
            type: 'module',
            version: '0.0.1',
            private: true,
            ...(answers.cli && {
              bin: { [projectName]: `./dist/index.${ext === 'ts' ? 'mjs' : 'js'}` },
            }),
            ...(answers.cli
              ? {
                  exports: {
                    '.': `./dist/index.${ext === 'ts' ? 'mjs' : 'js'}`,
                    './package.json': './package.json',
                  },
                }
              : {}),
            files: ['dist'],
            scripts: {
              build: 'tsdown',
              dev: 'tsdown --watch',
              ...(answers.tests ? { test: 'vitest run' } : {}),
              ...(answers.tests ? { 'test:watch': 'vitest' } : {}),
            },
            dependencies: {},
            devDependencies: {
              tsdown: '^0.22.0',
              typescript: answers.typescript ? '^6.0.3' : undefined,
              vitest: answers.tests ? '^3.0.0' : undefined,
            },
          },
          null,
          2,
        ),
      ),
      file(
        answers.cli ? `src/index.${ext}` : `src/index.${ext}`,
        answers.cli
          ? `#!/usr/bin/env node\nconsole.log("Hello from ${projectName}!");\n`
          : `export function hello() {\n  return "Hello from ${projectName}!";\n}\n`,
      ),
      when(
        answers.typescript,
        file(
          'tsconfig.json',
          JSON.stringify(
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
          ),
        ),
      ),
      when(
        answers.tests,
        dir(
          'tests',
          file(
            `index.test.${ext}`,
            answers.cli
              ? `import { describe, it } from "vitest";\n\ndescribe("${projectName}", () => {\n  it("works", () => {\n    // TODO: add tests\n  });\n});\n`
              : `import { describe, it, expect } from "vitest";\nimport { hello } from "../src/index.${ext}";\n\ndescribe("${projectName}", () => {\n  it("returns greeting", () => {\n    expect(hello()).toBe("Hello from ${projectName}!");\n  });\n});\n`,
          ),
        ),
      ),
      file(
        'README.md',
        `# ${projectName}\n\nA project scaffolded with [create-ts-plate](https://github.com/ilyeshdz/create-ts-plate).\n`,
      ),
      file('.gitignore', 'node_modules\ndist\n*.tsbuildinfo\n'),
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
