import { profile } from '../data/profile.js';
import { useFilm } from '../film.js';
import Topology from './Topology.jsx';

export default function Hero({ sections }) {
  const { goTo } = useFilm();
  return (
    <section className="hero" aria-labelledby="hero-title">
        <div className="card hero-copy">
          <h1 id="hero-title" className="hero-name" tabIndex={-1}>
            <span>Acemer</span> <span>Berroya</span>
          </h1>
          <p className="hero-role">
            Web developer working toward a career in cloud and network engineering, with knowledge of the AWS platform.
          </p>
          <p className="hero-meta">
            Freelance web developer since 2024, based in {profile.location}.
          </p>
          <div className="hero-actions">
            <a className="button button-primary" href={`mailto:${profile.email}`}>
              Email me
            </a>
            <a
              className="button button-ghost"
              href="#project"
              onClick={(e) => {
                e.preventDefault();
                goTo('project');
              }}
            >
              See my projects
            </a>
          </div>
        </div>
        <Topology sections={sections} />
    </section>
  );
}
