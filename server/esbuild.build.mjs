import esbuild from "esbuild"
import options from "./esbuild.options.mjs"

export default await esbuild.build(options)