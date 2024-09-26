chrome.runtime.onInstalled.addListener(() => {
    // Create the "Open Custom URL" context menu
    chrome.contextMenus.create({
        id: "openCustomURL",
        title: "Open Tyk Netlify URL",
        contexts: ["link"]
    });

    // Create the "Open Shared Page" context menu
    // chrome.contextMenus.create({
    //     id: "openSharedPage",
    //     title: "Open Shared Page",
    //     contexts: ["link"]
    // });
});

// Listen for context menu clicks
chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (!info.selectionText.includes("/shared")) {
        handleCustomUrl(info, tab);
    } else {
        handleSharedPage(info, tab);
    }
    // if (info.menuItemId === "openCustomURL") {
    //     handleCustomUrl(info, tab);
    // } else if (info.menuItemId === "openSharedPage") {
    //     handleSharedPage(info, tab);
    // }
});

// Handle logic for "Open Custom URL"
function handleCustomUrl(info, tab) {
    const originalUrl = info.selectionText;
    openURL(originalUrl, tab)
}

// Handle logic for "Open Shared Page"
function handleSharedPage(info, tab) {
    const originalUrl = info.selectionText;
    const sharedMapping = getSharedMapping();

    // Extract the file name from the URL
    let fileName = originalUrl
        .replace(/^.*\/shared\//, "") // Remove everything before and including "/shared/"
        .replace(/\.md$/, "");
    console.log("File Name:", fileName);

    // Find where the file is referenced in the sharedMapping
    const references = sharedMapping[fileName];
    if (references) {
        chrome.tabs.sendMessage(tab.id, { action: "showAlert", message: `The /shared file (${fileName}) is referred at ${references.length} places` });
        console.log("Length of references", references.length)
        references.forEach((path, index) => {
            openURL(path, tab)
        });
    } else {
        chrome.tabs.sendMessage(tab.id, { action: "showAlert", message: `No mapping present for the selected /shared document (${fileName}), possibly the file is not included anywhere or the mapping object is not update in extension` });
        console.log("No references found for this shared file");
    }
}

function openURL(originalUrl, tab) {
    console.log("Original URL: ", originalUrl)
    if (originalUrl.startsWith("...nt")) {
        // Guess the missing part and append the full prefix
        originalUrl = originalUrl.replace("...nt", "/content");
        console.log("Expanded URL:", originalUrl);
    }
    if (!originalUrl.includes("/content") && originalUrl.startsWith("...")) {
        chrome.tabs.sendMessage(tab.id, { action: "showAlert", message: `The selected file path starts with an unknow prefix (FilePath: ${originalUrl}), this case is not accounted for while writing this extension. Please open the file manually` });
        return
    }

    let finalURL = originalUrl
        .replace(/^.*\/content\//, "") // Remove everything before and including "/content"
        .replace(/\.md$/, "");
    console.log("Original URL after transformation: ", finalURL)

    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const currentUrl = new URL(tabs[0].url);
        const currentTab = tabs[0]; // Get the currently active tab

        const prNumber = extractPrNumber(currentUrl);
        console.log("PR Number: ", prNumber)
        if (prNumber) {
            const customUrl = `https://deploy-preview-${prNumber}--tyk-docs.netlify.app/docs/nightly/${finalURL}`;
            chrome.tabs.create({ url: customUrl, index: currentTab.index + 1 });
        } else {
            chrome.tabs.sendMessage(tab.id, { action: "showAlert", message: `Failed to obtain PR number which is required for constructing netlify URL ${currentUrl}` });
            console.log("PR Number not found");
        }
    });
}

// Extract PR number from the current URL
function extractPrNumber(url) {
    const prMatch = url.pathname.match(/pull\/(\d+)/);
    return prMatch ? prMatch[1] : null;
}

// The shared mapping object
function getSharedMapping() {
    return {
        "self-managed-licensing-include": [
            "tyk-docs/tyk-docs/content/apim.md"
        ],
        "tyk-gateway-features-include": [
            "tyk-docs/tyk-docs/content/tyk-oss-gateway.md"
        ],
        "oss-product-list-include": [
            "tyk-docs/tyk-docs/content/tyk-stack.md",
            "tyk-docs/tyk-docs/content/apim/open-source.md"
        ],
        "create-api-key-include": [
            "tyk-docs/tyk-docs/content/getting-started/create-api-key.md"
        ],
        "create-api-include": [
            "tyk-docs/tyk-docs/content/getting-started/create-api.md"
        ],
        "create-security-policy-include": [
            "tyk-docs/tyk-docs/content/getting-started/create-security-policy.md"
        ],
        "create-portal-entry-include": [
            "tyk-docs/tyk-docs/content/getting-started/tutorials/publish-api.md"
        ],
        "mongodb-versions-include": [
            "tyk-docs/tyk-docs/content/planning-for-production/database-settings/mongodb.md",
            "tyk-docs/tyk-docs/content/tyk-dashboard/database-options.md"
        ],
        "sql-versions-include": [
            "tyk-docs/tyk-docs/content/planning-for-production/database-settings/postgresql.md",
            "tyk-docs/tyk-docs/content/tyk-dashboard/database-options.md"
        ],
        "grpc-include": [
            "tyk-docs/tyk-docs/content/plugins/supported-languages/rich-plugins/grpc/custom-auth-dot-net.md",
            "tyk-docs/tyk-docs/content/plugins/supported-languages/rich-plugins/grpc/custom-auth-nodejs.md",
            "tyk-docs/tyk-docs/content/plugins/supported-languages/rich-plugins/grpc/request-transformation-java.md"
        ],
        "api-def-authentication": [
            "tyk-docs/tyk-docs/content/tyk-apis/tyk-gateway-api/api-definition-objects/authentication.md"
        ],
        "api-def-events": [
            "tyk-docs/tyk-docs/content/tyk-apis/tyk-gateway-api/api-definition-objects/events.md"
        ],
        "api-def-graphql": [
            "tyk-docs/tyk-docs/content/tyk-apis/tyk-gateway-api/api-definition-objects/graphql.md"
        ],
        "api-def-common": [
            "tyk-docs/tyk-docs/content/tyk-apis/tyk-gateway-api/api-definition-objects/other-root-objects.md"
        ],
        "api-def-uptime": [
            "tyk-docs/tyk-docs/content/tyk-apis/tyk-gateway-api/api-definition-objects/uptime-tests.md"
        ],
        "x-tyk-gateway": [
            "tyk-docs/tyk-docs/content/tyk-apis/tyk-gateway-api/oas/x-tyk-oas-doc.md"
        ],
        "dashboard-config": [
            "tyk-docs/tyk-docs/content/tyk-dashboard/configuration.md"
        ],
        "mdcb-config": [
            "tyk-docs/tyk-docs/content/tyk-multi-data-centre/mdcb-configuration-options.md"
        ],
        "gateway-config": [
            "tyk-docs/tyk-docs/content/tyk-oss-gateway/configuration.md"
        ],
        "pump-config": [
            "tyk-docs/tyk-docs/content/tyk-pump/tyk-pump-configuration/tyk-pump-environment-variables.md"
        ]
    };
}
