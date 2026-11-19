import { profile } from '../../data/profile.js';
import { reflection } from '../../data/euthenics.js';
import Item from '../Item.jsx';
import Section from '../Section.jsx';

// The reflection opens as a holographic paper: it unrolls from the top, its
// lines of text arrive one after another, and the career paths it weighs sit
// at the foot of the page (each one is also a satellite around the core).
export default function EuReflection(props) {
  return (
    <Section id="eu-reflection" title="Reflection" {...props}>
      <article className="holo-paper" aria-label="Reflection paper">
        <header className="holo-paper-head">
          <p className="eyebrow">Work Immersion · Reflection</p>
          <h3>{reflection.question}</h3>
          <p className="holo-paper-by">{profile.name}</p>
        </header>
        <div className="holo-paper-body">
          {reflection.paragraphs.map((p) => <p key={p.slice(0, 24)}>{p}</p>)}
        </div>
        <footer className="holo-paper-foot">
          <span className="soft">Paths I’m weighing</span>
          <ul className="tags eu-paths">
            {reflection.paths.map((label, i) => (
              <Item key={label} id={`eu-path-${i}`}>{label}</Item>
            ))}
          </ul>
        </footer>
      </article>
    </Section>
  );
}
