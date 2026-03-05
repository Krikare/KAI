console.log("KAI content script loaded");

let popup = null;
let currentWord = null;

/* ===============================
   WORD SELECTION LISTENER
================================ */

document.addEventListener("mouseup", async () => {

    const word = getSelectedWord();

    if (!word) {
        removePopup();
        return;
    }

    currentWord = word;

    const rect = getSelectionPosition();
    const sentence = getContextSentence();

    createPopupContainer(rect.left, rect.bottom);

    setLoadingState();

    try {

        const data = await fetchWordData(word, sentence);

        if (!popup) return;
        if (word !== currentWord) return;

        setSuccessState(data);

    } catch (err) {

        if (!popup) return;
        setErrorState("Word not found");

    }

});


/* ===============================
   CLICK OUTSIDE CLOSE
================================ */

document.addEventListener("mousedown", (event) => {

    if (!popup) return;

    if (!popup.contains(event.target)) {
        removePopup();
    }

});


/* ===============================
   ESCAPE CLOSE
================================ */

document.addEventListener("keydown", (event) => {

    if (event.key === "Escape") {
        removePopup();
    }

});


/* ===============================
   GET SELECTED WORD
================================ */

function getSelectedWord() {

    let text = window.getSelection().toString().trim();

    if (!text) return null;

    text = text.replace(/^[^a-zA-Z]+|[^a-zA-Z]+$/g, "");

    if (!text) return null;

    if (text.split(" ").length > 1) return null;

    return text.toLowerCase();

}


/* ===============================
   GET CONTEXT SENTENCE
================================ */

function getContextSentence() {

    const selection = window.getSelection();

    if (!selection.rangeCount) return "";

    const node = selection.anchorNode;

    if (!node || !node.textContent) return "";

    const text = node.textContent;

    const sentences = text.split(/[.!?]/);

    const selected = selection.toString().trim();

    for (const s of sentences) {

        if (s.toLowerCase().includes(selected.toLowerCase())) {
            return s.trim();
        }

    }

    return "";

}


/* ===============================
   GET SELECTION POSITION
================================ */

function getSelectionPosition() {

    const selection = window.getSelection();

    if (!selection.rangeCount) {
        return { left: 0, bottom: 0 };
    }

    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();

    return {
        left: rect.left + window.scrollX,
        bottom: rect.bottom + window.scrollY
    };

}


/* ===============================
   FETCH WORD DATA
================================ */

async function fetchWordData(word, sentence) {

    return new Promise((resolve, reject) => {

        chrome.runtime.sendMessage(
            {
                type: "FETCH_WORD",
                word: word,
                sentence: sentence
            },
            (response) => {

                if (!response || !response.success) {
                    reject("Word not found");
                } else {
                    resolve(response.data);
                }

            }
        );

    });

}


/* ===============================
   CREATE POPUP CONTAINER
================================ */

function createPopupContainer(x, y) {

    removePopup();

    popup = document.createElement("div");

    popup.className = "kai-popup";

    popup.style.position = "absolute";
    popup.style.zIndex = "9999";
    popup.style.background = "#F5F0DC";
    popup.style.border = "1px solid #7BAF8F";
    popup.style.padding = "14px";
    popup.style.borderRadius = "10px";
    popup.style.boxShadow = "0 10px 25px rgba(0,0,0,0.15)";
    popup.style.color = "#1F4D3A";
    popup.style.maxWidth = "320px";
    popup.style.fontSize = "14px";
    popup.style.lineHeight = "1.5";

    popup.style.opacity = "0";
    popup.style.transform = "translateY(5px)";
    popup.style.transition = "opacity 0.2s ease, transform 0.2s ease";

    document.body.appendChild(popup);

    popup.style.left = `${x}px`;
    popup.style.top = `${y + 10}px`;

    const popupRef = popup;

    requestAnimationFrame(() => {

        if (!popupRef || !popupRef.isConnected) return;

        popupRef.style.opacity = "1";
        popupRef.style.transform = "translateY(0)";

    });

}


/* ===============================
   LOADING STATE
================================ */

function setLoadingState() {

    if (!popup) return;

    popup.innerHTML = `
        <div style="font-weight:700;margin-bottom:6px;">KAI</div>
        <div style="font-size:13px;">Loading meaning...</div>
    `;

}


/* ===============================
   SUCCESS STATE
================================ */

function setSuccessState(data) {

    if (!popup) return;

    popup.innerHTML = `
        <div style="font-weight:700;font-size:16px;margin-bottom:8px;">
            ${data.word}
        </div>

        <div style="margin-bottom:8px;">
            <strong>Meaning:</strong> ${data.meaning}
        </div>

        <div style="margin-bottom:8px;">
            <strong>Example:</strong> ${data.example}
        </div>

        <div style="font-size:13px;color:#355E4A;">
            <strong>AI Insight:</strong> ${data.insight}
        </div>
    `;

}


/* ===============================
   ERROR STATE
================================ */

function setErrorState(message) {

    if (!popup) return;

    popup.innerHTML = `
        <div style="color:#c0392b;font-weight:600;">
            ${message}
        </div>
    `;

}


/* ===============================
   REMOVE POPUP
================================ */

function removePopup() {

    if (!popup) return;

    popup.remove();
    popup = null;
    currentWord = null;

}