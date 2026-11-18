import { inventoryProject, otherProjects } from '../data/profile.js';
import Section from './Section.jsx';
import { InventoryPreview, LifecyclePreview, RestaurantPreview } from './Previews.jsx';

export default function Project() {
  const { stages } = inventoryProject;

  return (
    <Section
      id="project"
      title="Projects"
      intro="What I have built and what it delivered."
    >
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
                  <h3 className="stage-name">{s.name}</h3>
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

      <div className="live">
        <h3 className="live-title">More projects</h3>
        <div className="live-grid">
          {otherProjects.map((p) => (
            <article key={p.name} className="card live-card">
              <div className="live-preview">
                {p.preview === 'restaurant' ? <RestaurantPreview /> : <LifecyclePreview host={p.host} />}
              </div>
              <div className="live-body">
                <h4>{p.name}</h4>
                <p>{p.description}</p>
                <ul className="tags" aria-label={p.tagsLabel}>
                  {p.tags.map((t) => (
                    <li key={t}>{t}</li>
                  ))}
                </ul>
                {p.url && (
                  <a className="button button-ghost" href={p.url} target="_blank" rel="noopener noreferrer">
                    Visit {p.host}
                    <span className="visually-hidden"> (opens in a new tab)</span>
                  </a>
                )}
              </div>
            </article>
          ))}
        </div>
      </div>
    </Section>
  );
}
