console.log("KAI content script loaded");

let popup = null;
let currentWord = null;

/* ===============================
   WORD SELECTION LISTENER
================================ */

document.addEventListener("mouseup", async (event) => {

    const word = getSelectedWord();

    if (!word) {
        removePopup();
        return;
    }

    currentWord = word;

    createPopupContainer(event.pageX, event.pageY);
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
   FIX: Changed "click" to "mousedown" so it doesn't
   fire on the same event that opened the popup.
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

    const text = window.getSelection().toString().trim();

    if (!text) return null;

    if (text.split(" ").length > 1) return null;

    return text;

}


/* ===============================
   FETCH WORD DATA
================================ */

async function fetchWordData(word) {

    const response = await fetch(
        `http://localhost:3001/api/word?text=${word}`
    );

    if (!response.ok) {
        throw new Error("Word not found");
    }

    return response.json();

}


/* ===============================
   CREATE POPUP CONTAINER
================================ */

function createPopupContainer(x, y) {

    removePopup();

    popup = document.createElement("div");

    popup.className = "kai-popup";

    popup.style.position = "absolute";
    popup.style.top = `${y + 10}px`;
    popup.style.left = `${x + 10}px`;
    popup.style.background = "#ffffff";
    popup.style.border = "1px solid #e5e5e5";
    popup.style.padding = "14px";
    popup.style.borderRadius = "10px";
    popup.style.boxShadow = "0 10px 25px rgba(0,0,0,0.15)";
    popup.style.zIndex = "9999";
    popup.style.color = "#111";
    popup.style.maxWidth = "280px";
    popup.style.fontSize = "14px";
    popup.style.lineHeight = "1.5";
    popup.style.transition = "opacity 0.2s ease, transform 0.2s ease";

    popup.style.opacity = "0";
    popup.style.transform = "translateY(5px)";

    document.body.appendChild(popup);

    // FIX: capture popupRef before async gap so null check works correctly
    const popupRef = popup;

    requestAnimationFrame(() => {

        // FIX: check popupRef (local) not popup (global) to avoid null dereference
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
        <div style="font-weight:600;margin-bottom:6px;">
            Loading...
        </div>
        <div style="font-size:12px;color:#666;">
            Fetching word details
        </div>
    `;

}


/* ===============================
   SUCCESS STATE
================================ */

function setSuccessState(data) {

    if (!popup) return;

    popup.innerHTML = `
        <div style="font-weight:700;margin-bottom:6px;">
            ${data.word}
        </div>

        <div style="margin-bottom:6px;">
            <strong>Meaning:</strong> ${data.meaning}
        </div>

        <div style="margin-bottom:6px;">
            <strong>Example:</strong> ${data.example}
        </div>

        <div style="font-size:12px;color:#666;">
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
        <div style="color:#d33;font-weight:600;">
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