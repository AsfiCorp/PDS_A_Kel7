const assert = require('assert');

// 1. Guard check regex
const isOffDomain = (q) => /(cuti|krs|presiden|kampus|kuliah|dosen|semester|dekan|kaprodi|skripsi|rektor|sks)/i.test(q);

assert.strictEqual(isOffDomain('jadwal cuti'), true);
assert.strictEqual(isOffDomain('kapan batas cuti akademik?'), true);
assert.strictEqual(isOffDomain('cara pendaftaran KRS'), true);
assert.strictEqual(isOffDomain('siapa presiden indonesia ke-4?'), true);
assert.strictEqual(isOffDomain('apa itu autosplit 50:50?'), false);
assert.strictEqual(isOffDomain('berapa safe to spend saya?'), false);

// 2. RAG source filter logic in AppOnly mode
function filterRagContext(sources, rawContext, isAppOnly) {
  if (!isAppOnly) return rawContext;
  if (!Array.isArray(sources)) return '';
  const hasAppHit = sources.some(s => (s.source || '').includes('duowallet'));
  if (!hasAppHit || !rawContext) return '';
  return rawContext
    .split('\n\n---\n\n')
    .filter(p => !p.toLowerCase().includes('cuti') && !p.toLowerCase().includes('krs') && !p.toLowerCase().includes('presiden'))
    .join('\n\n---\n\n');
}

// Academic source should be stripped in AppOnly mode
const academicSources = [{ source: 'sop-cuti-akademik.md' }];
assert.strictEqual(filterRagContext(academicSources, 'SOP Cuti', true), '');

// DuoWallet source should be preserved in AppOnly mode
const appSources = [{ source: 'duowallet-panduan.md' }];
assert.strictEqual(filterRagContext(appSources, 'Panduan DuoWallet', true), 'Panduan DuoWallet');

console.log('All mode guard asserts passed!');
