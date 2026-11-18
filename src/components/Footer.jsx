import { profile } from '../data/profile.js';

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <p>© {new Date().getFullYear()} {profile.name}</p>
        <p>Built with React and Vite. Deployed on Vercel.</p>
      </div>
    </footer>
  );
}
