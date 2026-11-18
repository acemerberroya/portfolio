import { education, certificates } from '../data/profile.js';
import { slug } from '../sections.js';
import Item from './Item.jsx';
import Section from './Section.jsx';

export default function Education(props) {
  return (
    <Section id="education" title="Education" {...props}>
      <Item id="edu-degree" as="article" className="card">
        <h3>{education.degree}</h3>
        <p className="edu-school">{education.school}</p>
        <p className="period">{education.period}</p>
      </Item>
      <article className="card">
        <h3>Certificates and seminars</h3>
        <ul className="certs">
          {certificates.map((c) => (
            <Item key={c.title} id={`cert-${slug(c.title)}`}>
              <span className="cert-year">{c.year}</span>
              <span>{c.title}</span>
            </Item>
          ))}
        </ul>
      </article>
    </Section>
  );
}
