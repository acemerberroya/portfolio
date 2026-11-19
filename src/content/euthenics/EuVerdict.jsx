import { companies, recommendation, sources, weightedScore } from '../../data/euthenics.js';
import Item from '../Item.jsx';
import Section from '../Section.jsx';

const pick = companies.find((c) => c.id === recommendation.choice);

export default function EuVerdict(props) {
  return (
    <Section
      id="eu-verdict"
      title="Final Recommendation"
      intro="The company that came out ahead of the comparison, and why."
      {...props}
    >
      <ul className="stack">
        <Item id="eu-v-choice" className="card holo-card eu-choice">
          <p className="eyebrow">My best HTE choice</p>
          <div className="project-head">
            <h3>{pick.name}</h3>
            <span className="badge badge-holo">{weightedScore(pick).toFixed(2)} / 5</span>
          </div>
          <ul className="checks">{recommendation.reasons.map((r) => <li key={r.slice(0, 24)}>{r}</li>)}</ul>
          <p className="soft">{recommendation.tradeoffs}</p>
          <h4>How it prepares me</h4>
          <p>{recommendation.prepares}</p>
        </Item>
        <Item id="eu-v-runner" className="card holo-card">
          <h3>The other two</h3>
          <p>{recommendation.runnerUp}</p>
          <p className="soft">{recommendation.uratex}</p>
        </Item>
        <Item id="eu-v-next" className="card holo-card">
          <h3>Next steps</h3>
          <ol className="pipeline">{recommendation.nextSteps.map((s) => <li key={s.slice(0, 24)}>{s}</li>)}</ol>
        </Item>
      </ul>

      <details className="case eu-sources">
        <summary>Sources</summary>
        <ul>
          {sources.map((s) => (
            <li key={s.label}>
              {s.url ? (
                <a href={s.url} target="_blank" rel="noopener noreferrer">
                  {s.label}<span className="visually-hidden"> (opens in a new tab)</span>
                </a>
              ) : s.label}
            </li>
          ))}
        </ul>
      </details>
    </Section>
  );
}
