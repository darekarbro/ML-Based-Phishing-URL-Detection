chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'allowDomain' && message.domain) {
        chrome.storage.session.get([message.domain]).then(cachedData => {
            if (cachedData[message.domain]) {
                const updatedData = { ...cachedData[message.domain], ignored: true };
                chrome.storage.session.set({ [message.domain]: updatedData }).then(() => {
                    sendResponse({ success: true });
                });
            }
        });
        return true; // Keep the message channel open for sendResponse
    }
});

function injectWarningModal(domain) {
    // This function runs in the context of the webpage
    if (document.getElementById('phishing-detector-modal')) return;

    const overlay = document.createElement('div');
    overlay.id = 'phishing-detector-modal';
    Object.assign(overlay.style, {
        position: 'fixed',
        top: '0',
        left: '0',
        width: '100vw',
        height: '100vh',
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
        backdropFilter: 'blur(16px) saturate(180%)',
        WebkitBackdropFilter: 'blur(16px) saturate(180%)',
        zIndex: '2147483647',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Segoe UI", Roboto, Helvetica, Arial, sans-serif'
    });

    const modal = document.createElement('div');
    Object.assign(modal.style, {
        background: 'rgba(28, 28, 30, 0.85)',
        backdropFilter: 'blur(40px)',
        WebkitBackdropFilter: 'blur(40px)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: '24px',
        padding: '40px 32px 32px',
        maxWidth: '400px',
        width: '90%',
        textAlign: 'center',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.05)',
        color: '#f5f5f7',
        boxSizing: 'border-box'
    });

    modal.innerHTML = `
        <div style="width: 64px; height: 64px; background: rgba(255, 59, 48, 0.15); border-radius: 20px; display: flex; align-items: center; justify-content: center; margin: 0 auto 24px;">
            <svg style="width: 32px; height: 32px; color: #ff3b30;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                <line x1="12" y1="9" x2="12" y2="13"></line>
                <line x1="12" y1="17" x2="12.01" y2="17"></line>
            </svg>
        </div>
        <h1 style="margin: 0 0 12px; font-size: 24px; font-weight: 600; letter-spacing: -0.01em; color: #ffffff; line-height: 1.2;">Deceptive Site Warning</h1>
        <p style="margin: 0 0 20px; font-size: 15px; line-height: 1.4; color: #a1a1a6;">
            The website at <strong style="color: #ffffff; font-weight: 600;">${domain}</strong> has been flagged as a potential phishing risk. It may trick you into revealing personal information.
        </p>
        <div style="background: rgba(255, 59, 48, 0.15); border-radius: 12px; padding: 12px 16px; margin-bottom: 32px; text-align: left; display: flex; gap: 12px; align-items: flex-start; border: 1px solid rgba(255, 59, 48, 0.2);">
            <svg style="width: 20px; height: 20px; color: #ff453a; flex-shrink: 0; margin-top: 2px;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
            <span style="font-size: 13px; color: #ff453a; line-height: 1.4; font-weight: 500;">
                Our machine learning model may not be correct every time and can make mistakes. Please exercise caution.
            </span>
        </div>
        <div style="display: flex; flex-direction: column; gap: 8px;">
            <button id="phishing-go-back" style="background: #ff3b30; color: white; border: none; padding: 14px 24px; border-radius: 14px; font-weight: 600; font-size: 15px; cursor: pointer; transition: all 0.2s cubic-bezier(0.25, 1, 0.5, 1); width: 100%;">
                Go Back to Safety
            </button>
            <button id="phishing-continue" style="background: transparent; color: #ff453a; border: none; padding: 14px 24px; border-radius: 14px; font-weight: 500; font-size: 15px; cursor: pointer; transition: all 0.2s cubic-bezier(0.25, 1, 0.5, 1); width: 100%;">
                Continue Anyway
            </button>
        </div>
    `;

    overlay.appendChild(modal);
    document.body.appendChild(overlay);

    document.getElementById('phishing-go-back').addEventListener('mouseover', function() { this.style.transform = 'scale(0.98)'; this.style.opacity = '0.9'; });
    document.getElementById('phishing-go-back').addEventListener('mouseout', function() { this.style.transform = 'scale(1)'; this.style.opacity = '1'; });
    
    document.getElementById('phishing-continue').addEventListener('mouseover', function() { this.style.background = 'rgba(255, 59, 48, 0.1)'; });
    document.getElementById('phishing-continue').addEventListener('mouseout', function() { this.style.background = 'transparent'; });

    document.getElementById('phishing-go-back').addEventListener('click', () => {
        if (window.history.length > 1) {
            window.history.back();
        } else {
            window.close(); // If there is no history, just try to close the tab
        }
    });

    document.getElementById('phishing-continue').addEventListener('click', () => {
        chrome.runtime.sendMessage({ action: 'allowDomain', domain: domain }, (response) => {
            if (response && response.success) {
                overlay.remove();
            }
        });
    });
}

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
                const cache = cachedData[domain];
                
                // If it's previously evaluated as danger but NOT ignored yet, we might need to re-inject if the page reloaded
                if (cache.status === 'success' && cache.isDanger && !cache.ignored) {
                    chrome.action.setBadgeBackgroundColor({ color: '#d32f2f', tabId });
                    chrome.action.setBadgeText({ text: '!', tabId });
                    chrome.scripting.executeScript({
                        target: { tabId: tabId },
                        func: injectWarningModal,
                        args: [domain]
                    });
                    return;
                }

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

            if (isDanger) {
                chrome.scripting.executeScript({
                    target: { tabId: tabId },
                    func: injectWarningModal,
                    args: [domain]
                });
            }

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
