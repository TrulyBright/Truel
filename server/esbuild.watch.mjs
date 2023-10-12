import esbuild from "esbuild"
import options from "./esbuild.options.mjs"

const context = await esbuild.context({
    ...options,
    plugins: [{
        name: "restart-server",
        setup({onStart, onEnd}) {
            let t
            onStart(() => {
                console.log("Rebuilding the server...")
                t = Date.now()
            })
            onEnd(() => {
                console.log(`Server rebuilt in ${Date.now() - t} ms. Restarting the server...`)
            })
        }
    }]
})

export default await context.watch()