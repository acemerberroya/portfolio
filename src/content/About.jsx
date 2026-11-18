import { profile, summary } from '../data/profile.js';
import Item from './Item.jsx';
import Section from './Section.jsx';

export default function About(props) {
  return (
    <Section id="about" title="About" {...props}>
      <div className="card about">
        <img className="avatar" src={profile.photo} alt={`Portrait of ${profile.name}`} width="112" height="112" loading="lazy" />
        <div className="about-text">
          {summary.map((p) => <p key={p.slice(0, 24)}>{p}</p>)}
        </div>
        <dl className="facts">
          <Item id="fact-based" as="div"><dt>Based in</dt><dd>{profile.location}</dd></Item>
          <Item id="fact-goal" as="div"><dt>Career goal</dt><dd>Cloud and network engineering</dd></Item>
        </dl>
      </div>
    </Section>
  );
}
