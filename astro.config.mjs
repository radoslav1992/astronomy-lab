import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
// Set SITE_URL to your production origin in Cloudflare before deployment.
const site = process.env.SITE_URL;
if (site && !/^https?:\/\//.test(site)) throw new Error('SITE_URL must be an absolute http(s) URL');
export default defineConfig({site,output:'static',trailingSlash:'always',integrations:site?[sitemap({filter:page=>!page.endsWith('/404/')})]:[],vite:{server:{allowedHosts:['terminal.local']}}});
