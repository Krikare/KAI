import express from "express";
import cors from "cors";
import fs from "fs";
import axios from "axios";
import { normalizeWord } from "./lemmatizer.js";

const app = express();

app.use(cors());
app.use(express.json());

/* LOAD DICTIONARY */

const dictionary = JSON.parse(
  fs.readFileSync("./data/dictionary-map.json", "utf8")
);

/* STOP WORDS */

const stopWords = new Set([
  "the","a","an","is","are","was","were",
  "to","of","for","in","on","at","by",
  "this","that","your","their","its"
]);

/* FIND WORD */

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

/* AI EXPLANATION */

async function generateAIInsight(word, sentence) {

  try {

    const prompt =
      `Explain the meaning of the word "${word}" in this sentence:\n"${sentence}"`;

    const response = await axios.post(
      "https://api-inference.huggingface.co/models/google/flan-t5-small",
      { inputs: prompt }
    );

    return response.data[0]?.generated_text || "";

  } catch (err) {

    return `In this sentence "${word}" refers to its contextual meaning.`;

  }

}

/* WORD API */

app.post("/api/word", async (req, res) => {

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
    example = sentence;

  } else {

    meaning = `${rawWord} refers to something whose meaning depends on context.`;
    example = sentence;

  }

  insight = await generateAIInsight(rawWord, sentence);

  res.json({
    word: rawWord,
    meaning,
    example,
    insight
  });

});

/* START SERVER */

app.listen(3001, () => {
  console.log("KAI backend running on http://localhost:3001");
});