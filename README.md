# gitwho CLI

`gitwho-ai` pulls personalities from the GitWho registry and outputs a compiled prompt block.

## Install

```bash
npm i -g gitwho-ai
```

## Usage

Interactive picker:

```bash
gitwho-ai
```

Fast path by SREF:

```bash
gitwho-ai gitwho:strategy/vision-architect@0.1.0
```

## Optional flags

```bash
gitwho-ai gitwho:eng/debugger@0.1.0 --out ./tmp
```

Resolve helper:

```bash
gitwho-ai resolve gitwho:eng/debugger@0.1.0
```

Compatibility alias:

```bash
gitwho-ai pull gitwho:eng/debugger@0.1.0
```

## Environment overrides

- `GITWHO_REGISTRY_RAW_BASE` (default: `https://raw.githubusercontent.com/gitwho-ai/registry/main`)
- `GITWHO_REGISTRY_WEB_BASE` (default: `https://github.com/gitwho-ai/registry/tree/main`)

## Maintainer release

Automated release is configured in `/Users/adam/studio/products/gitwho/gitwho-cli/.github/workflows/release.yml`.

1. Bump version in `/Users/adam/studio/products/gitwho/gitwho-cli/package.json` (for example `npm version 0.1.3 --no-git-tag-version`)
2. Commit and push `main`
3. Tag and push:

```bash
git tag v0.1.3
git push origin v0.1.3
```

The workflow runs tests, verifies tag/version match, publishes to npm, and creates a GitHub release.
