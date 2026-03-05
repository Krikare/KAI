export function normalizeWord(word) {

    word = word.toLowerCase();

    if (word.endsWith("ies")) {
        return word.slice(0, -3) + "y";
    }

    if (word.endsWith("es")) {
        return word.slice(0, -2);
    }

    if (word.endsWith("s") && word.length > 3) {
        return word.slice(0, -1);
    }

    return word;

}