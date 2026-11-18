import { inventoryProject, otherProjects } from '../data/profile.js';
import Section from './Section.jsx';
import { InventoryPreview, LifecyclePreview, RestaurantPreview } from './Previews.jsx';

function ProjectCard({ p }) {
  const live = Boolean(p.url);
  const preview = p.image ? (
    <div className="shot">
      <div className="shot-bar" aria-hidden="true">
        <span /><span /><span />
        {p.host && <em>{p.host}</em>}
      </div>
      <img src={p.image} alt={p.imageAlt || `${p.name} screenshot`} width="1200" height="750" loading="lazy" decoding="async" />
    </div>
  ) : p.preview === 'restaurant' ? (
    <RestaurantPreview />
  ) : (
    <LifecyclePreview host={p.host} />
  );
  return (
    <article className={`card live-card ${live ? 'is-live' : ''}`}>
      {live ? (
        <a className="live-preview" href={p.url} target="_blank" rel="noopener noreferrer" tabIndex={-1} aria-hidden="true">
          {preview}
        </a>
      ) : (
        <div className="live-preview">{preview}</div>
      )}
      <div className="live-body">
        <div className="live-heading">
          <h3 className="project-name">{p.name}</h3>
          {live && (
            <span className="live-badge">
              <span className="live-dot" aria-hidden="true" />
              Live
            </span>
          )}
        </div>
        <p>{p.description}</p>
        <ul className="tags" aria-label={p.tagsLabel}>
          {p.tags.map((t) => (
            <li key={t}>{t}</li>
          ))}
        </ul>
        {live && (
          <a className="button button-primary" href={p.url} target="_blank" rel="noopener noreferrer">
            Visit {p.host}
            <span className="visually-hidden"> (opens in a new tab)</span>
          </a>
        )}
      </div>
    </article>
  );
}

export default function Project() {
  const { stages } = inventoryProject;
  const featured = otherProjects.filter((p) => p.url); // live projects lead the slide
  const rest = otherProjects.filter((p) => !p.url);

  return (
    <Section id="project" title="Projects" intro="What I have built and what it delivered.">
      <div className="project-list">
        {featured.map((p) => (
          <ProjectCard key={p.name} p={p} />
        ))}

        <div className="card project-layout">
          <div className="project-visual">
            <h3 className="project-name">Smart Inventory Management System</h3>
            {/* Placeholder illustration: swap for a real screenshot in Previews.jsx */}
            <InventoryPreview />
          </div>
          <div className="pipeline-wrap">
            <ol className="pipeline">
              {stages.map((s) => (
                <li key={s.id} className="stage">
                  <span className="stage-port" aria-hidden="true" />
                  <div className="stage-body">
                    <h4 className="stage-name">{s.name}</h4>
                    {s.id === 'accuracy' ? (
                      <p className="stage-text">
                        <span className="stage-figure" aria-hidden="true">−40%</span>
                        {s.text}
                      </p>
                    ) : (
                      <p className="stage-text">{s.text}</p>
                    )}
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>

        {rest.map((p) => (
          <ProjectCard key={p.name} p={p} />
        ))}
      </div>
    </Section>
  );
}
