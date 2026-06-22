import { file, dir, root } from '@ilyeshdz/ts-plate';
import {
  scaffoldSrc,
  githubCiYml,
  githubReleaseYml,
  tsconfigJson,
  tsdownConfig,
  vitestConfig,
  scaffoldTestFile,
  vscodeSettings,
  buildPackageJson,
  getFormatterConfigFiles,
  type FormatterChoice,
} from './templates.js';

export interface ScaffoldOptions {
  name: string;
  formatter: FormatterChoice;
}

export function buildTree(opts: ScaffoldOptions) {
  const formatterFiles = getFormatterConfigFiles(opts.formatter);

  const formatterNodes = Object.entries(formatterFiles).map(([path, content]) =>
    file(path, content),
  );

  return root(
    dir(
      opts.name,
      file('package.json', buildPackageJson(opts.name, opts.formatter)),
      file('tsdown.config.ts', tsdownConfig),
      file('tsconfig.json', tsconfigJson),
      file('vitest.config.ts', vitestConfig),
      file('src/index.ts', scaffoldSrc(opts.name)),
      file('tests/index.test.ts', scaffoldTestFile),
      file(
        'README.md',
        `# ${opts.name}\n\nA CLI scaffolded with [create-ts-plate](https://github.com/ilyeshdz/create-ts-plate).\n`,
      ),
      file('.gitignore', 'node_modules\ndist\n*.tsbuildinfo\n'),
      file('.husky/pre-commit', 'pnpm exec lint-staged\n'),
      file('.vscode/settings.json', vscodeSettings),
      dir(
        '.github/workflows',
        file('ci.yml', githubCiYml(opts.formatter)),
        file('release.yml', githubReleaseYml),
      ),
      ...formatterNodes,
    ),
  );
}
