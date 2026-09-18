import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://theastronomylab.com',
  output: 'static',
  trailingSlash: 'always',
  integrations: [sitemap({filter: page => !/\/404(?:\/|\.html)?$/.test(page)})],
  vite: {server: {allowedHosts: ['terminal.local']}},
});
