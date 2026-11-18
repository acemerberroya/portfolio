import { allProjects } from '../data/profile.js';
import { slug } from '../sections.js';
import Item from './Item.jsx';
import Section from './Section.jsx';

function Meta({ p }) {
  const rows = [
    ['Role', p.role], ['Client', p.client], ['Team', p.team], ['Adviser', p.adviser], ['When', p.date],
  ].filter(([, v]) => v);
  if (!rows.length) return null;
  return (
    <dl className="meta">
      {rows.map(([k, v]) => (
        <div key={k}><dt>{k}</dt><dd>{v}</dd></div>
      ))}
    </dl>
  );
}

function CaseStudy({ cs }) {
  if (!cs) return null;
  return (
    <details className="case">
      <summary>Case study</summary>
      {cs.problem && (<><h4>The problem</h4><p>{cs.problem}</p></>)}
      {cs.features?.length > 0 && (
        <>
          <h4>Features</h4>
          <ul className="features">
            {cs.features.map((f) => (
              <li key={f.title}><strong>{f.title}.</strong> {f.description}</li>
            ))}
          </ul>
        </>
      )}
      {cs.outcomes?.length > 0 && (
        <>
          <h4>Outcomes</h4>
          <ul className="outcomes">{cs.outcomes.map((o) => <li key={o}>{o}</li>)}</ul>
        </>
      )}
    </details>
  );
}

function ProjectCard({ p }) {
  const id = `project-${slug(p.name)}`;
  return (
    <Item id={id} as="article" className="card project">
      {p.image && (
        <div className="shot">
          <img src={p.image} alt={p.imageAlt || `${p.name} screenshot`} loading="lazy" decoding="async" width="1200" height="750" />
        </div>
      )}
      <div className="project-head">
        <h3>{p.name}</h3>
        {p.badge && <span className={`badge ${p.url ? 'badge-live' : ''}`}>{p.badge}</span>}
      </div>
      {p.title && p.title !== p.name && <p className="project-title">{p.title}</p>}

      {p.stages ? (
        <ol className="pipeline">
          {p.stages.map((s) => (
            <li key={s.id}>
              <strong>{s.name}</strong>
              <span>{s.id === 'accuracy' && <b className="figure">−40% </b>}{s.text}</span>
            </li>
          ))}
        </ol>
      ) : (
        <>
          {p.description && <p>{p.description}</p>}
          {p.summary && <p className="soft">{p.summary}</p>}
        </>
      )}

      <Meta p={p} />
      {p.tags && (
        <ul className="tags" aria-label={p.tagsLabel}>{p.tags.map((t) => <li key={t}>{t}</li>)}</ul>
      )}
      {p.techStack && (
        <ul className="tags tags-quiet" aria-label="Tech stack">{p.techStack.map((t) => <li key={t}>{t}</li>)}</ul>
      )}
      <CaseStudy cs={p.caseStudy} />
      {(p.url || p.demoUrl || p.repoUrl) && (
        <div className="actions">
          {p.url && (
            <a className="button button-primary" href={p.url} target="_blank" rel="noopener noreferrer">
              Visit {p.host}<span className="visually-hidden"> (opens in a new tab)</span>
            </a>
          )}
          {p.demoUrl && (
            <a className="button button-primary" href={p.demoUrl} target="_blank" rel="noopener noreferrer">
              Play the demo<span className="visually-hidden"> (opens in a new tab)</span>
            </a>
          )}
          {p.repoUrl && (
            <a className="button button-ghost" href={p.repoUrl} target="_blank" rel="noopener noreferrer">
              Source code<span className="visually-hidden"> (opens in a new tab)</span>
            </a>
          )}
        </div>
      )}
    </Item>
  );
}

export default function Projects(props) {
  return (
    <Section id="project" title="Projects" intro="What I have built and what it delivered." {...props}>
      <div className="stack">
        {allProjects.map((p) => <ProjectCard key={p.name} p={p} />)}
      </div>
    </Section>
  );
}
