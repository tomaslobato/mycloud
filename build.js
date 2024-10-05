const esbuild = require("esbuild");

async function build() {
  const ctx = await esbuild.context({
    entryPoints: ["client/index.tsx", "client/styles.css"],
    bundle: true,
    outdir: "./dist",
    minify: true,
    plugins: [],
  });

  await ctx.watch();
  console.log("⚡ Build complete!");
}

build().catch((error) => {
  console.error("Build failed:", error);
  process.exit(1);
});
