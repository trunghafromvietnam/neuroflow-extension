document.getElementById('start-btn').addEventListener('click', () => {
    chrome.tabs.create({ url: "https://google.com" });
    window.close();
});