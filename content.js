// Listen for messages from the background script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "showAlert") {
        alert(request.message); // Show the alert with the message
    }
});
