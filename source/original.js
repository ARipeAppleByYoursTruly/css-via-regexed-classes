import fg from "fast-glob"
import fs from "node:fs"
import cssesc from "cssesc"
import { getIconData, getIconCSS } from "@iconify/utils"



// Extract class names from codebase
// ===
console.log("Extracting class names ...")

let extractedClassNames = []



// These glob patterns are assuming you are executing this file from project root
// eg. C:project root> node generate-css-test/generate-css-test.js
const files = fg.sync([
  "./src/**/*.astro",
  "./src/**/*.tsx"
])

files.forEach(file => {
  const fileContent = fs.readFileSync(file, "utf-8")

  const htmlTags = fileContent.match(/<[^</>]+>/g)

  if (htmlTags === null) {
    return
  }

  htmlTags.forEach(htmlTag => {
    const singleLineHtmlTag = htmlTag.replaceAll(/\s+/g, " ")

    // You can modify the rest of this code block to better suit your use case

    // Note: Solid also has the classList attribute, so need to deal with that eventually
    const classAttribute = singleLineHtmlTag.match(/class=('.+'|".+"|{.+})/)

    if (classAttribute === null) {
      return
    }

    // {} can contain ``, '' or ""
    // `` can contain ${}

    // Potential recursion from {} and `` containing each other, but unrealistic

    // Having multiple ${} in `` will add a layer of complexity
    // But I've decided to concatenate them to one ${}, not sure if this is a good solution
    let classValue = classAttribute[1]

    while (true) {
      if (classValue.startsWith("{")) {
        classValue = classValue.substring(1, classValue.length - 1).trim()



        let toBeCheckedAgain = classValue.match(/`[^`]+`/g)

        if (toBeCheckedAgain !== null) {
          toBeCheckedAgain.forEach((result, i) => {
            classValue = classValue.replace(result, "")

            toBeCheckedAgain[i] = result.substring(1, result.length - 1).trim()
          })
        }



        // This regex is made assuming that every whitespace has been reduced to a single space
        // in singleLineHtmlTag

        // To avoid matching strings that are used for comparison
        // eg. var === "won't be matched" ? "class1" : "class2"
        let toBeAdded = classValue.match(/'(?!\s\?\s)[^']+'(?!\s\?)|"(?!\s\?\s)[^"]+"(?!\s\?)/g)

        if (toBeAdded !== null) {
          toBeAdded.forEach(result => {
            extractedClassNames.push(...result.substring(1, result.length - 1).trim().split(" "))
          })
        }



        if (toBeCheckedAgain !== null) {
          classValue = "`"

          toBeCheckedAgain.forEach(result => {
            classValue += `${result} `
          })

          classValue = `${classValue.trim()}\``
        }
      }



      else if (classValue.startsWith("`")) {
        classValue = classValue.substring(1, classValue.length - 1).trim()



        let toBeCheckedAgain = classValue.match(/\${[^$]+}/g)

        if (toBeCheckedAgain !== null) {
          toBeCheckedAgain.forEach((result, i) => {
            classValue = classValue.replace(result, "")

            toBeCheckedAgain[i] = result.substring(2, result.length - 1).trim()
          })
        }



        let toBeAdded = classValue.trim().split(" ")

        if (toBeAdded !== null) {
          extractedClassNames.push(...toBeAdded)
        }



        if (toBeCheckedAgain !== null) {
          classValue = "{"

          toBeCheckedAgain.forEach(result => {
            classValue += `${result} `
          })

          classValue = `${classValue.trim()}}`
        }
      }



      else if (classValue.startsWith("'") || classValue.startsWith("\"")) {
        classValue = classValue.substring(1, classValue.length - 1).trim()

        let toBeAdded = classValue.trim().split(" ")

        if (toBeAdded !== null) {
          extractedClassNames.push(...toBeAdded)
        }
      }



      else {
        // console.log("=============================")
        // console.log("Infinite Loop Exit Checkpoint")
        // console.log("=============================")
        // console.log("htmlTag")
        // console.log(htmlTag)
        // console.log()
        // console.log("extractedClassNames")
        // console.log(extractedClassNames)
        // console.log("=============================\n")

        break
      }
    }
  })
})

