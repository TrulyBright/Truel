import esbuild from "esbuild"
import { spawn } from "child_process"
import options from "./esbuild.options.mjs"

const context = await esbuild.context({
    ...options,
    plugins: [{
        name: "restart-server",
        setup({onStart, onEnd}) {
            let t
            let serverProcess = undefined
            onStart(() => {
                console.log(`${serverProcess ? "Rebuilding" : "Building"} the server...`)
                t = Date.now()
                serverProcess?.kill()
            })
            onEnd(() => {
                console.log(`Server ${serverProcess ? "rebuilt" : "built"} in ${Date.now() - t} ms. ${serverProcess ? "Restarting" : "Starting"} the server...`)
                serverProcess = spawn("node", [options.outfile], {stdio: "inherit"})
            })
        }
    }]
})

export default await context.watch()