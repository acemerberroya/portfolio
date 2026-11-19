import { ALL, HOME, HOME_PIN, SECTIONS, satellitesFor } from './sections.js';
import { EU_ALL, EU_HOME, EU_HOME_PIN, EU_SECTIONS, euSatellitesFor } from './sectionsEuthenics.js';

// The two holograms (portfolio globe and Euthenics core) share one
// interaction model and one room. Everything that differs between them (sections, home, where the hub faces, satellites, colours) lives here.
export const ROOMS = {
  main: {
    id: 'main',
    label: 'Portfolio',
    all: ALL,
    sections: SECTIONS,
    homeId: HOME.id,
    homePin: HOME_PIN,
    satellitesFor,
    palette: { base: '#5fd8ff', active: '#ffbf5a' },
  },
  euthenics: {
    id: 'euthenics',
    label: 'Euthenics',
    all: EU_ALL,
    sections: EU_SECTIONS,
    homeId: EU_HOME.id,
    homePin: EU_HOME_PIN,
    satellitesFor: euSatellitesFor,
    palette: { base: '#ffb648', active: '#fff1d0' },
  },
};

export const ALL_IDS = Object.values(ROOMS).flatMap((r) => r.all.map((s) => s.id));
export const roomOf = (id) => Object.values(ROOMS).find((r) => r.all.some((s) => s.id === id))?.id ?? null;
export const isRoomHome = (id) => Object.values(ROOMS).some((r) => r.homeId === id);
