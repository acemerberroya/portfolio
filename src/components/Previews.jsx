/*
  Placeholder project visuals drawn in SVG so the site works with no image files.
  To use real screenshots, put them in /public (e.g. /public/inventory.png)
  and replace a component's body with:
    <img src="/inventory.png" alt="Smart Inventory Management System dashboard" />
*/

function Frame({ host, children, label }) {
  return (
    <svg viewBox="0 0 480 300" className="preview" role="img" aria-label={label}>
      <rect x="0.5" y="0.5" width="479" height="299" rx="14" className="pv-frame" />
      <path d="M0.5 34 H479.5" className="pv-line" />
      <circle cx="20" cy="17" r="4.5" className="pv-dot" />
      <circle cx="35" cy="17" r="4.5" className="pv-dot" />
      <circle cx="50" cy="17" r="4.5" className="pv-dot" />
      <rect x="140" y="9" width="200" height="16" rx="8" className="pv-bar" />
      {host && (
        <text x="240" y="21" textAnchor="middle" className="pv-host">{host}</text>
      )}
      {children}
    </svg>
  );
}

export function InventoryPreview() {
  const bars = [62, 88, 54, 110, 96, 128, 104];
  return (
    <Frame label="Illustration of an inventory dashboard with stock levels and a report chart">
      {/* sidebar */}
      <rect x="16" y="50" width="88" height="234" rx="8" className="pv-panel" />
      {[0, 1, 2, 3, 4].map((i) => (
        <rect key={i} x="28" y={66 + i * 26} width={i === 1 ? 64 : 52} height="9" rx="4.5" className={i === 1 ? 'pv-accent' : 'pv-muted'} />
      ))}
      {/* stat tiles */}
      {[0, 1, 2].map((i) => (
        <g key={i} transform={`translate(${118 + i * 118} 50)`}>
          <rect width="106" height="58" rx="8" className="pv-panel" />
          <rect x="12" y="14" width="44" height="7" rx="3.5" className="pv-muted" />
          <rect x="12" y="30" width={i === 1 ? 60 : 36} height="14" rx="4" className={i === 1 ? 'pv-amber' : 'pv-ink'} />
        </g>
      ))}
      {/* chart */}
      <rect x="118" y="120" width="342" height="164" rx="8" className="pv-panel" />
      {bars.map((h, i) => (
        <rect key={i} x={142 + i * 44} y={268 - h} width="24" height={h} rx="4" className={i === 5 ? 'pv-accent' : 'pv-soft'} />
      ))}
      <path d="M134 268 H444" className="pv-line" />
    </Frame>
  );
}

export function LifecyclePreview({ host }) {
  const steps = ['Enroll', 'Study', 'Graduate', 'Employ'];
  return (
    <Frame host={host} label="Illustration of a student lifecycle from enrollment to employment">
      <path d="M70 168 H410" className="pv-track" />
      {steps.map((s, i) => {
        const x = 70 + i * 113;
        return (
          <g key={s}>
            <circle cx={x} cy="168" r={i === 3 ? 15 : 12} className={i === 3 ? 'pv-amber-fill' : 'pv-node'} />
            <text x={x} y="206" textAnchor="middle" className="pv-step">{s}</text>
          </g>
        );
      })}
      <rect x="70" y="72" width="170" height="14" rx="7" className="pv-ink" />
      <rect x="70" y="96" width="250" height="9" rx="4.5" className="pv-muted" />
    </Frame>
  );
}

export function RestaurantPreview() {
  const items = [0, 1, 2, 3, 4, 5];
  return (
    <Frame label="Illustration of a restaurant point-of-sale menu with an order chatbot">
      {/* menu grid */}
      {items.map((i) => {
        const x = 16 + (i % 3) * 92;
        const y = 50 + Math.floor(i / 3) * 112;
        return (
          <g key={i} transform={`translate(${x} ${y})`}>
            <rect width="82" height="100" rx="8" className="pv-panel" />
            <rect x="10" y="10" width="62" height="44" rx="6" className={i === 1 ? 'pv-soft' : 'pv-muted'} />
            <rect x="10" y="64" width="46" height="7" rx="3.5" className="pv-ink" />
            <rect x="10" y="80" width="28" height="7" rx="3.5" className="pv-soft" />
          </g>
        );
      })}
      {/* chatbot panel */}
      <rect x="300" y="50" width="164" height="234" rx="10" className="pv-panel" />
      <rect x="312" y="64" width="104" height="26" rx="13" className="pv-muted" />
      <rect x="348" y="100" width="104" height="26" rx="13" className="pv-accent" />
      <rect x="312" y="136" width="120" height="26" rx="13" className="pv-muted" />
      <rect x="312" y="172" width="80" height="26" rx="13" className="pv-muted" />
      <rect x="312" y="246" width="140" height="26" rx="13" className="pv-line-box" />
    </Frame>
  );
}
