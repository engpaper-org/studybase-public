document.addEventListener("DOMContentLoaded", async function() {
    if (window.StudyBaseConsentState?.analyticsAllowed !== true) return;
    
    // --- CONFIGURATION ---
    let GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbz6WAa5VWe19UTQhKJ32eTF0gQnV2ZqQMyKlBflyzz9lpQrczB4RKeECsb5oKz7RLK9/exec";
    const PARAM_NAME = "material-ID";

    if (window.SiteConfig && window.SiteConfig.ready) {
        const config = await window.SiteConfig.ready;
        GOOGLE_SCRIPT_URL = config?.endpoints?.materialAnalytics || GOOGLE_SCRIPT_URL;
    }

    // --- HELPER FUNCTIONS ---

    // 1. Get URL Parameter
    function getQueryParam(param) {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get(param);
    }

   
    function utf8_to_b64(str) {
        return str;
    }

    // --- MAIN LOGIC ---
    const materialId = getQueryParam(PARAM_NAME);

    if (materialId) {
        // Encode the ID to Base64
        const base64Data = utf8_to_b64(materialId);

        // Prepare payload
        const payload = {
            data: base64Data
        };

        // Send POST request
        // 'no-cors' is required for direct browser -> Google Script requests
        fetch(GOOGLE_SCRIPT_URL, {
            method: "POST",
            mode: "no-cors",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(payload)
        })
        .then(() => {
            // Because of 'no-cors', we can't read the response JSON,
            // but the promise resolves if the request was sent successfully.
            console.log("Analytics sent for:", materialId);
        })
        .catch(error => {
            console.error("Analytics Error:", error);
        });

    } else {
        console.log("No game ID found in URL.");
    }
});
