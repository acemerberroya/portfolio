import { CONTENT } from '../content/index.js';
import { ALL } from '../sections.js';

// Everything on one plain, scrollable page. Used when WebGL is unavailable,
// and whenever a visitor picks "Page view".
export default function PageView({ go, note }) {
  return (
    <main className="page-view" id="main">
      {note && <p className="page-note" role="note">{note}</p>}
      {ALL.map((s) => {
        const C = CONTENT[s.id];
        return (
          <div key={s.id} className="page-block" id={s.id === 'top' ? 'top' : undefined}>
            <C go={go} level={s.id === 'top' ? 1 : 2} />
          </div>
        );
      })}
    </main>
  );
}
