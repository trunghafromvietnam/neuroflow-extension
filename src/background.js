import { CONFIG_API } from './config.js';

const classificationCache = {};

async function classifyContentWithOpenAI(title, url) {
    const apiKey = globalThis.CONFIG_API?.OPENAI_KEY;
    
    if (!apiKey) {
        console.error("MISSING API KEY");
        return "DOPAMINE"; 
    }

    if (classificationCache[url]) {
        console.log("Serving from Cache:", classificationCache[url]);
        return classificationCache[url];
    }

    const prompt = `
    Analyze this webpage context:
    Title: "${title}"
    URL: "${url}"
    
    Classify it into exactly one category:
    - GROWTH (Educational, Coding, News, Productivity, Science, Documentation)
    - DOPAMINE (Entertainment, Social Media Feeds, Pranks, Drama, Movies, Music, Short videos)
    
    Reply with ONLY the category word (GROWTH or DOPAMINE).
    `;

    try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: globalThis.CONFIG_API.MODEL || "gpt-3.5-turbo",
                messages: [{ role: "user", content: prompt }],
                temperature: 0.3, 
                max_tokens: 10
            })
        });

        const data = await response.json();
        
        if (data.error) {
            console.error("OpenAI Error:", data.error);
            return "DOPAMINE"; 
        }

        const label = data.choices[0].message.content.trim().toUpperCase();
        
        const finalLabel = (label.includes("GROWTH")) ? "GROWTH" : "DOPAMINE";

        classificationCache[url] = finalLabel;
        return finalLabel;

    } catch (error) {
        console.error("Network Error:", error);
        return "DOPAMINE";
    }
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "ANALYZE_PAGE") {
        console.log("Received analysis request for:", request.title);
        
        classifyContentWithOpenAI(request.title, request.url).then(label => {
            sendResponse({ label: label });
        });
        
        return true; 
    }
});

chrome.runtime.onInstalled.addListener((details) => {
    if (details.reason === "install") {
        console.log("NeuroFlow: First Install Detected.");
        
        // Open welcome page in a new tab
        chrome.tabs.create({ url: "welcome.html" });
        
        // Initiate data for doom meter
        chrome.storage.local.set({ doomScrollPixels: 0 });
    }
});