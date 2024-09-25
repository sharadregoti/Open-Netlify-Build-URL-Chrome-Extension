chrome.runtime.onInstalled.addListener(() => {
    // Create the "Open Custom URL" context menu
    chrome.contextMenus.create({
        id: "openCustomURL",
        title: "Open Custom URL",
        contexts: ["link"]
    });

    // Create the "Open Shared Page" context menu
    chrome.contextMenus.create({
        id: "openSharedPage",
        title: "Open Shared Page",
        contexts: ["link"]
    });
});

// Listen for context menu clicks
chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === "openCustomURL") {
        handleCustomUrl(info, tab);
    } else if (info.menuItemId === "openSharedPage") {
        handleSharedPage(info, tab);
    } else if (info.menuItemId.startsWith("sharedSubMenu_")) {
        handleSharedSubMenuClick(info);
    }
});

// Handle logic for "Open Custom URL"
function handleCustomUrl(info, tab) {
    const originalUrl = info.selectionText;

    let finalURL = originalUrl
        .replace(/^.*\/content\//, "") // Remove everything before and including "/content"
        .replace(/\.md$/, "");

    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const currentUrl = new URL(tabs[0].url);
        const currentTab = tabs[0]; // Get the currently active tab

        const prNumber = extractPrNumber(currentUrl);
        if (prNumber) {
            const customUrl = `https://deploy-preview-${prNumber}--tyk-docs.netlify.app/docs/nightly/${finalURL}`;
            chrome.tabs.create({ url: customUrl, index: currentTab.index + 1 });
        } else {
            console.log("PR Number not found");
        }
    });
}

// Extract PR number from the current URL
function extractPrNumber(url) {
    const prMatch = url.pathname.match(/pull\/(\d+)/);
    return prMatch ? prMatch[1] : null;
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

        console.log("Length of references", references.length)

        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            const currentUrl = new URL(tabs[0].url);
            const currentTab = tabs[0]; // Get the currently active tab

            references.forEach((path, index) => {
                let finalURL = path
                    .replace(/^.*\/content\//, "") // Remove everything before and including "/content"
                    .replace(/\.md$/, "");
                
                console.log(`Final URL ${1}: ${finalURL}`)

                const prNumber = extractPrNumber(currentUrl);
                if (prNumber) {
                    const customUrl = `https://deploy-preview-${prNumber}--tyk-docs.netlify.app/docs/nightly/${finalURL}`;
                    chrome.tabs.create({ url: customUrl, index: currentTab.index + 1 });
                } else {
                    console.log("PR Number not found");
                }
            });

        });
    } else {
        console.log("No references found for this shared file");
    }
}

// Handle logic for submenu clicks
function handleSharedSubMenuClick(info) {
    const clickedMenuId = info.menuItemId;
    const path = info.menuItemId.replace("sharedSubMenu_", "");

    console.log("Clicked shared submenu:", clickedMenuId, path);
    // You can now open the corresponding tab or do other actions
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
        "*-tyk-gateway.md*": [
            "tyk-docs/tyk-docs/content/tyk-apis/tyk-gateway-api/oas/x-tyk-oas-doc.md"
        ],
        "dashboard-config.md": [
            "tyk-docs/tyk-docs/content/tyk-dashboard/configuration.md"
        ],
        "mdcb-config.md": [
            "tyk-docs/tyk-docs/content/tyk-multi-data-centre/mdcb-configuration-options.md"
        ],
        "gateway-config.md": [
            "tyk-docs/tyk-docs/content/tyk-oss-gateway/configuration.md"
        ],
        "pump-config.md": [
            "tyk-docs/tyk-docs/content/tyk-pump/tyk-pump-configuration/tyk-pump-environment-variables.md"
        ]
    };
}
