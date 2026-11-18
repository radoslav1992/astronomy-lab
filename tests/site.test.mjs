// Checks on the built site in dist/: the sitemap lists exactly the indexable pages, robots tags follow
// src/lib/indexing.mjs, canonicals are self-referencing, internal links resolve with trailing slashes and never use
// http://, every indexable page is within two clicks of the home page, hubs link all their children, and titles and
// descriptions fit search snippets. Run `npm run build` first (`npm run check` does both); without dist/ these tests
// are skipped.
import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { isIndexable } from '../src/lib/indexing.mjs';
import { labs } from '../src/lib/labs.mjs';
import { planets } from '../src/lib/planets.mjs';

const origin = 'https://theastronomylab.com';
const dist = fileURLToPath(new URL('../dist/', import.meta.url));
const built = existsSync(join(dist, 'sitemap-0.xml'));
const skip = built ? false : 'dist/ not built: run `npm run build` first';

const ENTITIES = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ' };
const decode = s => s.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (m, c) => c[0] === '#' ? String.fromCodePoint(c[1].toLowerCase() === 'x' ? parseInt(c.slice(2), 16) : Number(c.slice(1))) : ENTITIES[c.toLowerCase()] ?? m);
const walk = dir => readdirSync(dir).flatMap(f => { const p = join(dir, f); return statSync(p).isDirectory() ? walk(p) : [p]; });

