# Astronomy Lab

An Astro astronomy learning site with a midnight observatory theme, icy cyan and starlight accents, locally optimized NASA imagery, and responsive interactive diagrams.

## Included

- Interactive homepage planet selector and eight planet fact guides (size, diameter, gravity, mass, density, distance from the Sun and Earth, day and year length, moons) with to-scale size comparisons, question-style sections, and FAQs.
- Planet comparison page at `/planets/compare/`: all eight planets drawn to scale, a sortable data table, a weight-on-every-planet calculator, and planet records.
- Thirteen labs: Keplerian orbits, Moon phases with approximate date estimates, seasons (axial tilt, noon Sun altitude, day length), solar and lunar eclipses (total, annular, partial, penumbral), gravity and escape speed, light travel time, stellar color and luminosity, telescope optics (magnification, true field, exit pupil, Dawes’ limit, maximum useful power, focal ratio), a telescope field-of-view simulator (eight targets drawn to scale in the eyepiece), exoplanet transits, parallax, black hole radius, and magnitude comparison. Each lab and field note lists its key formulas and a worked-examples table generated from the lab presets.
- Schwarzschild radius calculator (solar, Jupiter, Earth masses or kilograms) on the black hole field note.
- Editable numbers and sliders, drop-down choices (telescope target, eclipse type), presets, playback where relevant, reset, shareable settings, and SVG downloads.
- Thirteen field notes, formula and unit reference, contextual FAQs, and 36 practice questions with explanations and topic filters.
- Classroom kit: a teacher hub at `/teachers/`, a printable one-page student activity for every lab at `/labs/<lab>/activity/`, and teacher answer keys at `/teachers/answers/<lab>/` (noindex, out of the sitemap, no ads). Activity content lives in `src/lib/activities.mjs`; answer-key tables are filled from each lab’s own readouts, and `tests/activities.test.mjs` checks every number printed in an answer against `science.mjs`. NGSS connections are listed only where a lab clearly fits.
- Share to Google Classroom links (`src/components/ClassroomShare.astro`) on labs, field notes, activities and the teacher hub. They are plain links to `classroom.google.com/share?url=…` with `?classroom=1` added to the shared URL; canonical tags stay clean.
- Static HTML for all 72 pages; accessible native controls, focus states, reduced motion support, and mobile layouts.
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

The three newest labs follow the same pattern, with these models:

- **Telescope view** (`telescopeView()`, `targets`, `angular()`): reuses `telescope()`. Target sizes are approximate. The Moon, Sun and planets are worked out from the diameters and distances in `planets.mjs` (Moon and Sun at mean distance, planets at an average opposition, Saturn’s rings from `RING_SPAN`); the Pleiades (110′), Andromeda Galaxy (190′ × 60′) and Orion Nebula (65′ × 60′) use commonly quoted catalogue extents. The finest visible detail is the larger of Dawes’ limit and 60″ ÷ magnification (a sharp eye resolves about one arcminute). The Sun is a size reference only and every view of it carries a solar-filter warning.
- **Seasons** (`sun()`, `seasons()`, `dayOfYear()`, `dayLabel()`): the Sun’s ecliptic longitude and distance come from the Astronomical Almanac’s low-precision formulas evaluated for noon UT in 2026; declination is sin δ = sin(tilt) × sin(longitude), noon altitude 90° − |latitude − δ|, and day length the sunrise equation without refraction (24 h and 0 h in polar day and night). Tests check the 2026 equinox and solstice times and the perihelion and aphelion distances in `planets.mjs`.
- **Eclipses** (`eclipse()`): similar-triangle shadow geometry for spheres, using the Sun’s radius, Earth’s mean radius, the Moon’s diameter from `planets.mjs`, and the Moon’s distances and 5.145° orbital tilt from the NASA Moon fact sheet (constants at the top of `science.mjs`). A solar eclipse is judged at the best-placed spot on Earth; a lunar eclipse by the Moon’s offset from the axis of Earth’s shadow. Earth’s atmosphere, Earth’s rotation and timings are left out, and the lab does not predict real eclipses.

A lab field can be a drop-down: `pick()` in `labs.mjs` stores the chosen option’s index as the field’s value, so links, presets, worksheets and tests treat it like any other number. A lab’s optional `related` list names the labs offered first under “Your next discovery” and linked from its field note. Diagrams with short labels pass `legible` to `svg()` in `render.mjs`, which enlarges their text on phones.

Planet reference data: https://nssdc.gsfc.nasa.gov/planetary/factsheet/ (values and units documented in `src/lib/planets.mjs`). Distances from Earth follow NASA’s perihelion/aphelion convention; moon counts include discoveries announced through 2025 (Uranus 29 counts S/2025 U1) and should be refreshed as new moons are confirmed.

