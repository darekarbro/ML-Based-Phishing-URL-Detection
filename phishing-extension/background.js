chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
    // Only scan when the page has fully loaded
    if (changeInfo.status === 'complete' && tab.url) {
        // Only process http and https URLs
        if (!tab.url.startsWith('http://') && !tab.url.startsWith('https://')) {
            return;
        }

        try {
            const urlObj = new URL(tab.url);
            const domain = urlObj.hostname;

            // Check if we've already scanned or are currently scanning this domain
            const cachedData = await chrome.storage.session.get([domain]);
            if (cachedData[domain]) {
                // If it's already scanned or scanning, just ensure the badge is set correctly if it's a success or error
                const cache = cachedData[domain];
                if (cache.status === 'success') {
                    chrome.action.setBadgeBackgroundColor({ color: cache.isDanger ? '#d32f2f' : '#388e3c', tabId });
                    chrome.action.setBadgeText({ text: cache.isDanger ? '!' : '✓', tabId });
                } else if (cache.status === 'error') {
                    chrome.action.setBadgeBackgroundColor({ color: '#9e9e9e', tabId });
                    chrome.action.setBadgeText({ text: '?', tabId });
                }
                return;
            }

            // Mark as scanning in cache
            await chrome.storage.session.set({
                [domain]: { status: 'scanning' }
            });

            // Call the Fast Scan API
            const response = await fetch("http://127.0.0.1:8000/predict", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    url: tab.url,
                    mode: "fast"
                })
            });

            if (!response.ok) {
                throw new Error("API Connection Failed");
            }

            const data = await response.json();
            const isDanger = data.probability > 50;

            // Cache the successful result
            await chrome.storage.session.set({
                [domain]: {
                    status: 'success',
                    data: data,
                    isDanger: isDanger
                }
            });

            // Update the extension badge for this tab
            chrome.action.setBadgeBackgroundColor({ color: isDanger ? '#d32f2f' : '#388e3c', tabId });
            chrome.action.setBadgeText({ text: isDanger ? '!' : '✓', tabId });

        } catch (error) {
            console.error("Background scan failed:", error);
            const domain = new URL(tab.url).hostname;
            
            // Cache the error result (No retry as requested)
            await chrome.storage.session.set({
                [domain]: {
                    status: 'error'
                }
            });

            // Update badge to grey with '?'
            chrome.action.setBadgeBackgroundColor({ color: '#9e9e9e', tabId });
            chrome.action.setBadgeText({ text: '?', tabId });
        }
    }
});
