const esbuild = require("esbuild");

esbuild
  .build({
    entryPoints: ["src/index.tsx", "src/index.css"],
    bundle: true,
    outdir: "./dist",
    minify: true,
    plugins: [],
  })
  .catch((error) => {
    console.error("Build failed:", error);
    process.exit(1);
  });
