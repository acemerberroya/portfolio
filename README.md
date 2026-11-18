# Acemer Berroya — 3D Portfolio

A room with a holographic globe in the middle. Your name orbits the globe in gold 3D letters, and
the globe is the menu: every section is a beacon on it, and every open section's items orbit it
as satellites. All content also stays in a readable panel and a normal nav bar, so nobody has
to use the 3D to read it.

Built with React 18, Vite 5, three.js, React Three Fiber and drei. Static site, no backend.

## Run locally

Requires Node.js 18 or newer.

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # production build into dist/
npm run preview    # serve the production build at http://localhost:4173
```

## Deploy (Vercel)

Same as before: push to GitHub, and Vercel's **Vite** preset builds it (`npm run build`, output
`dist`). Any static host that serves `dist/` works.

## Edit content

All text lives in **`src/data/profile.js`**.

- The top half is the original site's content, unchanged (including every AWS entry).
- The bottom half (after the "Added for the 3D portfolio" comment) holds the projects and skills
  merged in from the `portfolio-main` repository: STI-360 and Ball-lalo case-study details,
  Sassy Strands, CommutePH, Pagpag, the Top 10 hard skills, soft skills and the extra languages
  and tools. The TESDA NC II certificate was left out on purpose.
- `src/sections.js` sets where each section's beacon sits on the globe (lat/lng) and which
  items orbit as satellites.

## How the globe works

| On the globe | What it does |
| --- | --- |
| Beacons | One per section. Hover shows a hint; click opens that section and turns the globe to face it. Hovering a nav link lights its beacon and vice versa. |
| Amber pin | San Pedro City, Philippines: where the globe faces on load (About beacon). |
| Satellites | The open section's items (projects, skills, experience, education, contact). Click one to highlight it in the panel; hover an item in the panel and its satellite swings to the front. |
| Drag | Spins the globe, with inertia. |
| Scan sweep | Runs across the globe on every navigation. |
| Keyboard | Tab through the nav; ← / → move between sections; Esc returns home. |

## Performance and fallbacks

- The scene is a separate chunk loaded after the content paints. three.js has its own chunk.
- Pixel ratio capped at 1.75 (1.25 on lite), and dropped to 1 if the frame rate falls.
- No post-processing. Glow is done with additive fresnel shaders. The land is one `Points`
  draw call (5,200 dots precomputed in `src/scene/landDots.json`). Room textures are drawn on
  a canvas at runtime, so there are no image downloads.
- **Lite mode** (phones, touch screens, ≤ 4 GB RAM / ≤ 4 cores, or data saver): half the dots,
  no reflection environment, simpler letters, fewer racks. The panel becomes a bottom sheet
  and the globe shrinks to fit above it.
- **Reduced motion**: nothing spins, the camera jumps instead of gliding, and the canvas only
  redraws when something changes.
- **No WebGL**: the whole portfolio renders as one readable page. Visitors can also pick
  **Page view** in the header at any time (remembered).

## Project structure

```
index.html               SEO + Open Graph tags
public/                  favicon, og-image, profile photo, fonts/ (UI font + 3D name font subset),
                         projects/ (screenshots), demos/pagpag/ (playable Unity build)
src/main.jsx             entry
src/App.jsx              view mode, hash routing, keyboard shortcuts
src/store.js             tiny shared store (panel <-> scene)
src/sections.js          section list, beacon positions, satellites per section
src/data/profile.js      all content
src/content/             one component per section (used by the panel and the page view)
src/ui/                  Header (nav), Panel (overlay), PageView (fallback)
src/scene/               Scene (canvas, camera rig), Room, Globe, NameRing, Satellites,
                         shaders, geo helpers, landDots.json
src/styles/global.css    all styles
```

## Leftover files from the previous version

These are no longer imported and can be deleted:
`src/film.js`, `src/hooks/useTheme.js`, and in `src/components/`: About, Avatar, Contact,
Education, Experience, Filmstrip, Footer, Header, Hero, Kpis, Previews, Project, Reel, Section,
Skills, ThemeToggle, Topology.
