import test from 'node:test';import assert from 'node:assert/strict';import {ads} from '../src/lib/ads.mjs';import config from '../astro.config.mjs';
test('Adsterra unit keys are well-formed and distinct',()=>{const keys=[ads.native,ads.leaderboard,ads.mobile,ads.rectangle];for(const key of keys)assert.match(key,/^[0-9a-f]{32}$/);assert.equal(new Set(keys).size,keys.length);});
test('Ads load over HTTPS and only on the production domain',()=>{assert.equal(new URL(ads.host).protocol,'https:');assert.equal(ads.domain,new URL(config.site).hostname);});
