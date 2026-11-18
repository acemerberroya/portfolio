export default function Section({ id, title, intro, children, className = '' }) {
  return (
    <section className={`section ${className}`} aria-labelledby={`${id}-title`}>
      <header className="section-head">
        <h2 id={`${id}-title`} tabIndex={-1}>{title}</h2>
        {intro && <p className="section-intro">{intro}</p>}
      </header>
      {children}
    </section>
  );
}
