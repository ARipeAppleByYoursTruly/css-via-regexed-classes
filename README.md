# CSS via Regex-ed Classes



## What is This?

This is a script that generates a CSS file with styles based on the class names used in your codebase.

Heavily inspired by UnoCSS, you can define your own rules, shortcuts, variants, and layers. But on top of that, you can modify many sections of the script to suit your needs, because it's a **script**, not a `npm` package.

By default, it uses the "vanilla CSS as class names" set of rules and variants, and a rule to use Iconify's pure CSS icons. You'll need to manually set up this script in order to use it properly.

But to be honest, I discourage you to use this, because it's not professionally made. Go and use Taillwind CSS, UnoCSS, or any other CSS frameworks and language supercedes instead.



## Why Does This Exist?

This whole thing started when I was finding a CSS framework to use in my projects, because I thought, if Astro is like a better HTML, and SolidJS is like a better Javascript, then I'm missing something that is like a better CSS.

First I tried Tailwind CSS due to its popularity, but I dropped it very quickly due to its naming convention. I felt like I'm trying to learn CSS all over again.

Then I tried UnoCSS, and I liked it very much because I can customize it to use vanilla CSS syntax as the class names. I customized it so much that I've reached a bottleneck of trying to customize something that UnoCSS doesn't provide a way for.

And that's when I've decided to make my own CSS "framework".



## How to Use This?

### Requirements

-   Node.js
-   `npm` packages: (`npm i -D ...`)
    -   `fast-glob`
    -   `cssesc`
    -   If you want to use Iconify icons:
        -   `@iconify/utils`
        -   `@iconify/json`



### Setup

1.  Download `css-via-regexed-classes.js` and place it somewhere in the project that won't get included when building your project
2.  In `package.json`, add a new key-value pair in `scripts`
    ```jsonc
    "scripts": {
      "<unique command name>": "node <path to the script>"
      // Example
      // "generate-css": "node generate-css/css-via-regexed-classes.js"
    }
    ```
3.  Add new `pre<command>` key-value pairs to `scripts` to commands that will build or run your project
    ```jsonc
    // Example: For Astro projects, add "predev" and "prebuild" key-value pairs
    "scripts": {
      // Replace generate-css with your <unique command name>
      "predev": "npm run generate-css",
      "dev": "astro dev",

      "prebuild": "npm run generate-css",
      "build": "astro build"
    }
    ```
4.  Modify the script to:
    -   Add glob patterns that specify the files to extract class names form
    -   Modify the default class name extraction logic `(advanced)`
    -   Add shortcuts
    -   Modify the default variant handling logic `(slightly advanced)`
    -   Add rules
    -   Add layers
    -   Add special sorting cases `(advanced)`
    -   Modify the filepath of the CSS file output
5.  Import the output CSS file to your webpages



### Astro Plugin Setup

This plugin enables the script to be run automatically whenever a detected file has been updated, but you'll have to wait a little longer for the output CSS file to update.

1.  Download `astro-plugin.ts` and place it preferably in the same folder as the script
2.  Modify your `astro.config.mjs` like so:
    ```js
    import generateCSS from "file to the plugin"
    // ...
    export default defineConfig({
      integrations: [
        generateCSS()
      ]
    })
    ```
3.  Modify the plugin to:
    -   Change the file name that refer to the script
    -   Specify the file extensions of the fil changed to trigger the script



## Default Behavior Out of the Box

### Class Name Extraction Logic

The default logic is to match `class=...` in every starting HTML tags and extract the values of the `class` attribute.

The way to extract class names depends on the characters used to wrap the value:
-   `'...'` and `"..."` - Split the value by "` `" and extract each token
-   `` `...` `` - Similar to the case above, but also need to check the values of any `${}` within
-   `{...}` (and `${...}` from `` `...` ``) - Match any `'...'` and `"..."` but ignore the ones used in comparisons (of ternary operators), also need to check the values of any `` `...` `` within



### Shortcuts

All shortcuts will be converted to their rules before going to the next step. This also applies to shortcuts in shortcuts.



### Variants

Variants serve as ways to handle CSS' combinators and pseudo selectors, in both rules and shortcuts.

Syntax: `<variant(s)>?<rule>`

Example usage: `>div:hover?color:red` - There are 2 variants here, `><target>` and `:<target>`

Current variants:
-   `_<target>` - Descendent combinator, from `button div`
-   `><target>` - Child combinator, from `button > div`
-   `~<target>` - General sibling combinator, from `button ~ div`
-   `+<target>` - Adjacent sibling combinator, from `button + div`
-   `:<target>` - Pseudo-class selector, from `button:hover`
-   `::<target>` - Pseudo-element selector, from `button::before`



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

Then, in every layer, each generated style will be sorted by their selector via JavaScript's `localeCompare()`.

The logic will check the sorted styles again, to handle special cases. I've only implemented one special case of sorting `:hover` before `:active`.



## Final Words

I wanna pass you the Olympian torch to continue the chain of innovation.

This script is definitely flawed in many ways, but I do hope that it's easier to understand than UnoCSS' customization, at least for beginners in the web development landscape. I say that because currently, UnoCSS' documentation lacks many details, which require users to dive deep into the repo. And that repo contains such advanced logic and split it into so many files that it'll make beginners' head spin.

This script also kinda maybe helps beginners bridge the gap from vanilla CSS to atomic CSS, I think. Since the syntax used is mostly from CSS itself, and not framework-specific, like Tailwind CSS.

As for professionals that stumble upon this insignificant repo, I'm still gonna direct you UnoCSS instead. And if possible, contribute to UnoCSS. I think UnoCSS has a lot of potential, but it do seem to target a niche audience. As I said before, UnoCSS is like the Vim of CSS... frameworks? Engines? Libraries? What's the umbrella term for frameworks, engines, libraries, etc?

If you somehow want to improve this little thing I made instead of UnoCSS, MIT license, make another framework. The world has enough JS frameworks, but not enough CSS frameworks. This script lacks so many stuff compared to UnoCSS, a proper CSS ~~framework~~ engine, it feels nonsensical to make improvements for this script.

I thought I'm niche enough already, but apparently, I can be even more niche, using my own way to generate CSS styles instead of UnoCSS, Tailwind CSS, or even vanilla CSS.

Also, I owe Anthony Fu and the UnoCSS team a big thank you for doing many parts of the brainstorming process. I wouldn't even have the idea of making this script if it weren't for UnoCSS' existence. I borrowed a lot of ideas from it.

Thank you for checking out CSS via Regexed Classes.
