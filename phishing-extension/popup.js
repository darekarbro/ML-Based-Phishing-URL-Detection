function performScan(mode) {
    let resultBox = document.getElementById("resultBox");

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

    chrome.tabs.query({active:true,currentWindow:true}, function(tabs) {
        let currentURL=tabs[0].url;

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
        .then(data=>{
            let isDanger = data.probability > 50;
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
        })
        .catch(error=>{
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
        });
    });
}

document.getElementById("fastScanBtn").addEventListener("click", function() {
    performScan("fast");
});

document.getElementById("detailedScanBtn").addEventListener("click", function() {
    performScan("detailed");
});