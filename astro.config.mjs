import { defineConfig } from 'astro/config';
import react from '@astrojs/react';

// https://astro.build/config
export default defineConfig({
  output: 'static',
  integrations: [
    react(),
  ],
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'es'],
    routing: {
      prefixDefaultLocale: false,
    },
  },
  image: {
    domains: ['f4.bcbits.com', 'placehold.co'],
    remotePatterns: [
      { protocol: 'http' },
      { protocol: 'https' },
    ],
  },
});
