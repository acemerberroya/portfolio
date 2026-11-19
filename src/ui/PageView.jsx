import { CONTENT } from '../content/index.js';
import { ALL } from '../sections.js';
import { EU_ALL } from '../sectionsEuthenics.js';

// Everything on one plain, scrollable page. Used when WebGL is unavailable,
// and whenever a visitor picks "Page view". The Euthenics room's sections
// follow the main portfolio.
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
      <div className="page-room room-euthenics-page">
        {EU_ALL.map((s) => {
          const C = CONTENT[s.id];
          return (
            <div key={s.id} className="page-block">
              <C go={go} level={2} />
            </div>
          );
        })}
      </div>
    </main>
  );
}
