import express from "express";
import cors from "cors";
import fs from "fs";

const app = express();

app.use(cors());
app.use(express.json());

const dictionary = JSON.parse(
    fs.readFileSync("./data/dictionary-map.json", "utf8")
);

app.post("/api/word", (req, res) => {

    const rawWord = req.body.word.toLowerCase();
    const sentence = req.body.sentence || "";

    const entry = dictionary[rawWord];

    let meaning = "";
    let example = "";
    let insight = "";

    if (entry) {

        meaning = entry.meaning;
        example = sentence || `Example usage of "${rawWord}".`;

        insight = `In this sentence "${rawWord}" refers to its contextual meaning within the text.`;

    } else {

        meaning = `The term "${rawWord}" appears to be a descriptive word whose meaning depends on context.`;
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

app.listen(3001, () => {
    console.log("KAI backend running on http://localhost:3001");
});