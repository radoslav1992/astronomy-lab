# Astronomy Lab

An Astro astronomy learning site with a midnight observatory theme, icy cyan and starlight accents, locally optimized NASA imagery, and responsive interactive diagrams.

## Included

- Interactive homepage planet selector and eight planet fact guides (size, diameter, gravity, mass, density, distance from the Sun and Earth, day and year length, moons) with to-scale size comparisons, question-style sections, and FAQs.
- Planet comparison page at `/planets/compare/`: all eight planets drawn to scale, a sortable data table, a weight-on-every-planet calculator, and planet records.
- Ten labs: Keplerian orbits, Moon phases with approximate date estimates, gravity and escape speed, light travel time, stellar color and luminosity, telescope optics (magnification, true field, exit pupil, Dawes’ limit, maximum useful power, focal ratio), exoplanet transits, parallax, black hole radius, and magnitude comparison. Each lab and field note lists its key formulas and a worked-examples table generated from the lab presets.
- Schwarzschild radius calculator (solar, Jupiter, Earth masses or kilograms) on the black hole field note.
- Editable numbers and sliders, presets, playback where relevant, reset, shareable settings, and SVG downloads.
- Ten field notes, formula and unit reference, contextual FAQs, and 30 practice questions with explanations and topic filters.
- Classroom kit: a teacher hub at `/teachers/`, a printable one-page student activity for every lab at `/labs/<lab>/activity/`, and teacher answer keys at `/teachers/answers/<lab>/` (noindex, out of the sitemap, no ads). Activity content lives in `src/lib/activities.mjs`; answer-key tables are filled from each lab’s own readouts, and `tests/activities.test.mjs` checks every number printed in an answer against `science.mjs`. NGSS connections are listed only where a lab clearly fits.
- Share to Google Classroom links (`src/components/ClassroomShare.astro`) on labs, field notes, activities and the teacher hub. They are plain links to `classroom.google.com/share?url=…` with `?classroom=1` added to the shared URL; canonical tags stay clean.
- Static HTML for all 60 pages; accessible native controls, focus states, reduced motion support, and mobile layouts.
- Search/filter on the lab directory. All calculations and quizzes run locally; no backend or API key required.
- Live NASA image library at `/library/`: topic searches, paginated results, accessible image dialogs, source metadata, larger previews, and original-file links. Uses the public NASA Image and Video Library API without an API key, with abortable requests, timeouts, session caching, and retry states.

## Development

Use Node 22 LTS or newer.

```sh
npm ci
npm run dev
npm test
npm run build
npm run preview
```

## Cloudflare Pages deployment

Connect this repository, select `main`, use `npm run build`, and publish the `dist` directory. No Worker, database, or runtime bindings are needed.

The production origin is configured as `https://theastronomylab.com` in `astro.config.mjs`. Every build generates canonical URLs, Open Graph URLs, `sitemap-index.xml`, its child sitemap, and the sitemap entry in `robots.txt` using this domain. No `SITE_URL` environment variable is required. If the domain changes, update the Astro configuration and rebuild. Set `NODE_VERSION` to `22` if the host needs it.

The project intentionally does not reuse Geometry Lab or Physics Lab analytics IDs.

## Science and imagery

Numerical models are in `src/lib/science.mjs`, diagrams in `src/lib/render.mjs`, and model explanations and bounds in `src/lib/labs.mjs`. The site documents simplifications next to each lab. It is not a live sky map or precision observing service. Moon dates use a mean synodic cycle. Transit models include circular-disk overlap but no limb darkening. Planet table diameters are equatorial; the gravity tool uses mean Earth radius.

Planet reference data: https://nssdc.gsfc.nasa.gov/planetary/factsheet/ (values and units documented in `src/lib/planets.mjs`). Distances from Earth follow NASA’s perihelion/aphelion convention; moon counts include discoveries announced through 2025 (Uranus 29 counts S/2025 U1) and should be refreshed as new moons are confirmed.

