# Acemer Berroya — Portfolio

A portfolio with a short cinematic intro, then a slideshow of floating cards: Home with highlight (KPI) cards, then Projects, Experience, Skills, About, Education and Contact. Built with React 18, Vite 5 and Framer Motion; no backend required.

## Run locally

Requires Node.js 18 or newer.

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # production build into dist/
npm run preview    # serve the production build at http://localhost:4173
```

## Deploy to Vercel

**Option A: GitHub import (recommended)**

1. Create a new GitHub repository (e.g. `portfolio`) and push this folder:
   ```bash
   git init
   git add .
   git commit -m "Initial portfolio"
   git branch -M main
   git remote add origin https://github.com/YOUR-USERNAME/portfolio.git
   git push -u origin main
   ```
2. In Vercel, choose **Add New → Project**, import the repository.
3. Vercel detects **Vite** automatically (build command `npm run build`, output directory `dist`). Click **Deploy**.

Every push to `main` redeploys the site.

**Option B: Vercel CLI**

```bash
npm i -g vercel
vercel          # first run links the project; accept the detected Vite settings
vercel --prod   # deploy to production
```

**After the first deploy:** for link previews that work everywhere, change `/og-image.png` in `index.html` (`og:image` and `twitter:image`) to the full URL, e.g. `https://your-site.vercel.app/og-image.png`, and add `<meta property="og:url" content="https://your-site.vercel.app/" />`.

## Edit content

All text lives in `src/data/profile.js`: contact details, summary, skills, experience, projects and education.

## Swap in real images

- **Profile photo:** add the image to `public/` (e.g. `public/profile.jpg`) and set `photo: '/profile.jpg'` in `src/data/profile.js`. It replaces the monogram in the hero diagram and the About section.
- **Project screenshots:** add images to `public/` and replace the SVG illustrations in `src/components/Previews.jsx` with `<img>` tags (an example is in the file's header comment).
- **Social preview:** replace `public/og-image.png` (1200 × 630).

## Project structure

```
index.html                 SEO + Open Graph tags, theme script, and the intro
                           (inline HTML/CSS so it shows the moment the tab opens)
public/                    favicon.svg, og-image.png, robots.txt, fonts/ (self-hosted font)
src/main.jsx               entry; MotionConfig (honours reduced motion); tells the intro the app is ready
src/App.jsx                slides, navigation (keys, hash) and intro
src/film.js                shared slideshow navigation
src/data/profile.js        all content
src/hooks/                 theme, media query
src/components/            Filmstrip (slides), Reel (controls), Header, Hero,
                           Topology, Kpis, Project, Previews,
                           Experience, Skills, About, Education, Contact, Footer
src/styles/global.css      design tokens (light/dark) and all styles
```

## Accessibility notes

- The site opens in light mode; visitors can switch to dark mode in the header, and the choice is remembered.
- With `prefers-reduced-motion`, intro animations and packet effects are skipped and scrolling jumps instead of gliding.
- Navigation: Left/Right arrows, Page Up/Down, Home/End, swipe on touch screens, or the controls at the bottom. Each slide has its own link (e.g. `/#contact`).
- Keyboard: skip link, visible focus on every control, diagram nodes are real links, copy buttons announce when something is copied.
