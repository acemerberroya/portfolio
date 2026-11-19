import { criteria } from '../../data/euthenics.js';
import Item from '../Item.jsx';
import Section from '../Section.jsx';

export default function EuCriteria(props) {
  return (
    <Section
      id="eu-criteria"
      title="Evaluation Criteria"
      intro="The six criteria from the Requirement 3 brief. I weighted them by what matters most for my goals, then rated each company from 1 (weak) to 5 (strong)."
      {...props}
    >
      <ol className="hard">
        {criteria.map((c, i) => (
          <Item key={c.id} id={`eu-crit-${c.id}`} className="card hard-skill holo-card">
            <span className="rank" aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
            <div>
              <div className="eu-crit-head">
                <h4>{c.name}</h4>
                <span className="eu-weight">{c.weight}%</span>
              </div>
              <span className="eu-weight-bar" aria-hidden="true"><span style={{ '--v': c.weight / 25 }} /></span>
              <p>{c.question}</p>
            </div>
          </Item>
        ))}
      </ol>
      <p className="soft eu-footnote">
        Weighted score = sum of (rating × weight) ÷ 100, so it stays on the same 1–5 scale. The ratings are my own judgement from the research, not published figures.
      </p>
    </Section>
  );
}
