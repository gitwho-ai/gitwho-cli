export function compilePrompt({ sref, sourceUrl, soulContent }) {
  return [
    `# GitWho Personality: ${sref}`,
    `# Source: ${sourceUrl}`,
    '',
    soulContent.trimEnd(),
    '',
    '# Injection tips:',
    '- System prompt: paste SOUL as system message',
    '- If using OpenClaw: drop soul.md into your agent folder as SOUL.md',
    '- If using Cursor Rules: include as higher-priority rules file',
    ''
  ].join('\n');
}
