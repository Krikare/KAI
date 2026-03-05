import express from "express";
import cors from "cors";
import axios from "axios";

const app = express();

app.use(cors());

const cache = new Map();
const TTL = 30 * 1000;

app.get("/api/word", async (req, res) => {

    const word = req.query.text;

    if (!word) {
        return res.status(400).json({ error: "Word missing" });
    }

    const cached = cache.get(word);

    if (cached && Date.now() - cached.time < TTL) {
        console.log("Cache hit:", word);
        return res.json(cached.data);
    }

    console.log("Cache miss:", word);

    try {

        const response = await axios.get(
            `https://api.dictionaryapi.dev/api/v2/entries/en/${word}`
        );

        const entry = response.data[0];

        const result = {
            word: entry.word,
            meaning: entry.meanings?.[0]?.definitions?.[0]?.definition || "Meaning unavailable",
            example: entry.meanings?.[0]?.definitions?.[0]?.example || "No example available",
            etymology: entry.origin || "Origin unknown"
        };

        cache.set(word, {
            data: result,
            time: Date.now()
        });

        res.json(result);

    } catch (error) {

        res.status(404).json({
            error: "Word not found"
        });

    }

});

app.listen(3001, () => {
    console.log("KAI backend running on http://localhost:3001");
});