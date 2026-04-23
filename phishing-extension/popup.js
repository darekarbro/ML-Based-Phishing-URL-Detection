function renderScanningUI(resultBox) {
    resultBox.classList.remove("hidden");
    resultBox.className = "result-card loading";
    resultBox.innerHTML = `
        <div class="status-header">
            <div class="status-icon-wrapper">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
            </div>
            <div class="status-info">
                <div class="status-title">Scanning...</div>
                <div class="status-desc">Analyzing website</div>
            </div>
        </div>
    `;
}

function renderErrorUI(resultBox) {
    resultBox.classList.remove("hidden");
    resultBox.className = "result-card danger";
    resultBox.innerHTML = `
        <div class="status-header">
            <div class="status-icon-wrapper">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
            </div>
            <div class="status-info">
                <div class="status-title">Connection Failed</div>
                <div class="status-desc">Could not reach API</div>
            </div>
        </div>
    `;
}

function renderSuccessUI(resultBox, data, isDanger, mode) {
    resultBox.classList.remove("hidden");
    resultBox.className = "result-card " + (isDanger ? "danger" : "safe");
    
    let iconSvg = isDanger 
        ? `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>`
        : `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>`;
        
    let title = isDanger ? "High Phishing Risk" : "Website Appears Safe";
    let desc = isDanger ? `${data.probability}% probability` : `${data.probability}% risk`;

    let resultHtml = `
        <div class="status-header">
            <div class="status-icon-wrapper">
                ${iconSvg}
            </div>
            <div class="status-info">
                <div class="status-title">${title}</div>
                <div class="status-desc">${desc}</div>
            </div>
        </div>
    `;

    if(mode === "detailed" && data.features) {
        resultHtml += "<div class='features-list'>";
        for(const [key, value] of Object.entries(data.features)) {
            resultHtml += `<div class='feature-item'><span class='feature-name'>${key}</span><span class='feature-value'>${value}</span></div>`;
        }
        resultHtml += "</div>";
    }

    resultBox.innerHTML = resultHtml;
}

// On popup open, check cache
document.addEventListener('DOMContentLoaded', () => {
    let resultBox = document.getElementById("resultBox");
    
    chrome.tabs.query({active: true, currentWindow: true}, async function(tabs) {
        if(!tabs || !tabs[0] || !tabs[0].url) return;
        
        let currentURL = tabs[0].url;
        if (!currentURL.startsWith('http://') && !currentURL.startsWith('https://')) return;
        
        try {
            const domain = new URL(currentURL).hostname;
            const cachedData = await chrome.storage.session.get([domain]);
            
            if (cachedData[domain]) {
                const cache = cachedData[domain];
                if (cache.status === 'success') {
                    renderSuccessUI(resultBox, cache.data, cache.isDanger, "fast");
                } else if (cache.status === 'error') {
                    renderErrorUI(resultBox);
                } else if (cache.status === 'scanning') {
                    renderScanningUI(resultBox);
                }
            }
        } catch (e) {
            console.error("Failed to parse URL or read cache", e);
        }
    });
});

function performScan(mode) {
    let resultBox = document.getElementById("resultBox");
    renderScanningUI(resultBox);

    chrome.tabs.query({active:true,currentWindow:true}, function(tabs) {
        if(!tabs || !tabs[0] || !tabs[0].url) return;
        
        let currentURL = tabs[0].url;
        let tabId = tabs[0].id;

        fetch("http://127.0.0.1:8000/predict",{
            method:"POST",
            headers:{
                "Content-Type":"application/json"
            },
            body:JSON.stringify({
                url:currentURL,
                mode:mode
            })
        })
        .then(response=>response.json())
        .then(async data=>{
            let isDanger = data.probability > 50;
            renderSuccessUI(resultBox, data, isDanger, mode);
            
            // Update cache and badge after manual scan
            try {
                if (currentURL.startsWith('http://') || currentURL.startsWith('https://')) {
                    const domain = new URL(currentURL).hostname;
                    await chrome.storage.session.set({
                        [domain]: {
                            status: 'success',
                            data: data,
                            isDanger: isDanger
                        }
                    });
                    
                    chrome.action.setBadgeBackgroundColor({ color: isDanger ? '#d32f2f' : '#388e3c', tabId });
                    chrome.action.setBadgeText({ text: isDanger ? '!' : '✓', tabId });
                }
            } catch (e) {}
        })
        .catch(async error=>{
            renderErrorUI(resultBox);
            
            // Update cache and badge for error state
            try {
                if (currentURL.startsWith('http://') || currentURL.startsWith('https://')) {
                    const domain = new URL(currentURL).hostname;
                    await chrome.storage.session.set({
                        [domain]: { status: 'error' }
                    });
                    
                    chrome.action.setBadgeBackgroundColor({ color: '#9e9e9e', tabId });
                    chrome.action.setBadgeText({ text: '?', tabId });
                }
            } catch (e) {}
        });
    });
}

document.getElementById("fastScanBtn").addEventListener("click", function() {
    performScan("fast");
});

document.getElementById("detailedScanBtn").addEventListener("click", function() {
    performScan("detailed");
});