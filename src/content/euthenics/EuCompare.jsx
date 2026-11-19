import { companies, criteria, recommendation, weightedScore } from '../../data/euthenics.js';
import Item from '../Item.jsx';
import Section from '../Section.jsx';

export default function EuCompare(props) {
  return (
    <Section
      id="eu-compare"
      title="Comparative Analysis"
      {...props}
    >
      <div className="eu-table-wrap" tabIndex={0} role="region" aria-label="Comparison table, scrolls sideways on small screens">
        <table className="eu-table">
          <caption className="visually-hidden">Ratings of Accenture, Civicom and Uratex on six weighted criteria</caption>
          <thead>
            <tr>
              <th scope="col">Criterion</th>
              {companies.map((c) => (
                <th key={c.id} scope="col" className={c.id === recommendation.choice ? 'is-pick' : ''}>{c.name}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {criteria.map((k) => (
              <Item key={k.id} id={`eu-row-${k.id}`} as="tr">
                <th scope="row">{k.name}<span className="eu-row-weight">{k.weight}%</span></th>
                {companies.map((c) => (
                  <td key={c.id} className={c.id === recommendation.choice ? 'is-pick' : ''}>
                    <span className="eu-cell-score">{c.scores[k.id]}</span>
                    <span className="eu-cell-note">{c.notes[k.id]}</span>
                  </td>
                ))}
              </Item>
            ))}
            <Item id="eu-row-total" as="tr" className="eu-total-row">
              <th scope="row">Weighted total</th>
              {companies.map((c) => (
                <td key={c.id} className={c.id === recommendation.choice ? 'is-pick' : ''}>
                  <span className="eu-cell-score">{weightedScore(c).toFixed(2)}</span>
                </td>
              ))}
            </Item>
          </tbody>
        </table>
      </div>
    </Section>
  );
}
