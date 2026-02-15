import path from 'node:path';

const DEFAULT_RAW_BASE = 'https://raw.githubusercontent.com/gitwho-ai/registry/main';
const DEFAULT_WEB_BASE = 'https://github.com/gitwho-ai/registry/tree/main';

export function getRegistryConfig() {
  return {
    rawBase: process.env.GITWHO_REGISTRY_RAW_BASE || DEFAULT_RAW_BASE,
    webBase: process.env.GITWHO_REGISTRY_WEB_BASE || DEFAULT_WEB_BASE
  };
}

function trimTrailingSlash(value) {
  return value.replace(/\/+$/, '');
}

export function getRegistryIndexUrl() {
  const { rawBase } = getRegistryConfig();
  return `${trimTrailingSlash(rawBase)}/index.json`;
}

export function buildRegistryPaths(parsed, outRoot = '.gitwho') {
  const { rawBase, webBase } = getRegistryConfig();
  const personalityPath = `personalities/${parsed.handle}/${parsed.name}`;
  const manifestUrl = `${rawBase}/${personalityPath}/manifest.json`;
  const folderUrl = `${webBase}/${personalityPath}`;

  const localBase = parsed.type === 'versioned'
    ? path.join(outRoot, 'personalities', parsed.handle, parsed.name, parsed.version)
    : path.join(outRoot, 'personalities', parsed.handle, parsed.name, 'hash', parsed.hash);

  return {
    personalityPath,
    manifestUrl,
    folderUrl,
    localBase
  };
}

function assertSafeRelative(filePath) {
  if (filePath.includes('..') || path.isAbsolute(filePath)) {
    throw new Error(`Unsafe file path in manifest: ${filePath}`);
  }
}

export async function fetchJson(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch ${url} (${response.status} ${response.statusText})`);
  }
  return response.json();
}

export async function fetchText(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch ${url} (${response.status} ${response.statusText})`);
  }
  return response.text();
}

export async function fetchRegistryIndex() {
  return fetchJson(getRegistryIndexUrl());
}

export function validateManifestForSref(manifest, parsed) {
  if (manifest.id !== parsed.id) {
    throw new Error(`Manifest id mismatch: expected ${parsed.id} got ${manifest.id}`);
  }
  if (parsed.type === 'versioned' && manifest.version !== parsed.version) {
    throw new Error(`Manifest version mismatch: expected ${parsed.version} got ${manifest.version}`);
  }
  if (!manifest.files?.soul || !manifest.files?.readme) {
    throw new Error('Manifest missing required files.soul or files.readme fields.');
  }
}

export function buildFileUrls(parsed, manifest) {
  const { rawBase } = getRegistryConfig();
  const base = `${rawBase}/personalities/${parsed.handle}/${parsed.name}`;

  const soul = manifest.files.soul;
  const readme = manifest.files.readme;
  assertSafeRelative(soul);
  assertSafeRelative(readme);

  return {
    soulUrl: `${base}/${soul}`,
    readmeUrl: `${base}/${readme}`
  };
}
