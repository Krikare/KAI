import fs from "fs";

const source = JSON.parse(
  fs.readFileSync("./data/dictionary-source.json", "utf8")
);

const dictionary = {};

for (const word in source) {

  const definition = source[word];

  dictionary[word.toLowerCase()] = {
    meaning: definition,
    example: `Example usage of "${word.toLowerCase()}" in a sentence.`
  };

}

fs.writeFileSync(
  "./data/dictionary-map.json",
  JSON.stringify(dictionary)
);

console.log("Dictionary built");
console.log("Words:", Object.keys(dictionary).length);