const VERSIONED_RE = /^gitwho:([a-z0-9-_]+)\/([a-z0-9-_]+)@([0-9]+\.[0-9]+\.[0-9]+)$/;
const HASH_RE = /^gitwho:([a-z0-9-_]+)\/([a-z0-9-_]+)#sha256:([a-f0-9]+)$/;

export function parseSref(input) {
  const versionMatch = VERSIONED_RE.exec(input);
  if (versionMatch) {
    const [, handle, name, version] = versionMatch;
    return {
      raw: input,
      type: 'versioned',
      handle,
      name,
      id: `gitwho:${handle}/${name}`,
      version
    };
  }

  const hashMatch = HASH_RE.exec(input);
  if (hashMatch) {
    const [, handle, name, hash] = hashMatch;
    return {
      raw: input,
      type: 'hashed',
      handle,
      name,
      id: `gitwho:${handle}/${name}`,
      hash
    };
  }

  throw new Error(`Invalid SREF: ${input}`);
}

export function requireVersionedSref(parsed) {
  if (parsed.type !== 'versioned') {
    throw new Error('Only versioned SREFs are supported in v0 pull (use gitwho:<handle>/<name>@<version>).');
  }
  return parsed;
}