function load() {
  const files = walk(dist);
  const assets = new Set(files.map(f => '/' + relative(dist, f).split('\\').join('/')));
  const pages = {};
  for (const f of files.filter(f => f.endsWith('.html'))) {
    const rel = relative(dist, f).split('\\').join('/');
    const path = rel === '404.html' ? '/404/' : '/' + rel.replace(/index\.html$/, '');
    const html = readFileSync(f, 'utf8');
    pages[path] = {
      html,
      title: decode((html.match(/<title>([^<]*)<\/title>/) || [])[1] ?? ''),
      description: decode((html.match(/<meta name="description" content="([^"]*)"/) || [])[1] ?? ''),
      robots: (html.match(/<meta name="robots" content="([^"]*)"/) || [])[1] ?? '',
      canonical: decode((html.match(/<link rel="canonical" href="([^"]*)"/) || [])[1] ?? ''),
      hrefs: [...html.matchAll(/<a\b[^>]*?\shref="([^"]*)"/g)].map(m => decode(m[1])),
    };
  }
  const sitemap = [...readFileSync(join(dist, 'sitemap-0.xml'), 'utf8').matchAll(/<loc>([^<]*)<\/loc>/g)].map(m => m[1]);
  return { pages, assets, sitemap };
}
const data = built ? load() : null;
/** Site path for an internal href, or null for external, mailto and same-page links. */
const internalPath = href => {
  if (/^(mailto:|tel:|#|javascript:)/.test(href)) return null;
  const u = new URL(href, origin + '/');
  return u.hostname === new URL(origin).hostname ? u.pathname : null;
};
const noindex = page => /noindex/.test(page.robots);
const links = path => new Set(data.pages[path].hrefs.map(internalPath).filter(Boolean));

test('the sitemap lists exactly the indexable pages, once each, as https URLs with trailing slashes', { skip }, () => {
  const { pages, sitemap } = data;
  assert.equal(new Set(sitemap).size, sitemap.length, 'duplicate sitemap URLs');
  for (const url of sitemap) assert.ok(url.startsWith(origin + '/') && url.endsWith('/'), url);
  const indexable = Object.keys(pages).filter(p => !noindex(pages[p])).map(p => origin + p).sort();
  assert.deepEqual([...sitemap].sort(), indexable);
  for (const url of sitemap) assert.ok(!noindex(pages[new URL(url).pathname]), `noindex page in sitemap: ${url}`);
});

test('robots tags follow src/lib/indexing.mjs; activities, answer keys and the 404 page are noindex, follow', { skip }, () => {
  for (const [path, page] of Object.entries(data.pages)) {
    assert.equal(noindex(page), !isIndexable(path), `${path}: ${page.robots}`);
    if (noindex(page)) assert.match(page.robots, /(^|,)\s*follow/, `${path} must stay follow`);
  }
  for (const lab of labs) assert.ok(noindex(data.pages[`/labs/${lab.id}/activity/`]), lab.id);
  assert.ok(noindex(data.pages['/404/']), '/404/');
});

test('indexable pages have a self-referencing https canonical with a trailing slash', { skip }, () => {
  for (const [path, page] of Object.entries(data.pages)) {
    if (!noindex(page)) assert.equal(page.canonical, origin + path, path);
    else if (page.canonical) assert.equal(page.canonical, origin + path, path);
  }
});

test('internal links resolve, use trailing slashes, and nothing links over http://', { skip }, () => {
  const { pages, assets } = data;
  for (const [path, page] of Object.entries(pages)) {
    assert.doesNotMatch(page.html, /(href|src|content)="http:\/\//, `${path} has an http:// URL`);
    for (const href of page.hrefs) {
      const target = internalPath(href);
      if (target === null) continue;
      if (/\.[a-z0-9]+$/i.test(target)) { assert.ok(assets.has(target), `${path} links missing file ${href}`); continue; }
      assert.ok(target.endsWith('/'), `${path} links ${href} without a trailing slash`);
      assert.ok(pages[target], `${path} links ${href}, which is not built`);
    }
  }
});

test('every indexable page is within two clicks of the home page', { skip }, () => {
  const { pages } = data;
  const depth = { '/': 0 }, queue = ['/'];
  while (queue.length) {
    const p = queue.shift();
    for (const href of pages[p].hrefs) { const t = internalPath(href); if (t && pages[t] && depth[t] === undefined) { depth[t] = depth[p] + 1; queue.push(t); } }
  }
  for (const p of Object.keys(pages).filter(p => !noindex(pages[p]))) assert.ok(depth[p] !== undefined && depth[p] <= 2, `${p} is ${depth[p] ?? 'not reachable'} clicks from home`);
});

test('hubs link every child, /labs/ explains every lab, and each activity is linked from its lab', { skip }, () => {
  const hub = links('/labs/'), learn = links('/learn/'), teachers = links('/teachers/'), worlds = links('/planets/');
  for (const { id } of labs) {
    assert.ok(hub.has(`/labs/${id}/`) && hub.has(`/learn/${id}/`), `/labs/ is missing ${id} or its lesson`);
    assert.ok(learn.has(`/learn/${id}/`), `/learn/ is missing ${id}`);
    assert.ok(teachers.has(`/labs/${id}/activity/`), `/teachers/ is missing the ${id} activity`);
    assert.ok(links(`/labs/${id}/`).has(`/labs/${id}/activity/`), `${id} does not link its activity`);
  }
  for (const p of planets) assert.ok(worlds.has(`/planets/${p.id}/`), `/planets/ is missing ${p.id}`);
  assert.match(data.pages['/labs/'].html, /"@type":"ItemList"/, '/labs/ has an ItemList');
});

test('titles and descriptions fit search snippets and are unique', { skip }, () => {
  const titles = new Map(), descriptions = new Map();
  for (const [path, page] of Object.entries(data.pages)) {
    if (noindex(page)) continue;
    assert.ok(page.title.length >= 15 && page.title.length <= 60, `${path} title is ${page.title.length} characters: ${page.title}`);
    assert.ok(page.description.length >= 120 && page.description.length <= 160, `${path} description is ${page.description.length} characters`);
    assert.ok(!titles.has(page.title), `${path} repeats the title of ${titles.get(page.title)}`);
    assert.ok(!descriptions.has(page.description), `${path} repeats the description of ${descriptions.get(page.description)}`);
    titles.set(page.title, path); descriptions.set(page.description, path);
  }
  assert.match(data.pages['/'].title, /^The Astronomy Lab/);
});
