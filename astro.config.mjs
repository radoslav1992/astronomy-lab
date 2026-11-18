import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import {isIndexable} from './src/lib/indexing.mjs';

export default defineConfig({
  site: 'https://theastronomylab.com',
  output: 'static',
  trailingSlash: 'always',
  // The sitemap lists only indexable pages: the 404 page, teacher answer keys and printable activities are noindex
  // (src/lib/indexing.mjs explains why).
  integrations: [sitemap({filter: isIndexable})],
  vite: {server: {allowedHosts: ['terminal.local']}},
});
