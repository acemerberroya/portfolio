import { useState } from 'react';
import { skillGroups, skillLenses, awsServices, hardSkills, softSkills, toolkit } from '../data/profile.js';
import { slug } from '../sections.js';
import Item from './Item.jsx';
import Section from './Section.jsx';

const GROUPS = ['Frontend', 'Backend', 'Database'];

export default function Skills(props) {
  const [lensId, setLensId] = useState('all');
  const lens = skillLenses.find((l) => l.id === lensId);
  const inLens = (item) => !lens.items || lens.items.includes(item);
  const count = lens.items ? lens.items.length : skillGroups.reduce((n, g) => n + g.items.length, 0);

  return (
    <Section
      id="skills"
      title="Skills"
      intro="My stack, laid out as a network with a subnet for each category. Choose a grouping to light up the skills inside it."
      {...props}
    >
      <div className="lens-bar" role="group" aria-label="Skill groupings">
        {skillLenses.map((l) => (
          <button key={l.id} type="button" className="lens" aria-pressed={lensId === l.id} onClick={() => setLensId(l.id)}>
            {l.name}
          </button>
        ))}
      </div>
      <p className="lens-status" aria-live="polite">
        {lens.items ? `${lens.name}: ${count} skills highlighted.` : `Showing all ${count} skills.`}
      </p>
      <div className="card subnets">
        {skillGroups.map((g) => (
          <div key={g.id} className={`subnet subnet-${g.id}`}>
            <h3>{g.name}</h3>
            <ul className="chips">
              {g.items.map((item) => {
                const on = inLens(item);
                const service = awsServices[item];
                return (
                  <li key={item} className={`chip ${on ? 'is-on' : 'is-off'} ${service ? 'chip-aws' : ''}`}>
                    <span className="chip-name">{item.replace('AWS ', '')}</span>
                    {service && <span className="chip-note">{service}</span>}
                    {!on && <span className="visually-hidden"> (not in this grouping)</span>}
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>

      <h3 className="sub-title">Top 10 Hard Skills</h3>
      <ol className="hard">
        {hardSkills.map((s, i) => (
          <Item key={s.title} id={`hard-${slug(s.title)}`} className="card hard-skill">
            <span className="rank" aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
            <div>
              <h4>{s.title}</h4>
              <p>{s.description}</p>
              {s.shownIn.length > 0 && (
                <p className="evidence"><span className="soft">Shown in: </span>{s.shownIn.join(', ')}</p>
              )}
            </div>
          </Item>
        ))}
      </ol>

      <h3 className="sub-title">Languages &amp; Tools</h3>
      <div className="card toolkit">
        {GROUPS.map((g) => {
          const items = toolkit.filter((t) => t.group === g);
          if (!items.length) return null;
          return (
            <div key={g}>
              <h4>{g}</h4>
              <ul className="tool-list">
                {items.map((t) => (
                  <li key={t.title}>
                    <strong>{t.title}</strong>
                    {t.description && <span className="soft"> — {t.description}</span>}
                    {t.usedIn?.length > 0 && <span className="used">Used in {t.usedIn.join(', ')}</span>}
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>

      <h3 className="sub-title">Soft Skills</h3>
      <ul className="soft-skills">
        {softSkills.map((s) => (
          <li key={s.title} className="card"><strong>{s.title}</strong><span>{s.evidence}</span></li>
        ))}
      </ul>
    </Section>
  );
}
