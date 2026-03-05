import express from "express";
import cors from "cors";
import fs from "fs";
import { normalizeWord } from "./lemmatizer.js";

const app = express();
const PORT = 3001;

app.use(cors());

/* ===============================
   LOAD DICTIONARY MAP
================================ */

const dictionary = JSON.parse(
  fs.readFileSync("./data/dictionary-map.json", "utf-8")
);

/* ===============================
   CACHE
================================ */

const cache = {};
const CACHE_TTL = 30000;

/* ===============================
   AI FALLBACK
================================ */

function generateFallbackMeaning(word) {

  return {
    word,
    meaning: `The term "${word}" appears to be a descriptive or technical word whose meaning depends on context.`,
    example: `Example usage of "${word}" may vary depending on the sentence.`
  };

}

/* ===============================
   API
================================ */

app.get("/api/word", (req, res) => {

  let word = req.query.text?.toLowerCase();

  if (!word) {
    return res.status(400).json({ error: "No word provided" });
  }

  word = normalizeWord(word);

  /* CACHE CHECK */

  if (cache[word] && Date.now() - cache[word].time < CACHE_TTL) {
    return res.json(cache[word].data);
  }

  /* DICTIONARY LOOKUP */

  let result = dictionary[word];

  if (!result) {

    console.log("Dictionary miss → AI fallback");

    result = generateFallbackMeaning(word);

  }

  const response = {
    word,
    meaning: result.meaning,
    example: result.example
  };

  cache[word] = {
    data: response,
    time: Date.now()
  };

  res.json(response);

});

/* ===============================
   START SERVER
================================ */

app.listen(PORT, () => {

  console.log(`KAI backend running on http://localhost:${PORT}`);

});