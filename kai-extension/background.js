chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {

    if (message.type === "FETCH_WORD") {

        fetch(`http://localhost:3001/api/word`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                word: message.word,
                sentence: message.sentence
            })
        })
        .then(res => res.json())
        .then(data => {

            sendResponse({
                success: true,
                data: data
            });

        })
        .catch(() => {

            sendResponse({
                success: false
            });

        });

        return true;
    }

});