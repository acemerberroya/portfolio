import { useState } from 'react';
import { motion } from 'framer-motion';
import { skillGroups, skillLenses, awsServices } from '../data/profile.js';
import Section from './Section.jsx';

export default function Skills() {
  const [lensId, setLensId] = useState('all');
  const lens = skillLenses.find((l) => l.id === lensId);
  const inLens = (item) => !lens.items || lens.items.includes(item);
  const count = lens.items ? lens.items.length : skillGroups.reduce((n, g) => n + g.items.length, 0);

  return (
    <Section
      id="skills"
      title="Skills"
      intro="My stack, drawn as a network with one subnet per category. Pick a grouping to highlight the services in it."
    >
      <div className="lens-bar" role="group" aria-label="Skill groupings">
        {skillLenses.map((l) => (
          <button
            key={l.id}
            type="button"
            className="lens"
            aria-pressed={lensId === l.id}
            onClick={() => setLensId(l.id)}
          >
            {l.name}
          </button>
        ))}
      </div>
      <p className="lens-status" aria-live="polite">
        {lens.items ? `${lens.name}: ${count} skills highlighted.` : `Showing all ${count} skills.`}
      </p>

      <div className="card vpc">
        <span className="vpc-label">Skills network</span>
        <div className="subnets">
          {skillGroups.map((g) => (
            <div key={g.id} className={`subnet subnet-${g.id}`}>
              <h3 className="subnet-title">{g.name}</h3>
              <ul className="chips">
                {g.items.map((item) => {
                  const on = inLens(item);
                  const service = awsServices[item];
                  return (
                    <motion.li
                      key={item}
                      layout
                      className={`chip ${on ? 'is-on' : 'is-off'} ${service ? 'chip-aws' : ''}`}
                      animate={{ opacity: on ? 1 : 0.32 }}
                      transition={{ duration: 0.25 }}
                    >
                      <span className="chip-name">{item.replace('AWS ', '')}</span>
                      {service && <span className="chip-note">{service}</span>}
                      {!on && <span className="visually-hidden"> (not in this grouping)</span>}
                    </motion.li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </Section>
  );
}
