import type { AstroIntegration } from "astro"
import child_process from "node:child_process"



// To use this plugin, modify your astro.config.mjs like so:
/*
// ...
import generateCSS from "filepath to astro-plugin.ts"
// ...
export default defineConfig({
  integrations: [
    // ...
    generateCSS()
    // ...
  ]
})
*/

export default function generateCSS(): AstroIntegration {
  return {
    name: "generate-css-via-regexed-classes",
    hooks: {
      "astro:server:setup": ({ server }) => {
        server.watcher.on("change", (path) => {
          // The generated CSS file by css-via-regexed-classes.js
          // To prevent infinite loop
          if (path.endsWith("generated-via-regexed-classes.css")){
            return
          }

          // Only generate CSS if specific files are changed
          if (path.endsWith(".astro") || path.endsWith(".tsx")) {
            // Replace "generate-css" with your command defined in package.json
            child_process.exec("npm run generate-css")
          }
        })
      }
    }
  }
}
