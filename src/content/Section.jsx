// Shared heading block. `headingRef` lets the panel move focus to the heading
// after keyboard navigation.
export default function Section({ id, title, intro, children, headingRef, level = 2 }) {
  const H = `h${level}`;
  return (
    <section className="content-section" id={`sec-${id}`} aria-labelledby={`${id}-title`}>
      <header className="section-head">
        <H id={`${id}-title`} ref={headingRef} tabIndex={-1}>{title}</H>
        {intro && <p className="section-intro">{intro}</p>}
      </header>
      {children}
    </section>
  );
}
