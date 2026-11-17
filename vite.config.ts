import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// Rendering happens on the server, so nothing here may touch window, document
// or localStorage during render or at module top level -- only inside effects.
export default defineConfig({
  resolve: { tsconfigPaths: true },
  // The TanStack Start plugin must run before React's.
  plugins: [tanstackStart(), react()],
});
