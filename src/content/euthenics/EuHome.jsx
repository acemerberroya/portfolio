import { companies, criteria, evaluation, weightedScore } from '../../data/euthenics.js';
import { EU_SECTIONS } from '../../sectionsEuthenics.js';
import Section from '../Section.jsx';
import Meter from './Meter.jsx';

const pick = companies.find((c) => c.id === evaluation.verdict.pick);

export default function EuHome({ go, headingRef, level = 1 }) {
  return (
    <Section id="euthenics" title={evaluation.title} intro={evaluation.intro} headingRef={headingRef} level={level}>
      <p className="holo-readout" aria-hidden="true">
        <span>HTE://EVAL</span><span>{companies.length} targets</span><span>{criteria.length} criteria</span>
        <span className="holo-caret" />
      </p>
      <p className="eyebrow">{evaluation.course}</p>

      <div className="card holo-card">
        <h3 className="sub-title">What I’m aiming for</h3>
        <ul className="checks">
          {evaluation.goals.map((g) => <li key={g.slice(0, 20)}>{g}</li>)}
        </ul>
      </div>

      <div className="card holo-card eu-scoreboard">
        <h3 className="sub-title">Weighted score <span className="soft">(out of 5)</span></h3>
        <ul className="eu-totals">
          {companies.map((c) => {
            const s = weightedScore(c);
            return (
              <li key={c.id} className={c.id === pick.id ? 'is-pick' : ''}>
                <span className="eu-total-name">{c.name}</span>
                <Meter value={s} label={`${c.name} weighted score`} />
                <span className="eu-total-num">{s.toFixed(2)}</span>
              </li>
            );
          })}
        </ul>
        <p className="eu-verdict-line">{evaluation.verdict.oneLine}</p>
      </div>

      <ul className="kpis" aria-label="Evaluation sections">
        {EU_SECTIONS.map((s) => (
          <li key={s.id}>
            <a href={`#${s.id}`} className="kpi" onClick={(e) => { e.preventDefault(); go(s.id); }}>
              <span className="kpi-label">{s.label}</span>
              <span className="kpi-note">{s.hint}</span>
            </a>
          </li>
        ))}
      </ul>
    </Section>
  );
}
