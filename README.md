# CSS via Regex-ed Classes

## What is this?

Heavily inspired by UnoCSS, this is a script that extract class names from a project and generates a CSS file with styles as specified by rules, variants, shortcuts, and layers defined by the developer.

In actuality, this is a less advanced and less flexible version of UnoCSS. Like, it's not even a `npm` package, it's just one script, and you need to manually set it up. If you're satisfied in using Tailwind CSS, UnoCSS, or any other CSS frameworks and language supercedes, then don't use this.

To deter you even further from using this script, you have to modify the script itself if you want to change its behaviour, though I did try so make some stuff "configurable". A considerable amount of technical prowess is required, but at least it doesn't involve having 10 years experience in Vite plugin and `npm` package development. What an agonizing experience that was.



## Then why does this exists?

Because UnoCSS didn't provide a way to alter the order of generated styles.

Imagine you have a button with the classes `:hover?color:red` and `:active?color:green` (I believe it's obvious what styles they apply). Logically, `:hover?color:red` should be placed before `:active?color:green` in the CSS file, but `a` comes before `h`, so UnoCSS places `:active?color:green` before `:hover?color:red`, and now you got a visual bug of the button having no onClicked state even though it functions correctly.

>   Note: I've only realized after writing that `:hover` itself is problematic on touchscreen devices



## How to use this?

### Requirements

-   Node.js
-   `npm` packages: (`npm i -D <package>`)
    -   fast-glob
    -   cssesc
    -   @iconify/utils (optional)
    -   @iconify/json (optional)



### Setup

1.  Place the script somewhere in the project that won't get included in production
2.  In `packge.json`, add a new key-value pair in `scripts`
    ```json
    // ...
    "scripts": {
      // ...
      "<unique command name>": "node ./<path to the script from project root>"
      // Example: "generateCSS": "node ./tools/css-via-regexed-classes.js"

      // ...
    }
    ```

3.  Add new "pre-" command key-value pairs to `scripts` to commands that will build or run your project
    ```json
    // Example: For Astro projects, add "predev" and "prebuild" key-value pairs to "scripts"

    // ...
    "scripts": {
      // ...
      "predev": "npm run <unique command name>",
      "dev": "astro dev",
      // ...
      "prebuild": "npm run <unique command name>",
      "build": "astro build",
      // ...
    }
    ```

4.  Since this is just a script, you can modify the code directly to:
    -   Add glob patterns to specify the files to perform class name extraction on
    -   Modify the default class name extraction logic `(advanced)`
    -   Add shortcuts
    -   Modify the default variant handling logic `(advanced)`
    -   Add rules (and/or not use Iconify icons)
    -   Add layers
    -   Alter the final order of the generated styles to handle special cases `(slightly advanced)`
    -   Enable or disable style merging for shortcuts
    -   Specify the filepath of the output CSS file

5.  Finally, to use the generated styles, import the CSS file to your webpages



### Astro Plugin Setup

This Astro plugin enables the CSS file to be auto-regenerated whenever a file has changed when running in dev server, so you don't have to manually restart the dev server. But the reload time will be increased because Astro has to reload a second time to update the generated CSS file.

1.  Download `astro-plugin.ts` and place it preferably in the same folder as the script
2.  You can directly modify the file to:
    -   Change the filename that refer to the script
    -   Specify the file extensions of the file changed to trigger the script
3.  Modify your `astro.config.mjs` like so:
    ```js
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
    ```



## Default Behavior out of the Box

### Class Name Extraction Logic

The default logic is to match `class=...` in every starting HTML tags and extract the values of the `class` attribute.

The way to extract class names depends on the characters used to wrap the value:
-   `'...'` and `"..."` - Split the value by "` `" and extract each token
-   `` `...` `` - Similar to the case above, but also need to check the values of any `${}` within
-   `{...}` (and `${...}` from `` `...` ``) - Match any `'...'` and `"..."` but ignore the ones used in comparisons (of ternary operators), also need to check the values of any `` `...` `` within



### Variants

Variants serve as ways to handle CSS' combinators and pseudo selectors, other stuff like at-rules aren't implemented as of now.

Syntax: `<variant(s)>?<rule>`

Example usage: `>div:hover?color:red` - There are 2 variants here, `><target>` and `:<target>`

Current variants:
-   `_<target>` - Descendent combinator, from `button div`
-   `><target>` - Child combinator, from `button > div`
-   `~<target>` - General sibling combinator, from `button ~ div`
-   `+<target>` - Adjacent sibling combinator, from `button + div`
-   `:<target>` - Pseudo-class selector, from `button:hover`
-   `::<target>` - Pseudo-element selector, from `button::before`

>   v2.0.0 - Variants can also be handled in shortcuts

>   Note: At-rules can be done by adding a new layer and the write to file logic



### Rules

-   `icon_<collection-name>_<icon-name>` - To use pure CSS icons from Iconify, example: `icon_material-symbols_light-mode`
-   `<css-property>:<value_with_or_without_spaces>` - The rule that basically enables writing CSS in the `class` attribute, example: `margin:10px_10px_0`, `background-color:var(--background)`

    Please remember that "` `" seperates classes, so values that requires "` `" to work need to use "`_`" instead


### Generated Styles Sorting Logic

The default logic will first categorize the generated styles into their respective layers.

Layers, in order from lowest priority to highest:
-   `icons`
-   `shortcuts`
-   `atomics`

Then, in every layer, each generated style will be sorted via JavaScript's `localeCompare()`.

The logic will check the sorted styles again, to handle special cases. I've only implemented one special case of sorting `:hover` before `:active`.



### Style Merging Logic

Enabled by default, the logic will first check if it's currently writing styles in the `shortcuts` layer.

Then it will check the style's selector of current index and next index. If both selectors are identical, add the latter's body to the current's body. Otherwise, write the style with the now merged body into the file.



## Final Words

I wanna pass you the Olympian torch to continue the chain of innovation.

This script is definitely flawed in many ways, but I do hope that it's easier to understand than UnoCSS' customization, at least for beginners in the web development landscape. I say that because currently, UnoCSS' documentation lacks many details, which require users to dive deep into the repo. And that repo contains such advanced logic and split it into so many files that it'll make beginners' head spin.

This script also kinda maybe helps beginners bridge the gap from vanilla CSS to atomic CSS, I think. Since the syntax used is mostly from CSS itself, and not framework-specific, like Tailwind CSS.

As for professionals that stumble upon this insignificant repo, I'm still gonna direct you UnoCSS instead. And if possible, contribute to UnoCSS. I think UnoCSS has a lot of potential, but it do seem to target a niche audience. As I said before, UnoCSS is like the Vim of CSS... frameworks? Engines? Libraries? What's the umbrella term for frameworks, engines, libraries, etc?

If you somehow want to improve this little thing I made instead of UnoCSS, MIT license, make another framework. The world has enough JS frameworks, but not enough CSS frameworks. This script lacks so many stuff compared to UnoCSS, a proper CSS ~~framework~~ engine, it feels nonsensical to make improvements for this script.

I thought I'm niche enough already, but apparently, I can be even more niche, using my own way to generate CSS styles instead of UnoCSS, Tailwind CSS, or even vanilla CSS.

Also, I owe Anthony Fu and the UnoCSS team a big thank you for doing many parts of the brainstorming process. I wouldn't even have the idea of making this script if it weren't for UnoCSS' existence. I borrowed a lot of ideas from it.

Thank you for your time in reading this README.
