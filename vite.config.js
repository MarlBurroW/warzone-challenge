import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

export default defineConfig({
  plugins: [vue()],
  server: {
    host: "dev.marlburrow.io",
  },
  meteor: {
    clientEntry: "imports/ui/main.js",
  },
  optimizeDeps: {
    exclude: ["vue-meteor-tracker"],
  },
});
