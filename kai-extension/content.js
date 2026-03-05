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

    createPopupContainer(rect.left, rect.bottom);

    setLoadingState();

    try {

        const data = await fetchWordData(word);

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

    // Remove punctuation from beginning and end
    text = text.replace(/^[^a-zA-Z]+|[^a-zA-Z]+$/g, "");

    if (!text) return null;

    if (text.split(" ").length > 1) return null;

    return text.toLowerCase();

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

async function fetchWordData(word) {

    return new Promise((resolve, reject) => {

        chrome.runtime.sendMessage(
            {
                type: "FETCH_WORD",
                word: word
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

    popup.style.opacity = "0";
    popup.style.transform = "translateY(5px)";
    popup.style.transition = "opacity 0.2s ease, transform 0.2s ease";

    document.body.appendChild(popup);

    const popupWidth = popup.offsetWidth;
    const screenWidth = window.innerWidth;

    if (x + popupWidth > screenWidth) {
        x = screenWidth - popupWidth - 20;
    }

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
        <div class="kai-title">KAI</div>
        <div class="kai-loading">Loading meaning...</div>
    `;

}


/* ===============================
   SUCCESS STATE
================================ */

function setSuccessState(data) {

    if (!popup) return;

    popup.innerHTML = `
        <div class="kai-word">${data.word}</div>

        <div class="kai-meaning">
            <strong>Meaning:</strong> ${data.meaning}
        </div>

        <div class="kai-example">
            <strong>Example:</strong> ${data.example}
        </div>

        <div class="kai-origin">
            ${data.etymology}
        </div>
    `;

}


/* ===============================
   ERROR STATE
================================ */

function setErrorState(message) {

    if (!popup) return;

    popup.innerHTML = `
        <div class="kai-error">${message}</div>
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