import type { NightCounts } from '../digest/types.js';
import type { Status } from '../status.js';

// Missing data renders as "—", never as an empty cell.
const count = (counts: NightCounts | null, key: keyof NightCounts) => (counts ? String(counts[key]) : '—');

export function StatusBoard({ status }: { status: Status }) {
  return (
    <>
      <h1>status</h1>
      <table>
        <tbody>
          <tr><th>adapter</th><td>{status.adapter}</td></tr>
          <tr><th>installed</th><td>{status.installed}</td></tr>
          <tr>
            <th>last beat</th>
            <td>{status.lastBeat ? `${status.lastBeat.at} · pid ${status.lastBeat.pid}` : <span class="warn">none</span>}</td>
          </tr>
        </tbody>
      </table>
      <h2>nights on disk</h2>
      {status.nights.length === 0 ? (
        <p class="mute">nothing in runs/</p>
      ) : (
        <table>
          <thead>
            <tr><th>night</th><th>ok</th><th>retry</th><th>fail</th></tr>
          </thead>
          <tbody>
            {status.nights.map((e) => (
              <tr>
                <td><a href={`/digest/${e.night}`}>{e.night}</a></td>
                <td>{count(e.counts, 'ok')}</td>
                <td>{count(e.counts, 'retry')}</td>
                <td>{count(e.counts, 'fail')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </>
  );
}
