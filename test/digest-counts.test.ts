import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { nightCounts } from '../src/digest/counts.js';

describe('nightCounts', () => {
  it('counts lines per status for 2026-10-28 (bad line not counted)', () => {
    expect(nightCounts('runs', '2026-10-28')).toEqual({ ok: 10, retry: 4, fail: 1 });
  });

  it('returns null for a night with no file', () => {
    expect(nightCounts('runs', '2001-01-01')).toBeNull();
  });

  it('returns zeros for an empty file', () => {
    const dir = mkdtempSync(join(tmpdir(), 'rig-'));
    writeFileSync(join(dir, '2026-01-01.jsonl'), '');
    expect(nightCounts(dir, '2026-01-01')).toEqual({ ok: 0, retry: 0, fail: 0 });
  });
});
