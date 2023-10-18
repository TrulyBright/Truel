import path from "path"
import { fileURLToPath } from "url"

const filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(filename)

export default {
    entryPoints: [path.join(__dirname, "src", "main.ts")],
    bundle: true,
    platform: "node",
    outfile: path.join(__dirname, "dist", "main.js"),
    packages: "external",
}