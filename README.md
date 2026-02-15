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
