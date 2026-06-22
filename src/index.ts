#!/usr/bin/env node
import { emit, write } from '@ilyeshdz/ts-plate';
import inquirer from 'inquirer';
import Listr from 'listr';
import { buildTree } from './actions.js';
import type { FormatterChoice } from './templates.js';

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

  const answers = await inquirer.prompt<{ formatter: FormatterChoice; install: boolean }>([
    {
      type: 'list',
      name: 'formatter',
      message: 'Choose formatter / linter:',
      choices: [
        { name: 'Oxlint + Oxfmt (fast, Rust-based)', value: 'oxlint-oxfmt' },
        { name: 'ESLint + Prettier (widely adopted)', value: 'eslint-prettier' },
        { name: 'Biome (all-in-one, fast)', value: 'biome' },
      ],
      default: 'oxlint-oxfmt',
    },
    {
      type: 'confirm',
      name: 'install',
      message: 'Install dependencies now?',
      default: true,
    },
  ]);

  const tree = buildTree({ name: projectName, formatter: answers.formatter });

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
