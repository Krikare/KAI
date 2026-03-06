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
   WORD API
================================ */

app.post("/api/word", (req, res) => {

    let rawWord = req.body.word.toLowerCase();
    const sentence = req.body.sentence || "";

    /* Ignore useless words */

    if (stopWords.has(rawWord)) {

        return res.json({
            word: rawWord,
            meaning: "Common word",
            example: sentence,
            insight: "This word is a grammatical helper and usually does not carry standalone meaning."
        });

    }

    /* Lemmatizer */

    const word = normalizeWord(rawWord);

    /* Dictionary lookup */

    const entry = dictionary[word];

    let meaning = "";
    let example = "";
    let insight = "";

    if (entry) {

        meaning = entry.meaning;

        example = sentence || `Example usage of "${word}".`;

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