import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { createApp } from '../src/app.js';

// runs/ is read-only: every case here uses a temp runs dir.
function appWith(files: Record<string, string>) {
  const runsDir = mkdtempSync(join(tmpdir(), 'rig-routes-'));
  for (const [name, text] of Object.entries(files)) writeFileSync(join(runsDir, name), text);
  return createApp({ adapter: 'shim', installed: '2026-10-29T14:06:00+01:00', beatEverySeconds: 60, runsDir });
}

const good = (job: string, status = 'ok') =>
  JSON.stringify({ at: '2026-10-28T23:00:02+01:00', job, status, owner: 'rook' });

describe('GET /digest/:night', () => {
  it('200 with the rows', async () => {
    const res = await appWith({ '2026-10-28.jsonl': `${good('b/job')}\n${good('a/job')}\n` }).request('/digest/2026-10-28');
    const html = await res.text();
    expect(res.status).toBe(200);
    expect(html.indexOf('a/job')).toBeLessThan(html.indexOf('b/job'));
  });

  it('404 for a night with no file', async () => {
    expect((await appWith({}).request('/digest/2026-10-28')).status).toBe(404);
  });

  it('renders "nothing ran" for an empty night', async () => {
    const res = await appWith({ '2026-10-28.jsonl': '' }).request('/digest/2026-10-28');
    expect(res.status).toBe(200);
    expect(await res.text()).toContain('nothing ran');
  });

  it('renders a night with a bad line', async () => {
    const res = await appWith({ '2026-10-28.jsonl': `${good('a/job')}\n{"at":"2026-10-2\n` }).request('/digest/2026-10-28');
    expect(res.status).toBe(200);
    expect(await res.text()).toContain('a/job');
  });
});

describe('GET /api/digest/:night', () => {
  it('200 with the rows as JSON', async () => {
    const res = await appWith({ '2026-10-28.jsonl': `${good('b/job')}\n${good('a/job')}\n` }).request('/api/digest/2026-10-28');
    const body = (await res.json()) as { rows: { job: string }[] };
    expect(res.status).toBe(200);
    expect(body.rows.map((r) => r.job)).toEqual(['a/job', 'b/job']);
  });

  it('404 for a night with no file', async () => {
    expect((await appWith({}).request('/api/digest/2026-10-28')).status).toBe(404);
  });

  it('empty night gives no rows', async () => {
    const res = await appWith({ '2026-10-28.jsonl': '' }).request('/api/digest/2026-10-28');
    expect(((await res.json()) as { rows: unknown[] }).rows).toEqual([]);
  });

  it('a bad line is counted, not thrown', async () => {
    const res = await appWith({ '2026-10-28.jsonl': `${good('a/job')}\nnot json\n` }).request('/api/digest/2026-10-28');
    const body = (await res.json()) as { badLines: number; rows: unknown[] };
    expect(body.badLines).toBe(1);
    expect(body.rows).toHaveLength(1);
  });

  it('page and JSON list the same jobs in the same order', async () => {
    const app = appWith({ '2026-10-28.jsonl': `${good('c/x')}\n${good('a/x')}\n${good('b/x')}\n` });
    const html = await (await app.request('/digest/2026-10-28')).text();
    const json = (await (await app.request('/api/digest/2026-10-28')).json()) as { rows: { job: string }[] };
    const order = json.rows.map((r) => r.job);
    expect(order).toEqual(['a/x', 'b/x', 'c/x']);
    expect(order.map((j) => html.indexOf(j))).toEqual([...order.map((j) => html.indexOf(j))].sort((x, y) => x - y));
  });
});
