import { useState } from 'react';
import { profile } from '../data/profile.js';
import Section from './Section.jsx';

function CopyButton({ value, label }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  };
  return (
    <button type="button" className="copy-button" onClick={copy}>
      {copied ? 'Copied' : 'Copy'}
      <span className="visually-hidden"> {label}</span>
      <span className="visually-hidden" aria-live="polite">{copied ? `${label} copied` : ''}</span>
    </button>
  );
}

export default function Contact() {
  return (
    <Section id="contact" title="Contact" intro="Have a project or a role in mind? Reach me directly.">
      <ul className="contact-cards">
        <li className="card contact-card">
          <span className="contact-kind">Email</span>
          <a className="contact-value" href={`mailto:${profile.email}`}>{profile.email}</a>
          <CopyButton value={profile.email} label="email address" />
        </li>
        <li className="card contact-card">
          <span className="contact-kind">Phone</span>
          <a className="contact-value" href={profile.phoneHref}>{profile.phone}</a>
          <CopyButton value={profile.phone} label="phone number" />
        </li>
        <li className="card contact-card">
          <span className="contact-kind">GitHub</span>
          <a className="contact-value" href={profile.githubHref} target="_blank" rel="noopener noreferrer">
            {profile.github}
            <span className="visually-hidden"> (opens in a new tab)</span>
          </a>
          <CopyButton value={profile.githubHref} label="GitHub link" />
        </li>
        <li className="card contact-card">
          <span className="contact-kind">Location</span>
          <span className="contact-value">{profile.location}</span>
        </li>
      </ul>
    </Section>
  );
}
