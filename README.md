## Website for Longhorn Baja Racing - LBR
The University of Texas at Austin Baja SAE Team Official Website

### How the site is organized

- `/` is one long page: hero, About, Subteams, Team, Sponsors, Merch, Calendar, and Join.
  The navigation scrolls to each section. The old `/about/`, `/subteams/`, `/members/`,
  `/sponsors/`, and `/contact/` pages forward to their section on the home page.
- `/merch/` (full catalog) and `/calendar/` (full agenda) are standalone pages.
- Content lives in `lib/`: `site.ts` (links, email, sections), `subteams.ts`, `members.ts`,
  `sponsors.ts`, and `merch.ts`. Edit those files to update the site.

### 3D scene

`components/scene/` holds the three.js scene behind the hero and the subteam walkthrough.
`shots.ts` defines one camera shot per subteam; each step on the page has a matching
`data-shot` attribute. three.js loads after the page is interactive, renders only while
its sections are on screen, lowers its resolution on slow devices, and is skipped on
machines without a GPU. Add `?3d=force` to the URL to run it anyway.

### Seasonal decorations

`lib/seasons.ts` lists short seasonal treats (bluebonnets, fireflies, fall leaves, winter
lights). Each switches on and off by itself on its dates, and `npm run test:hub` fails if
any window runs longer than 31 days. Preview one with `?season=autumn` (or `winter`,
`bluebonnets`, `fireflies`); `?season=off` hides them.
