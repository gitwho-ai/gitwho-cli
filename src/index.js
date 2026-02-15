#!/usr/bin/env node
import { promises as fs } from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { parseSref, requireVersionedSref } from './sref.js';
import {
  buildFileUrls,
  buildRegistryPaths,
  fetchJson,
  fetchText,
  validateManifestForSref
} from './registry.js';
import { compilePrompt } from './compiler.js';

function usage() {
  return `gitwho v0

Usage:
  gitwho pull <SREF> [--out <dir>]
  gitwho resolve <SREF> [--out <dir>]

Examples:
  gitwho pull gitwho:strategy/vision-architect@0.1.0
  gitwho resolve gitwho:eng/debugger@0.1.0 --out ./.gitwho
`;
}

function parseOutArg(args) {
  const outIndex = args.indexOf('--out');
  if (outIndex === -1) {
    return '.gitwho';
  }
  const value = args[outIndex + 1];
  if (!value || value.startsWith('-')) {
    throw new Error('Missing value for --out');
  }
  return value;
}

async function cmdResolve(args) {
  const sref = args[0];
  if (!sref) {
    throw new Error('resolve requires an SREF argument');
  }

  const outRoot = parseOutArg(args.slice(1));
  const parsed = parseSref(sref);
  const paths = buildRegistryPaths(parsed, outRoot);

  const result = {
    sref: parsed.raw,
    type: parsed.type,
    id: parsed.id,
    manifest_url: paths.manifestUrl,
    source_url: paths.folderUrl,
    local_path: paths.localBase
  };

  if (parsed.type === 'versioned') {
    result.version = parsed.version;
  }
  if (parsed.type === 'hashed') {
    result.hash = parsed.hash;
  }

  process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
}

async function cmdPull(args) {
  const sref = args[0];
  if (!sref) {
    throw new Error('pull requires an SREF argument');
  }

  const outRoot = parseOutArg(args.slice(1));
  const parsed = requireVersionedSref(parseSref(sref));
  const paths = buildRegistryPaths(parsed, outRoot);

  const manifest = await fetchJson(paths.manifestUrl);
  validateManifestForSref(manifest, parsed);

  const { soulUrl, readmeUrl } = buildFileUrls(parsed, manifest);
  const [soulContent, readmeContent] = await Promise.all([
    fetchText(soulUrl),
    fetchText(readmeUrl)
  ]);

  const outputDir = path.resolve(process.cwd(), paths.localBase);
  await fs.mkdir(outputDir, { recursive: true });

  await Promise.all([
    fs.writeFile(path.join(outputDir, 'manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`, 'utf8'),
    fs.writeFile(path.join(outputDir, manifest.files.soul), soulContent, 'utf8'),
    fs.writeFile(path.join(outputDir, manifest.files.readme), readmeContent, 'utf8')
  ]);

  const compiled = compilePrompt({
    sref: parsed.raw,
    sourceUrl: paths.folderUrl,
    soulContent
  });

  await fs.writeFile(path.join(outputDir, 'COMPILED_PROMPT.txt'), compiled, 'utf8');
  process.stdout.write(compiled);
}

async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0 || args[0] === '-h' || args[0] === '--help') {
    process.stdout.write(usage());
    return;
  }

  const command = args[0];
  const rest = args.slice(1);

  switch (command) {
    case 'pull':
      await cmdPull(rest);
      return;
    case 'resolve':
      await cmdResolve(rest);
      return;
    default:
      throw new Error(`Unknown command: ${command}`);
  }
}

main().catch((error) => {
  process.stderr.write(`Error: ${error.message}\n\n${usage()}`);
  process.exit(1);
});
