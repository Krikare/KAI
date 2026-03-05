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

    const text = window.getSelection().toString().trim();

    if (!text) return null;

    if (text.split(" ").length > 1) return null;

    return text;

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
   FETCH WORD DATA (via background)
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