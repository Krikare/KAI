import express from "express";
import cors from "cors";
import fs from "fs";
import { normalizeWord } from "./lemmatizer.js";

const app = express();

app.use(cors());
app.use(express.json());

/* ===============================
   LOAD DICTIONARY
================================ */

const dictionary = JSON.parse(
  fs.readFileSync("./data/dictionary-map.json", "utf8")
);

/* ===============================
   STOP WORDS
================================ */

const stopWords = new Set([
  "the","a","an","is","are","was","were",
  "to","of","for","in","on","at","by",
  "this","that","your","their","its"
]);

/* ===============================
   FIND WORD IN DICTIONARY
================================ */

function findWord(word) {

  if (dictionary[word]) return dictionary[word];

  const normalized = normalizeWord(word);

  if (dictionary[normalized]) return dictionary[normalized];

  const base1 = word.replace(/ed$/, "");
  const base2 = word.replace(/ing$/, "");
  const base3 = word.replace(/s$/, "");

  if (dictionary[base1]) return dictionary[base1];
  if (dictionary[base2]) return dictionary[base2];
  if (dictionary[base3]) return dictionary[base3];

  return null;
}

/* ===============================
   WORD API
================================ */

app.post("/api/word", (req, res) => {

  let rawWord = req.body.word.toLowerCase();
  const sentence = req.body.sentence || "";

  if (stopWords.has(rawWord)) {

    return res.json({
      word: rawWord,
      meaning: "Common grammatical word",
      example: sentence,
      insight: "This word mainly serves a grammatical role."
    });

  }

  const entry = findWord(rawWord);

  let meaning = "";
  let example = "";
  let insight = "";

  if (entry) {

    meaning = entry.meaning;
    example = sentence || `Example usage of "${rawWord}".`;

    insight = `In this sentence "${rawWord}" refers to its contextual meaning within the text.`;

  } else {

    meaning = `${rawWord} refers to something whose meaning depends on context.`;
    example = sentence || `Example usage of "${rawWord}".`;

    insight = `This explanation was generated because the word was not found in the offline dictionary.`;

  }

  res.json({
    word: rawWord,
    meaning,
    example,
    insight
  });

});

/* ===============================
   START SERVER
================================ */

app.listen(3001, () => {
  console.log("KAI backend running on http://localhost:3001");
});