console.log("Done")



// Generate styles based on the extracted class names
// ===
console.log("Generating styles ...")

function createStylingObject() {
  return {
    className: "",
    isShortcut: false,
    layer: "",
    rules: [],
    generatedStyles: []
  }
}

let stylingObjects = []



// Check if the class name matches a shortcut
// ---
stylingObjects = extractedClassNames.map(extractedClassName => {
  let obj = createStylingObject()
  obj.className = extractedClassName

  let shortcutMatch = ""



  shortcutMatch = extractedClassName.match(/^Aa-button-icon$/)

  if (shortcutMatch !== null) {
    obj.isShortcut = true
    obj.layer = "shortcuts"
    obj.rules = [
      "width:50px",
      "height:50px",
      ">div:hover?color:red",
      ">div:active?color:purple"
    ]

    return obj
  }



  shortcutMatch = extractedClassName.match(/^devonly-bg-on-all:(.+)$/)

  if (shortcutMatch !== null) {
    obj.isShortcut = true
    obj.layer = "shortcuts"
    obj.rules = [
      `background-color:${shortcutMatch[1]}`,
      `_*?background-color:${shortcutMatch[1]}`
    ]

    return obj
  }



  // Not a shortcut
  obj.rules.push(extractedClassName)

  return obj
})



// Build the selector for each rule (handling variants)
// ---
function createStyle() {
  return {
    selector: "",
    body: ""
  }
}



stylingObjects.forEach(stylingObject => {
  stylingObject.generatedStyles = stylingObject.rules.map(rule => {
    let style = createStyle()
    style.selector = `.${cssesc(stylingObject.className, { isIdentifier: true })}`

    let variants = rule.match(/^(.+)\?/)

    if (variants === null) {
      return style
    }

    variants = variants[1]

    let variantRegex = /^$/
    let variantTransformation = ""

    while (true) {
      if (variants.startsWith("_")) {
        variantRegex = /^_([^_~>+|:]+)/
        variantTransformation = " "
      }
      else if (variants.startsWith("~")) {
        variantRegex = /^~([^_~>+|:]+)/
        variantTransformation = " ~ "
      }
      else if (variants.startsWith(">")) {
        variantRegex = /^>([^_~>+|:]+)/
        variantTransformation = " > "
      }
      else if (variants.startsWith("+")) {
        variantRegex = /^\+([^_~>+|:]+)/
        variantTransformation = " + "
      }
      else if (variants.startsWith("|")) {
        variantRegex = /^\|([^_~>+|:]+)/
        variantTransformation = " | "
      }
      else if (variants.startsWith("::")) {
        variantRegex = /^::([^_~>+|:]+)/
        variantTransformation = "::"
      }
      else if (variants.startsWith(":")) {
        variantRegex = /^:([^_~>+|:]+)/
        variantTransformation = ":"
      }
      else {
        // console.log("=============================")
        // console.log("Infinite Loop Exit Checkpoint")
        // console.log("=============================")
        // console.log("rule")
        // console.log(rule)
        // console.log()
        // console.log("style.selector")
        // console.log(style.selector)
        // console.log("=============================\n")

        break
      }

      const variantMatch = variants.match(variantRegex)

      if (variantMatch !== null) {
        style.selector += `${variantTransformation}${variantMatch[1]}`

        variants = variants.replace(variantMatch[0], "")
      }
    }

    return style
  })
})



