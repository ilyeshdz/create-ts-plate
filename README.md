# create-ts-plate

CLI to scaffold new projects using [@ilyeshdz/ts-plate](https://ilyeshdz.github.io/ts-plate/).

[![Open on npmx.dev](https://npmx.dev/api/registry/badge/version/create-ts-plate)](https://npmx.dev/package/create-ts-plate)
[![Open on npmx.dev](https://npmx.dev/api/registry/badge/size/create-ts-plate)](https://npmx.dev/package/create-ts-plate)

## Usage

```bash
pnpm create ts-plate <project-name>
```

Or run interactively:

```bash
pnpm create ts-plate
```

You'll be prompted for:

- **Project name** (or pass as argument)
- **Formatter / linter** — choose between Oxlint+Oxfmt, ESLint+Prettier, or Biome
- **Install dependencies** — run `pnpm install` after generation

## What it generates

```
<project-name>
├── .github/
│   └── workflows/
│       ├── ci.yml
│       └── release.yml
├── .husky/
│   └── pre-commit
├── .vscode/
│   └── settings.json
├── src/
│   └── index.ts
├── tests/
│   └── index.test.ts
├── .gitignore
├── README.md
├── package.json
├── tsconfig.json
├── tsdown.config.ts
├── vitest.config.ts
├── oxlintrc.json          (if Oxlint+Oxfmt)
├── .oxfmtrc.json          (if Oxlint+Oxfmt)
├── eslint.config.js       (if ESLint+Prettier)
├── .prettierrc            (if ESLint+Prettier)
└── biome.json             (if Biome)
```

## Development

```bash
pnpm dev          # watch mode
pnpm build        # build for production
pnpm test         # run tests
pnpm test:watch   # watch mode tests
pnpm lint         # run linter
pnpm lint:fix     # fix lint issues
pnpm fmt          # format code
pnpm fmt:check    # check formatting
pnpm check        # lint + fmt check + test + build
```

## Release

```bash
pnpm release        # auto bump
pnpm release:patch  # patch bump
pnpm release:minor  # minor bump
pnpm release:major  # major bump
```

## License

MIT
