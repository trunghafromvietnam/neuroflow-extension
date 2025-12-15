import { CONFIG_API } from './config.js';

// --- HELPER ---
function cleanDomain(url) {
    try {
        let domain = url.replace('https://', '').replace('http://', '').replace('www.', '');
        return domain.split('/')[0].toLowerCase().trim();
    } catch (e) {
        return "";
    }
}

// --- AI MODULES ---
async function architectSession(goal) {
    const apiKey = CONFIG_API?.OPENAI_KEY;
    // Hard-allow YouTube to enable internal routing logic
    if (!apiKey) return { whitelist: ["google.com", "bing.com", "youtube.com"] };

    const prompt = `
    User Goal: "${goal}"
    Task: List 5-10 specific domains required.
    Rules:
    - JSON ONLY: { "whitelist": ["domain.com"] }
    - NO https, NO www.
    - ALWAYS include: "google.com", "bing.com", "youtube.com".
    `;

    try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
            body: JSON.stringify({ model: CONFIG_API.MODEL, messages: [{ role: "user", content: prompt }], temperature: 0.1 })
        });
        const data = await response.json();
        let raw = JSON.parse(data.choices[0].message.content.replace(/```json|```/g, '').trim());
        
        // Strict Sanitization
        raw.whitelist = raw.whitelist.map(d => cleanDomain(d)).filter(d => d.length > 2);
        return raw;
    } catch (e) {
        return { whitelist: ["google.com", "bing.com", "youtube.com"] }; 
    }
}

async function checkIntentAlignment(mission, intent) {
    const apiKey = CONFIG_API?.OPENAI_KEY;
    if (!apiKey) return { aligned: true, reason: "Offline" };

    const prompt = `
    Mission: "${mission}"
    Content: "${intent}"
    Task: Is this content productive for the mission?
    - YES: Research, Documentation, Tools, Tutorials.
    - NO: Social Media feeds, Entertainment, News (unless specific), Pranks, Music Videos (unless Lofi).
    Output JSON: { "aligned": boolean, "reason": "string" }
    `;

    try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
            body: JSON.stringify({ model: CONFIG_API.MODEL, messages: [{ role: "user", content: prompt }], temperature: 0.1 })
        });
        const data = await response.json();
        return JSON.parse(data.choices[0].message.content.replace(/```json|```/g, '').trim());
    } catch (e) { return { aligned: true, reason: "Offline" }; }
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "INIT_SESSION_AI") {
        architectSession(request.goal).then(res => sendResponse(res));
        return true;
    }
    if (request.action === "CHECK_ALIGNMENT") {
        checkIntentAlignment(request.mission, request.intent).then(res => sendResponse(res));
        return true;
    }
});

chrome.runtime.onInstalled.addListener((d) => {
    if (d.reason === "install") {
        chrome.tabs.create({ url: "welcome.html" });
        chrome.storage.local.set({ activeSession: false });
    }
});

chrome.action.onClicked.addListener(() => {
    chrome.tabs.create({ url: "dashboard.html" });
});