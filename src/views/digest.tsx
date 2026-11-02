import type { DigestRow, Night } from '../digest/types.js';

// A row is flagged when it retried 3 times or more, or when its last run failed. The row gets
// the warn class and a text marker; colour alone never carries the flag.
const RETRY_FLAG = 3;

function flagged(row: DigestRow): boolean {
  return row.retries >= RETRY_FLAG || row.lastStatus === 'fail';
}

function Row({ row }: { row: DigestRow }) {
  return (
    <tr class={flagged(row) ? 'warn' : undefined}>
      <td>{row.job}</td>
      <td>{row.owner ?? '—'}</td>
      <td>{row.runs}</td>
      <td>{row.retries >= RETRY_FLAG ? `${row.retries} · retries` : row.retries}</td>
      <td>{row.lastStatus}</td>
      <td>{row.lastError ?? '—'}</td>
      <td>{row.first}</td>
      <td>{row.last}</td>
    </tr>
  );
}

export function DigestView({ night }: { night: Night }) {
  return (
    <>
      <h1>digest · {night.night}</h1>
      {night.badLines > 0 ? <p class="mute">{night.badLines} bad line(s) skipped</p> : null}
      {night.rows.length === 0 ? (
        <p class="mute">nothing ran</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>job</th>
              <th>owner</th>
              <th>runs</th>
              <th>retries</th>
              <th>last status</th>
              <th>last error</th>
              <th>first</th>
              <th>last</th>
            </tr>
          </thead>
          <tbody>
            {night.rows.map((row) => (
              <Row row={row} />
            ))}
          </tbody>
        </table>
      )}
    </>
  );
}
