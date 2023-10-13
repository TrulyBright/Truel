import path from "path"
import esbuild from "esbuild"
import options from "./esbuild.options.mjs"

const context = await esbuild.context({
    ...options,
    footer: {
        js: "new EventSource('/esbuild').addEventListener('change', () => location.reload())"
    },
})
await context.watch()
await context.serve({
    servedir: options.outdir,
    port: 8000,
    fallback: path.join(options.outdir, "index.html")
})