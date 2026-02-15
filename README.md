# gitwho CLI

`gitwho` pulls personalities from the GitWho registry and outputs a compiled injection prompt.

## Usage

```bash
npx gitwho pull gitwho:strategy/vision-architect@0.1.0
```

Writes files to:

```text
./.gitwho/personalities/<handle>/<name>/<version>/
```

Optional output root:

```bash
npx gitwho pull gitwho:eng/debugger@0.1.0 --out ./tmp
```

Resolve helper:

```bash
npx gitwho resolve gitwho:eng/debugger@0.1.0
```

## Environment overrides

- `GITWHO_REGISTRY_RAW_BASE` (default: `https://raw.githubusercontent.com/gitwho/registry/main`)
- `GITWHO_REGISTRY_WEB_BASE` (default: `https://github.com/gitwho/registry/tree/main`)
