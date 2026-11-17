import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

import { SERVICES } from "./src/site-content";

/**
 * The whole site is prerendered to static HTML at build time.
 *
 * Nothing here is per-request: the services, the film and the pages are the
 * same for every visitor. Rendering them once at build gives a crawler real
 * Hebrew markup rather than an empty shell, removes the cold start a server
 * would add in front of a 3MB video, and leaves nothing running to go wrong.
 *
 * Every route is listed rather than left to the crawler alone, so a page
 * stays in the build even if the link to it ever stops being rendered.
 */
const PAGES = [
  "/",
  "/about",
  "/training",
  "/articles",
  ...SERVICES.map((service) => `/services/${service.slug}`),
].map((path) => ({ path }));

export default defineConfig({
  resolve: { tsconfigPaths: true },
  // The TanStack Start plugin must run before React's.
  plugins: [
    tanstackStart({
      pages: PAGES,
      prerender: { crawlLinks: true, enabled: true, failOnError: true },
    }),
    react(),
  ],
});
