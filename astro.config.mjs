// @ts-check
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import { defineConfig, fontProviders } from 'astro/config';
import { readFileSync } from 'node:fs';

// データが揃わない統計ページ(data/pages.json の noindex)は sitemap から除外する
let hidden = /** @type {string[] | 'all'} */ ('all');
try { hidden = JSON.parse(readFileSync('./data/pages.json', 'utf8')).noindex ?? []; } catch {}
const isHiddenStat = (/** @type {string} */ p) => {
  const m = p.match(/\/stats\/([a-z-]+)\//);
  return !!m && (hidden === 'all' || hidden.includes(m[1]));
};

// https://astro.build/config
export default defineConfig({
        site: 'https://a-zent.com',
        build: { inlineStylesheets: 'always' },
        integrations: [mdx(), sitemap({ filter: (p) => !/\/(area\/(naha|okinawa|online)|industry)\//.test(p) && !isHiddenStat(p) })],
        fonts: [
                {
                        provider: fontProviders.local(),
                        name: 'Atkinson',
                        cssVariable: '--font-atkinson',
                        fallbacks: ['sans-serif'],
                        options: {
                                variants: [
                                        {
                                                src: ['./src/assets/fonts/atkinson-regular.woff'],
                                                weight: 400,
                                                style: 'normal',
                                                display: 'swap',
                                        },
                                        {
                                                src: ['./src/assets/fonts/atkinson-bold.woff'],
                                                weight: 700,
                                                style: 'normal',
                                                display: 'swap',
                                        },
                                ],
                        },
                },
        ],
});
