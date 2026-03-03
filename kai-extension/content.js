console.log("KAI content script loaded");

let popup = null;

document.addEventListener("mouseup", async (event) => {
    const word = getSelectedWord();

    if (!word) {
        removePopup();
        return;
    }

    removePopup();

    try {
        const data = await fetchWordData(word);
        createPopup(event.pageX, event.pageY, data);
    } catch (error) {
        console.error("Fetch failed:", error);
    }
});

function getSelectedWord() {
    const text = window.getSelection().toString().trim();

    if (!text || text.split(" ").length > 1) {
        return null;
    }

    return text;
}

async function fetchWordData(word) {
    const response = await fetch(
        `http://localhost:3001/api/word?text=${word}`
    );

    if (!response.ok) {
        throw new Error("Network response was not ok");
    }

    return response.json();
}

function createPopup(x, y, data) {
    popup = document.createElement("div");

    popup.innerHTML = `
        <strong>${data.word}</strong><br/>
        Meaning: ${data.meaning}<br/>
        Etymology: ${data.etymology}<br/>
        Analogy: ${data.analogy}<br/>
        Example: ${data.example}
    `;

    popup.style.position = "absolute";
    popup.style.top = y + 10 + "px";
    popup.style.left = x + 10 + "px";
    popup.style.background = "white";
    popup.style.border = "1px solid black";
    popup.style.padding = "10px";
    popup.style.borderRadius = "6px";
    popup.style.boxShadow = "0 2px 8px rgba(0,0,0,0.2)";
    popup.style.zIndex = "9999";
    popup.style.color = "black";
    popup.style.maxWidth = "250px";
    popup.style.fontSize = "13px";

    document.body.appendChild(popup);
}

function removePopup() {
    if (popup) {
        popup.remove();
        popup = null;
    }
}