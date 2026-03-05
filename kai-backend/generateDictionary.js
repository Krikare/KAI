import fs from "fs";

/* =================================
   LOAD WORD LIST
================================= */

const words = fs.readFileSync("./data/word-list.txt", "utf-8")
  .split("\n")
  .map(w => w.trim())
  .filter(Boolean);

/* =================================
   BUILD DICTIONARY MAP
================================= */

const dictionary = {};

for (const word of words) {

  dictionary[word] = {
    meaning: `The word "${word}" is an English term whose meaning depends on context.`,
    example: `Example sentence using "${word}".`
  };

}

/* =================================
   SAVE DICTIONARY FILE
================================= */

fs.writeFileSync(
  "./data/dictionary-map.json",
  JSON.stringify(dictionary, null, 2)
);

console.log("Dictionary generated successfully.");