SEO: every page has a unique title, description, and canonical URL; inner pages emit BreadcrumbList JSON-LD, the homepage emits WebSite JSON-LD, and pages with visible FAQs emit FAQPage JSON-LD. Lab and field-note titles and descriptions live in `src/lib/labs.mjs` (`title`, `summary`, `learnTitle`, `learnSummary`).

Image source manifest: `src/lib/images.json`. Original NASA source links, mission credits, processing notes, and the Webb NASA/ESA/CSA/STScI credit are shown on `/about/`. Images are hosted locally as WebP (about 443 kB combined). NASA does not endorse this independent site. Refer to NASA media guidance for reuse; third-party credits remain applicable.

Google Fonts provides DM Sans and Space Grotesk. The image library sends search terms to images-api.nasa.gov and loads images from images-assets.nasa.gov. The educational tools and locally stored planet photos operate without those services. Google Analytics (G-JB1EBJHB4W) measures site usage through the shared page layout. Adsterra serves labeled banner and native ads (see Advertising below). `/privacy/` explains analytics, ads, cookies, and opt-outs; keep it current when services change.

## Advertising

Adsterra ad units live in `src/lib/ads.mjs` (unit keys from the Adsterra publisher dashboard, the ad host, and the production domain). `src/components/AdSlot.astro` renders one labeled, space-reserved slot:

- `leaderboard`: 728×90 on screens 800 px and wider, 320×50 on phones. The layout places it above the footer on every page; pass `ads={false}` to `Layout` to omit it (the 404 page does).
- `rectangle`: 300×250 after the first main content block on lab, field-note, planet, planet-comparison, and formula pages, never inside a lab workspace.
- `native`: Adsterra native banner near the end of lab, field-note, planet, and planet-comparison pages, before the FAQ. The formula page skips it because it would sit right next to the footer leaderboard.

Detail pages carry at most three slots; hubs, the home page, the library, practice, about, and privacy carry only the leaderboard. No popunders, social bars, smartlinks, interstitials, or sticky ads are used. Slots load lazily (300 px before they scroll into view) and only on `theastronomylab.com`, so local and preview builds never request ads. Banner snippets share Adsterra’s global `atOptions`, so the loader injects them strictly one after another.

Classroom ad-free rule: `src/components/AdFree.astro` runs first in `<head>`. When a visitor arrives from Google Classroom, Canvas (`*.instructure.com`) or Schoology, or on a URL carrying `?classroom` (added by the Share to Google Classroom links), it adds `ad-free` to `<html>` and stores `adFreeUntil` in local storage for 30 days. `AdSlot` then loads no ad code and hides every slot. The teacher hub and answer keys pass `ads={false}`, so they never show ads.

Cookie consent: `src/components/ConsentDefaults.astro` runs first in `<head>` and sets Google Consent Mode v2 defaults — analytics and ad storage are denied by default in the EEA, the UK and Switzerland and granted elsewhere — and restores a saved choice (`cookieConsent` in localStorage, kept 180 days). Visitors whose time zone is in Europe see `src/components/ConsentBanner.astro`, a small non-blocking banner with equally weighted Accept and Reject buttons. Until they accept, `AdSlot` neither shows nor loads ads; Reject keeps analytics cookie-free and shows no ads. *Cookie settings* in the footer reopens the banner, and accepting later starts ads without a reload. Students arriving from school platforms stay ad-free regardless of their choice.

## Verification

`npm test` checks known physical benchmarks, conservation in the Kepler model, transit geometry, invalid-input handling, and all diagram states at defaults/presets/input extremes. `npm run build` produces 60 pages. `node scripts/check-build.mjs` checks local asset/navigation links, headings, and structured data in the built pages, and that answer keys are noindex, ad-free and absent from the sitemap. `tests/ads.test.mjs` checks the ad unit keys and that the ad domain matches the production site.

Interactive browser QA could not be completed in the authoring environment because its browser blocked the local preview connection. Review desktop and mobile appearance, keyboard operation, playback, clipboard, and SVG downloads on your deployment before release.
