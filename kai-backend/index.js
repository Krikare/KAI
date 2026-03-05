import express from "express";
import cors from "cors";
import fs from "fs";
import { normalizeWord } from "./lemmatizer.js";

const app = express();
const PORT = 3001;

app.use(cors());

/* ===============================
   LOAD DICTIONARY
================================ */

const dictionaryData = JSON.parse(
  fs.readFileSync("./data/dictionary.json", "utf-8")
);

/* ===============================
   CACHE
================================ */

const cache = {};
const CACHE_TTL = 30000;

/* ===============================
   FIND WORD
================================ */

function findWord(word) {
  return dictionaryData.find(
    entry => entry.word === word
  );
}

/* ===============================
   AI FALLBACK
================================ */

function generateFallbackMeaning(word) {

  return {
    word,
    meaning: `The term "${word}" appears to be a technical or descriptive word. Its meaning depends on the context in which it is used.`,
    example: `Example sentence using "${word}" may vary depending on context.`,
    etymology: "Generated explanation (AI fallback)"
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

  let result = findWord(word);

  if (!result) {

    result = generateFallbackMeaning(word);

  }

  const response = {
    word: result.word,
    meaning: result.meaning,
    example: result.example,
    etymology: result.etymology
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