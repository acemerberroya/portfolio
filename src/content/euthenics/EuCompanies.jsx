import { companies, criteria, weightedScore } from '../../data/euthenics.js';
import Item from '../Item.jsx';
import Section from '../Section.jsx';
import Meter from './Meter.jsx';

export default function EuCompanies(props) {
  return (
    <Section
      id="eu-companies"
      title="Top 3 Target Companies"
      {...props}
    >
      <ul className="stack">
        {companies.map((c) => (
          <Item key={c.id} id={`eu-co-${c.id}`} className="card holo-card eu-company">
            <div className="project-head">
              <h3>{c.name}</h3>
              <span className="badge badge-holo">{weightedScore(c).toFixed(2)} / 5</span>
            </div>
            <p className="project-title">{c.legal} · {c.industry}</p>
            <p>{c.background}</p>
            <dl className="meta">
              <div><dt>Location</dt><dd>{c.location}</dd></div>
            </dl>

            <ul className="eu-meters" aria-label={`${c.name} ratings`}>
              {criteria.map((k) => (
                <li key={k.id}>
                  <span className="soft">{k.name}</span>
                  <Meter value={c.scores[k.id]} label={k.name} />
                  <span className="eu-score">{c.scores[k.id]}</span>
                </li>
              ))}
            </ul>

            <details className="case">
              <summary>Learning, access and growth</summary>
              <h4>Learning and training opportunities</h4>
              <ul>{c.learning.map((l) => <li key={l.slice(0, 24)}>{l}</li>)}</ul>
              <h4>Accessibility and convenience</h4>
              <p className="soft">{c.access}</p>
              <h4>Potential for career growth</h4>
              <p className="soft">{c.growth}</p>
            </details>
            <details className="case">
              <summary>Advantages and disadvantages</summary>
              <div className="eu-proscons">
                <div>
                  <h4>Advantages</h4>
                  <ul>{c.pros.map((l) => <li key={l.slice(0, 24)}>{l}</li>)}</ul>
                </div>
                <div>
                  <h4>Disadvantages</h4>
                  <ul>{c.cons.map((l) => <li key={l.slice(0, 24)}>{l}</li>)}</ul>
                </div>
              </div>
              {c.openQuestions && (
                <>
                  <h4>Open questions for the interview</h4>
                  <ul>{c.openQuestions.map((l) => <li key={l.slice(0, 24)}>{l}</li>)}</ul>
                </>
              )}
            </details>
          </Item>
        ))}
      </ul>
    </Section>
  );
}
