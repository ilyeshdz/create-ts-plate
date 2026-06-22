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
- **TypeScript** — add TypeScript support
- **Vitest** — set up testing
- **CLI tool** — scaffold as a CLI binary
- **Install dependencies** — run `pnpm install` after generation

## What it generates

```
<project-name>
├── .gitignore
├── README.md
├── package.json
├── tsconfig.json        (if TypeScript)
├── src/
│   └── index.ts
└── tests/
    └── index.test.ts    (if vitest)
```

## Development

```bash
pnpm dev      # watch mode
pnpm build   # build for production
pnpm lint    # run oxlint
pnpm fmt     # format with oxfmt
pnpm check   # lint + format check + build
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
