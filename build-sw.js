const esbuild = require('esbuild')

esbuild.build({
  entryPoints: ['src/service-worker/sw.ts'],
  bundle: true,
  minify: true,
  outfile: 'public/sw.js',
  platform: 'browser',
  target: ['chrome58', 'firefox57', 'safari11'], // Browser-Kompatibilität minimal
  sourcemap: false,
  define: { 'process.env.NODE_ENV': '"production"' },
}).catch(() => process.exit(1))
