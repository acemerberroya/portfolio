import { profile, summary } from '../data/profile.js';
import Avatar from './Avatar.jsx';
import Section from './Section.jsx';

export default function About() {
  return (
    <Section id="about" title="About">
      <div className="card about-grid">
        <div className="about-text">
          {summary.map((p) => (
            <p key={p.slice(0, 24)}>{p}</p>
          ))}
        </div>
        <aside className="about-facts" aria-label="Quick facts">
          <Avatar size={88} />
          <dl className="facts">
            <div>
              <dt>Based in</dt>
              <dd>{profile.location}</dd>
            </div>
            <div>
              <dt>Career goal</dt>
              <dd>Cloud and network engineering</dd>
            </div>
          </dl>
        </aside>
      </div>
    </Section>
  );
}
