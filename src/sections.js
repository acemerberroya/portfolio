import {
  allProjects, experience, hardSkills, education, certificates, profile,
} from './data/profile.js';

// Section ids match the original site, so old links like /#contact still work.
// lat/lng place each section's beacon on the globe. About sits on the real
// spot (San Pedro City, Philippines); the others fan out around it so moving
// between sections turns the globe.
export const SECTIONS = [
  { id: 'project', label: 'Projects', hint: `${allProjects.length} projects`, lat: 38, lng: 78 },
  { id: 'experience', label: 'Experience', hint: '2024 – now', lat: -24, lng: 88 },
  { id: 'skills', label: 'Skills', hint: 'Stack map', lat: 2, lng: 168 },
  { id: 'about', label: 'About', hint: 'Summary', lat: 14.36, lng: 121.06 },
  { id: 'education', label: 'Education', hint: 'STI Alabang', lat: -38, lng: 140 },
  { id: 'contact', label: 'Contact', hint: 'Say hello', lat: 44, lng: 152 },
];

export const HOME = { id: 'top', label: 'Home' };
export const ALL = [HOME, ...SECTIONS];
export const HOME_PIN = { lat: 14.36, lng: 121.06, label: profile.location };

export const slug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

// The items each section shows as orbiting satellites. Ids match the
// data-item attributes in the panel, so selecting one highlights the other.
export function satellitesFor(section) {
  switch (section) {
    case 'project':
      return allProjects.map((p) => ({ id: `project-${slug(p.name)}`, label: p.name }));
    case 'experience':
      return experience.items.map((t, i) => ({ id: `exp-${i}`, label: t.replace(/\.$/, '') }));
    case 'skills':
      return hardSkills.map((s) => ({ id: `hard-${slug(s.title)}`, label: s.title }));
    case 'about':
      return [
        { id: 'fact-based', label: profile.location },
        { id: 'fact-goal', label: 'Cloud and network engineering' },
      ];
    case 'education':
      return [
        { id: 'edu-degree', label: education.school },
        ...certificates.map((c) => ({ id: `cert-${slug(c.title)}`, label: `${c.title} · ${c.year}` })),
      ];
    case 'contact':
      return [
        { id: 'contact-email', label: 'Email' },
        { id: 'contact-phone', label: 'Phone' },
        { id: 'contact-github', label: 'GitHub' },
        { id: 'contact-location', label: 'Location' },
      ];
    default:
      return [];
  }
}
