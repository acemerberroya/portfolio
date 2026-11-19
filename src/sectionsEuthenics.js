import { companies, criteria, evaluation, recommendation, weightedScore } from './data/euthenics.js';

// The Euthenics room works exactly like the main room: each section is a
// beacon on the hologram (lat/lng place it), and the open section's items orbit
// as satellites. Ids are unique across both rooms so one hash router and one
// store serve both.
export const EU_HOME = { id: 'euthenics', label: 'Overview' };

export const EU_SECTIONS = [
  { id: 'eu-companies', label: 'Top 3 Companies', hint: 'Accenture · Civicom · Uratex', lat: 30, lng: 120 },
  { id: 'eu-criteria', label: 'Criteria', hint: `${criteria.length} weighted criteria`, lat: -26, lng: 160 },
  { id: 'eu-compare', label: 'Comparison', hint: 'Side-by-side table', lat: 18, lng: 205 },
  { id: 'eu-verdict', label: 'Recommendation', hint: 'Final pick', lat: -12, lng: 250 },
];

export const EU_ALL = [EU_HOME, ...EU_SECTIONS];

// Where the hologram faces when the room opens (between the first two beacons).
export const EU_HOME_PIN = { lat: 6, lng: 140, label: evaluation.title };

const pick = companies.find((c) => c.id === recommendation.choice);

export function euSatellitesFor(section) {
  switch (section) {
    case 'eu-companies':
      return companies.map((c) => ({ id: `eu-co-${c.id}`, label: c.name }));
    case 'eu-criteria':
      return criteria.map((c) => ({ id: `eu-crit-${c.id}`, label: `${c.name} · ${c.weight}%` }));
    case 'eu-compare':
      return [
        ...criteria.map((c) => ({ id: `eu-row-${c.id}`, label: c.name })),
        { id: 'eu-row-total', label: 'Weighted total' },
      ];
    case 'eu-verdict':
      return [
        { id: 'eu-v-choice', label: `${pick.name} · ${weightedScore(pick).toFixed(2)}` },
        { id: 'eu-v-runner', label: 'Runner-up' },
        { id: 'eu-v-next', label: 'Next steps' },
      ];
    default:
      return [];
  }
}