// Build the body of each rule
stylingObjects.forEach(stylingObject => {
  stylingObject.rules.forEach((rule, index) => {
    // Remove variants as they have been handled already
    if (rule.indexOf("?") > 0) {
      rule = rule.substring(rule.indexOf("?") + 1)
    }



    // Each rule syntax has priority ranking, from highest to lowest
    let ruleMatch = []



    ruleMatch = rule.match(/^icon_(.+)_(.+)$/)

    if (ruleMatch !== null) {
      const iconifyData = getIconData(
        JSON.parse(fs.readFileSync(`./node_modules/@iconify/json/json/${ruleMatch[1]}.json`)),
        ruleMatch[2]
      )

      const iconifyCSS = getIconCSS(iconifyData)

      const iconifyCSSBody = iconifyCSS.substring(
        iconifyCSS.indexOf("{") + 1,
        iconifyCSS.indexOf("}")
      )

      stylingObject.generatedStyles[index].body = `  ${iconifyCSSBody.trim()}`

      if (stylingObject.layer === "") {
        stylingObject.layer = "icons"
      }

      return
    }



    ruleMatch = rule.match(/^(.+):(.+)$/)

    if (ruleMatch !== null) {
      const CSSValue = ruleMatch[2].replaceAll("_", " ")

      stylingObject.generatedStyles[index].body = `  ${ruleMatch[1]}: ${CSSValue};`

      if (stylingObject.layer === "") {
        stylingObject.layer = "atomics"
      }

      return
    }
  })
})

console.log("Done")



// Sort the generated styles
// ===
console.log("Sorting styles ...")

// Create an empty array for each layer

// Configurable
const layers = [
  "icons",
  "shortcuts",
  "atomics"
]



let styleSheetObject = {}

layers.forEach(layer => {
  styleSheetObject[layer] = []
})



// Sort by layers
stylingObjects.forEach(stylingObject => {
  if (Object.hasOwn(styleSheetObject, stylingObject.layer)) {
    styleSheetObject[stylingObject.layer].push(...stylingObject.generatedStyles)
  }
})



// Sort by selectors
for (const layer in styleSheetObject) {
  styleSheetObject[layer].sort((a, b) => {
    return a.selector.localeCompare(b.selector)
  })
}



// Handle special cases
for (const layer in styleSheetObject) {
  styleSheetObject[layer].forEach((style, index) => {
    // Place :hover before :active
    if (
      style.selector.endsWith(":active") &&
      style.selector[-8] !== "\\" &&
      styleSheetObject[layer].length > index + 1 &&
      styleSheetObject[layer][index + 1].selector.endsWith(":hover") &&
      styleSheetObject[layer][index + 1].selector[-7] !== "\\"
    ) {
      let temp = styleSheetObject[layer][index]

      styleSheetObject[layer][index] = styleSheetObject[layer][index + 1]
      styleSheetObject[layer][index + 1] = temp
    }
  })
}

console.log("Done")



// Write sorted styles to a file
// ===

// Configurable
const outputFilePath = "./src/styles/generated-css-test.css"
const outputFileStream = fs.createWriteStream(outputFilePath)

console.log(`Writing styles to ${outputFilePath} ...`)



outputFileStream.write("/* Generated by generate-css-test.js */\n")

for (const layer in styleSheetObject) {
  if (styleSheetObject[layer].length <= 0) {
    continue
  }

  outputFileStream.write(`\n\n\n/* Layer: ${layer} */`)
  outputFileStream.write("\n/* === */")



  if (layer !== "shortcuts") {
    styleSheetObject[layer].forEach((style) => {
      outputFileStream.write(`\n${style.selector} {\n${style.body}\n}\n`)
    })

    continue
  }

  // Merge shortcut rules
  let i = 0
  let selector = styleSheetObject[layer][0].selector
  let body = styleSheetObject[layer][0].body

  while (true) {
    if (i >= styleSheetObject[layer].length - 1) {
      outputFileStream.write(`\n${selector} {\n${body}\n}\n`)

      break
    }

    if (selector === styleSheetObject[layer][i + 1].selector) {
      body += `\n${styleSheetObject[layer][i + 1].body}`
    }
    else {
      outputFileStream.write(`\n${selector} {\n${body}\n}\n`)

      selector = styleSheetObject[layer][i + 1].selector
      body = styleSheetObject[layer][i + 1].body
    }

    i++
  }
}

console.log("Done")



console.log("\nPlease double-check the generated .css file, thank you\n")