SEO: every page has a unique title, description, and canonical URL; inner pages emit BreadcrumbList JSON-LD, the homepage emits WebSite JSON-LD, pages with visible FAQs emit FAQPage JSON-LD, and lab pages emit LearningResource JSON-LD. Lab and field-note titles and descriptions live in `src/lib/labs.mjs` (`title`, `summary`, `learnTitle`, `learnSummary`); a lab can also set `h1` (page heading, defaults to `name`) and `intro` (opening paragraph, defaults to `summary`). Wording follows Search Console queries: the light travel lab answers “how long to travel N light-years” with tables built by `src/components/LightQuickAnswers.astro` from `light()`, `travel()` and `duration()` in `science.mjs`; planet pages and `/planets/compare/` show each diameter as a ratio and percentage of Earth’s (`sizeRanking()` and `pct()` in `planets.mjs`). Every lab, field note and classroom activity links to the other two by name.

HTTPS: the site is static and cannot redirect `http://` requests itself, and `http://` URLs have appeared in Google Search. Turn on **Always Use HTTPS** for the zone in the Cloudflare dashboard (SSL/TLS → Edge Certificates) and, ideally, HSTS there as well. This repo ships no `public/_headers` file; if you add one for a `Strict-Transport-Security` header, do not add host- or scheme-based `_redirects` rules, which Cloudflare’s static asset hosting rejects.

Image source manifest: `src/lib/images.json`. Original NASA source links, mission credits, processing notes, and the Webb NASA/ESA/CSA/STScI credit are shown on `/about/`. Images are hosted locally as WebP (about 443 kB combined). NASA does not endorse this independent site. Refer to NASA media guidance for reuse; third-party credits remain applicable.

Google Fonts provides DM Sans and Space Grotesk. The image library sends search terms to images-api.nasa.gov and loads images from images-assets.nasa.gov. The educational tools and locally stored planet photos operate without those services. Google Analytics (G-JB1EBJHB4W) measures site usage through the shared page layout. The site shows no ads (see Advertising below). `/privacy/` explains analytics, cookies, and opt-outs; keep it current when services change.

## Advertising

The Astronomy Lab shows no ads. `src/lib/ads.mjs` holds no unit keys, so `src/components/AdSlot.astro` renders nothing: no markup, no script, and no request to an ad network. Adsterra was removed in November 2026 because its filters do not block dating and fake-alert ads, which are not acceptable on a site used in classrooms.

The switch is kept so ads could return with a network that is safe for schools. The `<AdSlot>` placements stay in the pages, and `AdUnit.astro` (the unit and its loader) and `AdFree.astro` (no ads for visitors from Google Classroom, Canvas or Schoology) only run when keys are set. The privacy, about and teacher pages say the site has no ads, so restore their advertising sections before setting keys; `tests/ads.test.mjs` fails as a reminder.

Cookie consent: `src/components/ConsentDefaults.astro` runs first in `<head>` and sets Google Consent Mode v2 defaults — analytics and ad storage are denied by default in the EEA, the UK and Switzerland and granted elsewhere — and restores a saved choice (`cookieConsent` in localStorage, kept 180 days). Visitors whose time zone is in Europe see `src/components/ConsentBanner.astro`, a small non-blocking banner with equally weighted Accept and Reject buttons. Until they accept, Google Analytics runs without cookies; Reject keeps it cookie-free. *Cookie settings* in the footer reopens the banner.

## Verification

`npm test` checks known physical benchmarks, conservation in the Kepler model, transit geometry, telescope target sizes, the seasons and eclipse models (including their limits and edge cases), invalid-input handling, all diagram states at defaults/presets/input extremes and every drop-down option, and the numbers quoted in lab copy and answer keys. `npm run build` produces 72 pages. `node scripts/check-build.mjs` checks local asset/navigation links, headings, and structured data in the built pages, that every lab has its lab, field-note, activity and answer-key page, and that answer keys are noindex, ad-free and absent from the sitemap. `tests/ads.test.mjs` checks that ads are switched off and that the ad domain matches the production site.

Interactive browser QA could not be completed in the authoring environment because its browser blocked the local preview connection. Review desktop and mobile appearance, keyboard operation, playback, clipboard, and SVG downloads on your deployment before release. The telescope view, seasons and eclipse labs were driven in headless Chromium against the preview build at 1280, 390 and 360 px wide: controls, presets, playback, shared links and downloads, with every readout compared against `render()`.

## llms.txt

`public/llms.txt` is a plain-text guide to the site for AI assistants (see llmstxt.org): one line per page with
its title and description. ChatGPT is one of the site's main sources of visitors, and it can only recommend a
tool it can read about. The file is generated from the built pages, so regenerate it after changing a title or
description, or adding a page:

```sh
npm run build && npm run llms
```

`tests/llms.test.mjs` fails if a lab is missing from the file.
