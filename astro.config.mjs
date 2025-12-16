// @ts-check
import { defineConfig } from 'astro/config';

import react from '@astrojs/react';

// https://astro.build/config
export default defineConfig({
  integrations: [react()],

  output: "static",
  outDir: "docs",
  site: 'https://shinich39.github.io',
  base: '/web-vocaloid-player/docs',
});