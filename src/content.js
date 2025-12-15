/**
 * NEUROFLOW - CONTENT SCRIPT v7.0
 */
console.log("NeuroFlow: Bio-Layer Active.");

const CONFIG = {
    SCROLL_SENSITIVITY: 400,
    MAX_BLUR: 15,
    MIN_INTENT_LENGTH: 3
};

let currentMode = 'NEUTRAL';
let audioContext = null;

// --- HELPER: STRICT WHITELISTING ---
function normalizeHost(host) {
    return (host || "").toLowerCase().replace(/^www\./, "").trim();
}

function isDomainAllowed(host, allowedDomain) {
    const h = normalizeHost(host);
    const a = normalizeHost(allowedDomain);
    if (!h || !a) return false;
    return h === a || h.endsWith("." + a);
}

function isWhitelistedHost(host, whitelist = []) {
    const hardAllow = ["google.com", "bing.com", "duckduckgo.com", "youtube.com"]; // Hard allow YT to enter routing logic
    if (hardAllow.some(d => isDomainAllowed(host, d))) return true;
    return whitelist.some(d => isDomainAllowed(host, d));
}

// --- UI ENGINE ---
function showToast(message, type = 'info') {
    const existing = document.getElementById('nf-toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.id = 'nf-toast';
    let color = type === 'growth' ? '#2ecc71' : (type === 'dopamine' ? '#e74c3c' : '#00d2ff');

    toast.innerHTML = `
        <div style="font-weight:700; color:${color}; font-family:sans-serif; font-size:12px;">NEUROFLOW</div>
        <div style="color:#fff; font-family:sans-serif; font-size:14px;">${message}</div>
    `;
    Object.assign(toast.style, {
        position: 'fixed', top: '20px', right: '20px', zIndex: '2147483647',
        padding: '12px 24px', background: 'rgba(5,5,5,0.95)', borderLeft: `3px solid ${color}`,
        borderRadius: '4px', transform: 'translateX(120%)', transition: 'transform 0.4s ease'
    });
    document.documentElement.appendChild(toast);
    requestAnimationFrame(() => toast.style.transform = 'translateX(0)');
    setTimeout(() => { if(toast) toast.remove(); }, 4000);
}

// --- AUDIO ENGINE ---
class NeuroAudio {
    constructor() { this.isPlaying = false; this.nodes = []; }
    
    init() {
        if (!audioContext) {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            audioContext = new AudioContext();
        }
        if (!this.master) {
            this.master = audioContext.createGain();
            this.master.connect(audioContext.destination);
            this.master.gain.value = 0.05;
        }
    }

    async play() {
        this.init();
        if (this.isPlaying) return;

        try {
            if (audioContext.state === 'suspended') {
                await audioContext.resume();
            }
            this.startOscillators();
            showToast("🎵 Gamma Waves Active", "growth");
        } catch (e) {
            // Silent fail, wait for user gesture
        }
    }

    startOscillators() {
        if (this.isPlaying) return;
        const osc1 = audioContext.createOscillator(); osc1.frequency.value = 400;
        const osc2 = audioContext.createOscillator(); osc2.frequency.value = 440;
        const pan1 = audioContext.createStereoPanner(); pan1.pan.value = -1;
        const pan2 = audioContext.createStereoPanner(); pan2.pan.value = 1;
        
        osc1.connect(pan1).connect(this.master);
        osc2.connect(pan2).connect(this.master);
        osc1.start(); osc2.start();
        this.nodes = [osc1, osc2];
        this.isPlaying = true;
    }

    stop() {
        if (this.isPlaying) {
            this.nodes.forEach(n => { try{n.stop()}catch(e){} });
            this.nodes = [];
            this.isPlaying = false;
        }
    }
}
const audioEngine = new NeuroAudio();

// --- LOGIC CONTROLLER ---
function applyMode(mode) {
    currentMode = mode;
    const html = document.documentElement;
    html.classList.remove('neuroflow-growth-mode', 'neuroflow-dopamine-mode');

    // 1. REPORT STATE TO SYSTEM 
    chrome.storage.local.set({ currentBrainState: mode });

    if (mode === 'GROWTH') {
        html.classList.add('neuroflow-growth-mode');
        html.style.filter = 'none';
        
        const btn = document.getElementById('nf-mission-btn');
        if(btn) btn.remove();

        // Audio Logic
        chrome.storage.local.get(['gammaEnabled'], (res) => {
            if (res.gammaEnabled !== false) audioEngine.play();
        });

    } else {
        html.classList.add('neuroflow-dopamine-mode');
        // Stop audio immediately in Dopamine mode
        audioEngine.stop();
        showToast("⚠️ Dopamine Detected", "dopamine");
        showMissionButton();
    }
}

function initSystem() {
    chrome.storage.local.get(['activeSession', 'sessionGoal', 'sessionWhitelist'], (res) => {
        if (!res.activeSession) {
            createSessionModal();
            return;
        }

        const host = window.location.hostname;
        const isWhitelisted = isWhitelistedHost(host, res.sessionWhitelist || []);

        if (isWhitelisted) {
            // --- YOUTUBE SPECIFIC ROUTING ---
            if (isDomainAllowed(host, 'youtube.com')) {
                const path = location.pathname || "/";
                const q = new URLSearchParams(location.search);
            
                // 1. Home / Shorts / Feed -> DOPAMINE
                const isHome = path === "/" || path.startsWith("/feed") || path.startsWith("/shorts");
                if (isHome) { applyMode("DOPAMINE"); return; }
            
                // 2. Search Results -> AI Check
                if (path.startsWith("/results")) {
                    const query = q.get("search_query") || "";
                    const intent = query ? `Youtube: ${query}` : "YouTube Results";
                    chrome.runtime.sendMessage({ action: "CHECK_ALIGNMENT", mission: res.sessionGoal, intent }, (aiRes) => {
                        applyMode((aiRes && aiRes.aligned) ? "GROWTH" : "DOPAMINE");
                    });
                    return;
                }
            
                // 3. Watch Video -> AI Check
                if (path.startsWith("/watch")) {
                    const title = document.title || "YouTube Watch";
                    chrome.runtime.sendMessage({ action: "CHECK_ALIGNMENT", mission: res.sessionGoal, intent: title }, (aiRes) => {
                        applyMode((aiRes && aiRes.aligned) ? "GROWTH" : "DOPAMINE");
                    });
                    return;
                }
                
                // Fallback
                applyMode("DOPAMINE");
                return;
            } 
            // --- END YOUTUBE LOGIC ---

            applyMode("GROWTH");
        } else {
            renderGateway(res.sessionGoal);
        }
    });
}

// --- MODAL & GATEWAY ---
function createSessionModal() {
    if (document.getElementById('nf-session-modal')) return;
    if (window.self !== window.top) return;

    const modal = document.createElement('div');
    modal.id = 'nf-session-modal';
    // (Using Cyberpunk Style via CSS Class now)
    modal.innerHTML = `
        <div class="nf-overlay">
            <div class="nf-card">
                <div class="nf-title">NEUROFLOW OS</div>
                <div class="nf-sub">Initiate Deep Work Protocol</div>
                <input class="nf-input" type="text" id="nf-goal-input" placeholder="E.g., Learn React..." />
                <button class="nf-btn" id="nf-start-btn">INITIATE</button>
                <div class="nf-mini" style="display:flex; gap:10px; justify-content:center; align-items:center;">
                    <input type="checkbox" id="nf-gamma-toggle" checked> Enable Audio
                </div>
            </div>
        </div>
    `;
    document.documentElement.appendChild(modal);

    const input = document.getElementById('nf-goal-input');
    const btn = document.getElementById('nf-start-btn');
    const toggle = document.getElementById('nf-gamma-toggle');
    input.focus();

    const start = () => {
        if(input.value.length < 3) return;
        btn.innerText = "ARCHITECTING...";
        btn.disabled = true;
        
        chrome.runtime.sendMessage({ action: "INIT_SESSION_AI", goal: input.value }, (res) => {
            const whitelist = res.whitelist || [];
            chrome.storage.local.set({
                activeSession: true,
                sessionGoal: input.value,
                sessionWhitelist: whitelist,
                gammaEnabled: toggle.checked
            }, async () => {
                // Audio Priming
                if (toggle.checked) { try { await audioEngine.play(); } catch(e) {} }
                modal.remove();
                document.body.style.overflow = 'auto';
                chrome.runtime.sendMessage({ action: "START_SESSION" });
                initSystem();
            });
        });
    };
    btn.onclick = start;
    input.onkeypress = (e) => { if(e.key==='Enter') start() };
}

function renderGateway(mission) {
    const hostKey = `nf-unlocked:${location.hostname}`;
    if (sessionStorage.getItem(hostKey)) { initSystem(); return; }
    if (document.getElementById('nf-gateway')) return;

    const div = document.createElement('div');
    div.id = 'nf-gateway';
    div.innerHTML = `
        <div class="nf-overlay">
            <div class="nf-card">
                <div class="nf-title">OUT OF SCOPE</div>
                <div class="nf-sub">Not in plan: <b style="color:#fff;">${mission}</b></div>
                <input class="nf-input" type="text" id="nf-input" placeholder="Justify access (1 sentence)..." />
                <button class="nf-btn" id="nf-btn">VERIFY</button>
                <div class="nf-mini">Be specific. What exactly will you do?</div>
            </div>
        </div>
    `;
    document.documentElement.appendChild(div);
    document.body.style.overflow = 'hidden';

    const btn = document.getElementById('nf-btn');
    const input = document.getElementById('nf-input');
    
    const check = () => {
        if(!input.value) return;
        btn.innerText = "ANALYZING...";
        chrome.runtime.sendMessage({ action: "CHECK_ALIGNMENT", mission: mission, intent: input.value }, (res) => {
            if (res && res.aligned) {
                div.remove();
                document.body.style.overflow = 'auto';
                sessionStorage.setItem(hostKey, 'true'); // Unlock this host
                applyMode("GROWTH");
            } else {
                showToast("⛔ Rejected", "dopamine");
                btn.innerText = "TRY AGAIN";
            }
        });
    };
    btn.onclick = check;
    input.focus();
}

function showMissionButton() {
    if (document.getElementById('nf-mission-btn')) return;
    const btn = document.createElement('button');
    btn.id = 'nf-mission-btn';
    btn.innerText = "🚀 RETURN TO MISSION";
    Object.assign(btn.style, { position:'fixed', bottom:'30px', right:'30px', zIndex:'2147483647', padding:'15px 30px', background:'#00d2ff', borderRadius:'50px', border:'2px solid white', cursor:'pointer' });
    btn.onclick = () => window.location.href = "https://google.com"; 
    document.body.appendChild(btn);
}

// --- GLOBAL LISTENERS ---
document.addEventListener('pointerdown', async () => {
    chrome.storage.local.get(['gammaEnabled', 'activeSession'], async (res) => {
        if (!res.activeSession || res.gammaEnabled === false) return;
        if (currentMode !== "GROWTH") return;
        try { await audioEngine.play(); } catch (e) {}
    });
}, { capture: true, once: true });

chrome.runtime.onMessage.addListener((req) => {
    if (req.action === "GLOBAL_AUDIO_STATE_CHANGE") {
        const isEnabled = req.enabled;
        
        if (isEnabled) {
            if (currentMode === 'GROWTH') {
                audioEngine.play();
                showToast("Audio System Enabled", "growth");
            }
        } else {
            audioEngine.stop();
            showToast("Audio System Disabled", "info");
        }
    }
    
    if (req.action === "MANUAL_TOGGLE_AUDIO") {
        audioEngine.isPlaying ? audioEngine.stop() : audioEngine.play();
    }
});

let lastUrl = location.href;
new MutationObserver(() => {
    if (location.href !== lastUrl) { lastUrl = location.href; initSystem(); }
}).observe(document, {subtree:true, childList:true});

window.addEventListener('scroll', () => {
    if (currentMode === 'DOPAMINE' && !location.href.includes('search')) {
        const blur = Math.min(window.scrollY / CONFIG.SCROLL_SENSITIVITY, CONFIG.MAX_BLUR);
        document.documentElement.style.filter = `grayscale(100%) blur(${blur}px)`;
    }
});

// START
initSystem();