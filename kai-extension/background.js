chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {

    if (request.type === "FETCH_WORD") {

        fetch(`http://localhost:3001/api/word?text=${request.word}`)
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