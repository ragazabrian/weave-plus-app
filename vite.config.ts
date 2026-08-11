// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - TanStack devtools (dev-only, first), tanstackStart, viteReact, tailwindcss, tsConfigPaths,
//     nitro (build-only using cloudflare as a default target), VITE_* env injection, @ path alias,
//     React/TanStack dedupe, error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";
import { mcpPlugin } from "@lovable.dev/mcp-js/stacks/tanstack/vite";

export default defineConfig({
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    // nitro/vite builds from this
    server: { entry: "server" },
  },
  // Overrides the cloudflare-module default — this app deploys to Vercel for its free
  // *.vercel.app subdomain.
  nitro: {
    preset: "vercel",
  },
  vite: {
    plugins: [mcpPlugin()],
    build: {
      // @lovable.dev/mcp-js has a Cloudflare-only code path (dead code off that platform) that
      // Rollup can't resolve when targeting a non-Cloudflare preset.
      rollupOptions: { external: ["cloudflare:workers"] },
    },
  },
});
