/// <reference types="vitest" />
import path from 'node:path';
import { jsxLocPlugin } from '@builder.io/vite-plugin-jsx-loc';
import { tanstackRouter } from '@tanstack/router-plugin/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import { nodePolyfills } from 'vite-plugin-node-polyfills';
import svgr from 'vite-plugin-svgr';
import viteTsConfigPaths from 'vite-tsconfig-paths';
export default defineConfig(({ mode: _ }) => {
  // const env = loadEnv(mode, process.cwd(), '');
  return {
    envPrefix: 'APP_',
    server: {
      port: 3000,
    },
    plugins: [
      // this is the plugin that enables path aliases
      viteTsConfigPaths({
        projects: ['./tsconfig.json'],
      }),
      tanstackRouter({
        target: 'react',
        routeFileIgnorePrefix: '_*',
        autoCodeSplitting: true,
      }),
      react({
        jsxImportSource: 'theme-ui',
      }),
      svgr(),
      jsxLocPlugin(),
      nodePolyfills({
        globals: {
          Buffer: true,
        },
      }),
    ],
    build: {
      minify: true,
      target: 'es2022',
      sourcemap: 'hidden',
      commonjsOptions: {
        transformMixedEsModules: true,
      },
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
        '@modules': path.resolve(__dirname, './src/modules'),
      },
    },
    test: {},
    optimizeDeps: {
      esbuildOptions: {
        define: {
          global: 'globalThis',
        }
      }
    }
  };
});