#!/usr/bin/env node
import { promises as fs } from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import readline from 'node:readline/promises';
import { parseSref, requireVersionedSref } from './sref.js';
import {
  buildFileUrls,
  buildRegistryPaths,
  fetchJson,
  fetchRegistryIndex,
  fetchText,
  validateManifestForSref
} from './registry.js';
import { compilePrompt } from './compiler.js';

function usage() {
  return `gitwho-ai v0

Usage:
  gitwho-ai
  gitwho-ai <SREF> [--out <dir>]
  gitwho-ai pull <SREF> [--out <dir>]
  gitwho-ai resolve <SREF> [--out <dir>]

Examples:
  gitwho-ai
  gitwho-ai gitwho:strategy/vision-architect@0.1.0
  gitwho-ai resolve gitwho:eng/debugger@0.1.0 --out ./.gitwho
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

function isSref(input) {
  if (!input) {
    return false;
  }

  try {
    parseSref(input);
    return true;
  } catch {
    return false;
  }
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

function printPersonalityPicker(personalities) {
  process.stdout.write('\nAvailable personalities:\n');
  personalities.forEach((item, index) => {
    const lineNo = String(index + 1).padStart(2, ' ');
    process.stdout.write(`${lineNo}. ${item.sref} - ${item.title}\n`);
  });
}

async function promptForSref() {
  if (!process.stdin.isTTY || !process.stdout.isTTY) {
    throw new Error('No SREF provided and terminal is non-interactive. Pass a SREF argument.');
  }

  const index = await fetchRegistryIndex();
  const personalities = Array.isArray(index.personalities) ? index.personalities : [];

  if (personalities.length === 0) {
    throw new Error('Registry index returned no personalities.');
  }

  printPersonalityPicker(personalities);

  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

  try {
    const answer = (await rl.question('\nPick a number or paste SREF: ')).trim();

    if (!answer) {
      throw new Error('No selection provided.');
    }

    const number = Number.parseInt(answer, 10);
    if (Number.isInteger(number) && number >= 1 && number <= personalities.length) {
      return personalities[number - 1].sref;
    }

    parseSref(answer);
    return answer;
  } finally {
    rl.close();
  }
}

async function main() {
  const args = process.argv.slice(2);

  if (args[0] === '-h' || args[0] === '--help') {
    process.stdout.write(usage());
    return;
  }

  if (args[0] === 'pull') {
    await cmdPull(args.slice(1));
    return;
  }

  if (args[0] === 'resolve') {
    await cmdResolve(args.slice(1));
    return;
  }

  if (args.length === 0 || args[0] === '--out') {
    const selectedSref = await promptForSref();
    await cmdPull([selectedSref, ...args]);
    return;
  }

  if (isSref(args[0])) {
    await cmdPull(args);
    return;
  }

  throw new Error(`Unknown command or invalid SREF: ${args[0]}`);
}

main().catch((error) => {
  process.stderr.write(`Error: ${error.message}\n\n${usage()}`);
  process.exit(1);
});
