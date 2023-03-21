import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
  build: {
    sourcemap: true,
  },
  plugins: [vue()],
  meteor: {
    clientEntry: 'imports/ui/main.ts',
  },
  optimizeDeps: {
    exclude: ['vue-meteor-tracker'],
  },
});
