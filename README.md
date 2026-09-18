# Astronomy Lab

An Astro astronomy learning site with a midnight observatory theme, icy cyan and starlight accents, locally optimized NASA imagery, and responsive interactive diagrams.

## Included

- Interactive homepage planet selector and eight planet guides with reference data and comparisons.
- Ten labs: Keplerian orbits, Moon phases with approximate date estimates, gravity and escape speed, light travel time, stellar color and luminosity, telescope optics, exoplanet transits, parallax, black hole radius, and magnitude comparison.
- Editable numbers and sliders, presets, playback where relevant, reset, shareable settings, and SVG downloads.
- Ten field notes, formula and unit reference, contextual FAQs, and 30 practice questions with explanations and topic filters.
- Static HTML for all 37 pages; accessible native controls, focus states, reduced motion support, and mobile layouts.
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

**Set the build environment variable `SITE_URL` to the actual production origin** (for example, your own HTTPS domain, without a path), then rebuild. Canonicals, Open Graph URLs, the XML sitemap, and robots.txt will all use that origin. No unowned domain is assumed. Without SITE_URL the app still builds, but canonical URLs and the sitemap are omitted. Set `NODE_VERSION` to `22` if the host needs it.

The project intentionally does not reuse Geometry Lab or Physics Lab analytics IDs.

## Science and imagery

Numerical models are in `src/lib/science.mjs`, diagrams in `src/lib/render.mjs`, and model explanations and bounds in `src/lib/labs.mjs`. The site documents simplifications next to each lab. It is not a live sky map or precision observing service. Moon dates use a mean synodic cycle. Transit models include circular-disk overlap but no limb darkening. Planet table diameters are equatorial; the gravity tool uses mean Earth radius.

Planet reference data: https://nssdc.gsfc.nasa.gov/planetary/factsheet/

Image source manifest: `src/lib/images.json`. Original NASA source links, mission credits, processing notes, and the Webb NASA/ESA/CSA/STScI credit are shown on `/about/`. Images are hosted locally as WebP (about 443 kB combined). NASA does not endorse this independent site. Refer to NASA media guidance for reuse; third-party credits remain applicable.

Google Fonts provides DM Sans and Space Grotesk. The image library sends search terms to images-api.nasa.gov and loads images from images-assets.nasa.gov. The educational tools and locally stored planet photos operate without those services. No analytics or advertising scripts are installed.

## Verification

`npm test` checks known physical benchmarks, conservation in the Kepler model, transit geometry, invalid-input handling, and all diagram states at defaults/presets/input extremes. `npm run build` produces 37 pages. `node scripts/check-build.mjs` checks local asset/navigation links, headings, and structured data in the built pages.

Interactive browser QA could not be completed in the authoring environment because its browser blocked the local preview connection. Review desktop and mobile appearance, keyboard operation, playback, clipboard, and SVG downloads on your deployment before release.
