// @ts-check
import { defineConfig } from 'astro/config';

import react from '@astrojs/react';

// https://astro.build/config
export default defineConfig({
  integrations: [react()],

  output: "static",
  outDir: "docs",
  // site: "https://raw.githubusercontent.com/shinich39/web-vocaloid-player",
  base: "https://raw.githubusercontent.com/shinich39/web-vocaloid-player/main/docs",
});