chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create({
        id: "openCustomURL",
        title: "Open Custom URL",
        contexts: ["link"]
    });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === "openCustomURL") {
        const originalUrl = info.selectionText;

        console.log("Link URL:", info);
        // tyk-docs/content/getting-started/key-concepts/url-matching.md
        // Remove the prefix "tyk-docs/content" and suffix ".md"
        let finalURL = originalUrl
            .replace(/^.*\/content\//, "") // Remove everything before and including "/content"
            .replace(/\.md$/, ""); // Remove the ".md" suffix
        console.log("Final URL:", finalURL);


        // Get the active tab URL
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            const currentUrl = new URL(tabs[0].url);

            // Extract PR number from URL
            const prNumber = extractPrNumber(currentUrl);
            if (prNumber) {
                // Construct a new URL based on the PR number
                const customUrl = `https://deploy-preview-${prNumber}--tyk-docs.netlify.app/docs/nightly/${finalURL}`;
                chrome.tabs.create({ url: customUrl });
            } else {
                console.log("PR Number not found");
            }
        });
    }
});

function extractPrNumber(url) {
    // Regular expression to capture the PR number
    const prMatch = url.pathname.match(/pull\/(\d+)/);
    return prMatch ? prMatch[1] : null;
}
