// A 1–5 score drawn as a glowing bar that fills in when the panel appears.
export default function Meter({ value, max = 5, label }) {
  return (
    <span className="meter" role="img" aria-label={`${label}: ${value} out of ${max}`}>
      <span className="meter-fill" style={{ '--v': value / max }} />
    </span>
  );
}
