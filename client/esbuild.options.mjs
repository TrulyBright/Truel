import path from "path"
import { htmlPlugin } from "@craftamap/esbuild-plugin-html"

export default {
    entryPoints: [
        path.join("src", "main.tsx"),
    ],
    outdir: "dist",
    bundle: true,
    minify: true,
    treeShaking: true,
    metafile: true,
    logLevel: "info",
    plugins: [
        htmlPlugin({
            files: [
                {
                    entryPoints: [
                        path.join("src", "main.tsx")
                    ],
                    filename: "index.html",
                    htmlTemplate: path.join("src", "index.html"),
                    hash: true
                }
            ]
        })
    ]
}