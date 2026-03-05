chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {

    if (message.type === "FETCH_WORD") {

        fetch(`http://localhost:3001/api/word?text=${message.word}`)
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

        return true; // important for async response
    }

});