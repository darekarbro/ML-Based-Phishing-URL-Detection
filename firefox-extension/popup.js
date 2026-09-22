function renderScanningUI(resultBox) {
    resultBox.classList.remove("hidden");
    resultBox.className = "result-card loading";
    
    resultBox.textContent = '';
    
    const header = document.createElement('div');
    header.className = 'status-header';
    
    const iconWrapper = document.createElement('div');
    iconWrapper.className = 'status-icon-wrapper';
    
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 24 24');
    svg.setAttribute('fill', 'none');
    svg.setAttribute('stroke', 'currentColor');
    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    circle.setAttribute('cx', '12'); circle.setAttribute('cy', '12'); circle.setAttribute('r', '10');
    const polyline = document.createElementNS('http://www.w3.org/2000/svg', 'polyline');
    polyline.setAttribute('points', '12 6 12 12 16 14');
    svg.append(circle, polyline);
    iconWrapper.appendChild(svg);
    
    const info = document.createElement('div');
    info.className = 'status-info';
    
    const title = document.createElement('div');
    title.className = 'status-title';
    title.textContent = 'Scanning...';
    
    const desc = document.createElement('div');
    desc.className = 'status-desc';
    desc.textContent = 'Analyzing website';
    
    info.append(title, desc);
    header.append(iconWrapper, info);
    resultBox.appendChild(header);
}

function renderErrorUI(resultBox) {
    resultBox.classList.remove("hidden");
    resultBox.className = "result-card danger";
    
    resultBox.textContent = '';
    
    const header = document.createElement('div');
    header.className = 'status-header';
    
    const iconWrapper = document.createElement('div');
    iconWrapper.className = 'status-icon-wrapper';
    
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 24 24');
    svg.setAttribute('fill', 'none');
    svg.setAttribute('stroke', 'currentColor');
    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    circle.setAttribute('cx', '12'); circle.setAttribute('cy', '12'); circle.setAttribute('r', '10');
    const line1 = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line1.setAttribute('x1', '12'); line1.setAttribute('y1', '8'); line1.setAttribute('x2', '12'); line1.setAttribute('y2', '12');
    const line2 = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line2.setAttribute('x1', '12'); line2.setAttribute('y1', '16'); line2.setAttribute('x2', '12.01'); line2.setAttribute('y2', '16');
    svg.append(circle, line1, line2);
    iconWrapper.appendChild(svg);
    
    const info = document.createElement('div');
    info.className = 'status-info';
    
    const title = document.createElement('div');
    title.className = 'status-title';
    title.textContent = 'Connection Failed';
    
    const desc = document.createElement('div');
    desc.className = 'status-desc';
    desc.textContent = 'Could not reach API';
    
    info.append(title, desc);
    header.append(iconWrapper, info);
    resultBox.appendChild(header);
}

function renderSuccessUI(resultBox, data, isDanger, mode) {
    resultBox.classList.remove("hidden");
    resultBox.className = "result-card " + (isDanger ? "danger" : "safe");
    
    resultBox.textContent = '';
    
    const header = document.createElement('div');
    header.className = 'status-header';
    
    const iconWrapper = document.createElement('div');
    iconWrapper.className = 'status-icon-wrapper';
    
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 24 24');
    svg.setAttribute('fill', 'none');
    svg.setAttribute('stroke', 'currentColor');
    
    if (isDanger) {
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('d', 'M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z');
        const line1 = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line1.setAttribute('x1', '12'); line1.setAttribute('y1', '9'); line1.setAttribute('x2', '12'); line1.setAttribute('y2', '13');
        const line2 = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line2.setAttribute('x1', '12'); line2.setAttribute('y1', '17'); line2.setAttribute('x2', '12.01'); line2.setAttribute('y2', '17');
        svg.append(path, line1, line2);
    } else {
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('d', 'M22 11.08V12a10 10 0 1 1-5.93-9.14');
        const polyline = document.createElementNS('http://www.w3.org/2000/svg', 'polyline');
        polyline.setAttribute('points', '22 4 12 14.01 9 11.01');
        svg.append(path, polyline);
    }
    iconWrapper.appendChild(svg);
    
    const info = document.createElement('div');
    info.className = 'status-info';
    
    const title = document.createElement('div');
    title.className = 'status-title';
    title.textContent = isDanger ? "High Phishing Risk" : "Website Appears Safe";
    
    const desc = document.createElement('div');
    desc.className = 'status-desc';
    desc.textContent = isDanger ? `${data.probability}% probability` : `${data.probability}% risk`;
    
    info.append(title, desc);
    header.append(iconWrapper, info);
    resultBox.appendChild(header);
    
    if (mode === "detailed" && data.features) {
        const featuresList = document.createElement('div');
        featuresList.className = 'features-list';
        
        for (const [key, value] of Object.entries(data.features)) {
            const item = document.createElement('div');
            item.className = 'feature-item';
            
            const nameSpan = document.createElement('span');
            nameSpan.className = 'feature-name';
            nameSpan.textContent = key;
            
            const valueSpan = document.createElement('span');
            valueSpan.className = 'feature-value';
            valueSpan.textContent = value;
            
            item.append(nameSpan, valueSpan);
            featuresList.appendChild(item);
        }
        resultBox.appendChild(featuresList);
    }
}

// On popup open, check cache
document.addEventListener('DOMContentLoaded', () => {
    let resultBox = document.getElementById("resultBox");

    chrome.tabs.query({ active: true, currentWindow: true }, async function (tabs) {
        if (!tabs || !tabs[0] || !tabs[0].url) return;

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

    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        if (!tabs || !tabs[0] || !tabs[0].url) return;

        let currentURL = tabs[0].url;
        let tabId = tabs[0].id;

        fetch("https://omd1809-phishing-detector-api.hf.space/predict", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                url: currentURL,
                mode: mode
            })
        })
            .then(response => response.json())
            .then(async data => {
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
                } catch (e) { }
            })
            .catch(async error => {
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
                } catch (e) { }
            });
    });
}

document.getElementById("fastScanBtn").addEventListener("click", function () {
    performScan("fast");
});

document.getElementById("detailedScanBtn").addEventListener("click", function () {
    performScan("detailed");
});