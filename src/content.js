console.log("NeuroFlow: System Online.");

const CONFIG = {
    SCROLL_SENSITIVITY: 400,
    MAX_BLUR: 15,
    MIN_INTENT_LENGTH: 10 ,
    TYPING_SPEED: 50
};

let currentMode = 'NEUTRAL';
// --- The cortex --- 
function analyzeContent() {
    const title = document.title;
    const url = window.location.href;

    chrome.runtime.sendMessage(
        { action: "ANALYZE_PAGE", title: title, url: url },
        (response) => {
            if (response && response.label) {
                console.log(`AI Verdict: ${response.label}`);
                
                if (response.label === 'GROWTH') {
                    currentMode = 'GROWTH';
                } else {
                    currentMode = 'DOPAMINE';
                    showMissionButton();
                }
                
                applyVisualFriction();
            }
        }
    );
}

function showMissionButton() {
    if (document.getElementById('neuroflow-mission-btn')) return;

    chrome.storage.local.get(['missionUrl'], (result) => {
        const missionUrl = result.missionUrl;
        if (!missionUrl) return; 

        const btn = document.createElement('button');
        btn.id = 'neuroflow-mission-btn';
        btn.innerText = "GO TO MISSION";
        
        Object.assign(btn.style, {
            position: 'fixed',
            bottom: '30px',
            right: '30px',
            zIndex: '2147483647',
            padding: '15px 30px',
            background: '#00d2ff',
            color: '#000',
            border: '2px solid #fff',
            borderRadius: '50px',
            fontFamily: 'monospace',
            fontWeight: 'bold',
            fontSize: '16px',
            cursor: 'pointer',
            boxShadow: '0 0 20px rgba(0, 210, 255, 0.8)',
            animation: 'pulse 2s infinite'
        });

        const styleSheet = document.createElement("style");
        styleSheet.innerText = `
            @keyframes pulse {
                0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(0, 210, 255, 0.7); }
                70% { transform: scale(1.05); box-shadow: 0 0 0 10px rgba(0, 210, 255, 0); }
                100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(0, 210, 255, 0); }
            }
        `;
        document.head.appendChild(styleSheet);

        btn.addEventListener('click', () => {
            window.location.href = missionUrl;
        });

        document.body.appendChild(btn);
    });
}

// --- Part 1: Gateway Logics ---

function typeWriter(elementId, text, speed) {
    let i = 0;
    const element = document.getElementById(elementId);
    element.innerHTML = ""; 
    
    function typing() {
        if (i < text.length) {
            element.innerHTML += text.charAt(i);
            i++;
            setTimeout(typing, speed);
        } else {
            element.style.borderRight = "none";
        }
    }
    typing();
}

function createGateway() {
    if (sessionStorage.getItem('neuroflow-unlocked')) { 
        analyzeContent();
        return; 
    }

    const gatewayDiv = document.createElement('div');
    gatewayDiv.id = 'neuroflow-gateway';
    gatewayDiv.innerHTML = `
        <h1>NEUROFLOW SYSTEM</h1>
        <p id="neuroflow-prompt"></p> 
        
        <input type="text" id="neuroflow-input" placeholder="> Enter your intent..." autocomplete="off">
        <button id="neuroflow-btn">INITIATE SESSION</button>
    `;

    document.body.appendChild(gatewayDiv);
    document.body.style.overflow = 'hidden';

    const promptText = "High Dopamine Access Detected. Determine Your Purpose?";
    setTimeout(() => {
        typeWriter("neuroflow-prompt", promptText, CONFIG.TYPING_SPEED);
    }, 500);

    const input = document.getElementById('neuroflow-input');
    const btn = document.getElementById('neuroflow-btn');

    input.addEventListener('input', () => {
        if (input.value.length >= CONFIG.MIN_INTENT_LENGTH) {
            btn.classList.add('active');
            btn.disabled = false;
        } else {
            btn.classList.remove('active');
            btn.disabled = true;
        }
    });

    btn.addEventListener('click', () => {
        if (input.value.length >= CONFIG.MIN_INTENT_LENGTH) unlockSite();
    });
    
    input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && input.value.length >= CONFIG.MIN_INTENT_LENGTH) unlockSite();
    });
    
    input.focus();
}

function unlockSite() {
    const gateway = document.getElementById('neuroflow-gateway');
    if (gateway) {
        gateway.style.transition = 'opacity 0.8s ease-in'; 
        gateway.style.opacity = '0';
        setTimeout(() => {
            gateway.remove();
            document.body.style.overflow = 'auto';
            sessionStorage.setItem('neuroflow-unlocked', 'true');
            
            analyzeContent();
            applyVisualFriction(); 
        }, 800);
    }
}

// --- Part 2: GRAYSCALE + BLUR ---

function applyVisualFriction() {
    const scrollPosition = window.scrollY;
    let blurAmount = 0;

    if (currentMode === 'GROWTH') {
        blurAmount = Math.min(scrollPosition / 1000, CONFIG.MIN_BLUR); 
        document.documentElement.style.filter = `grayscale(100%) blur(${blurAmount}px)`;
    } else {
        blurAmount = Math.min(scrollPosition / CONFIG.SCROLL_SENSITIVITY, CONFIG.MAX_BLUR);
        document.documentElement.style.filter = `grayscale(100%) blur(${blurAmount}px)`;
    }
}

// --- Part 3: Run system ---

createGateway();

applyVisualFriction();

window.addEventListener('scroll', () => {
    if (!document.getElementById('neuroflow-gateway')) {
        window.requestAnimationFrame(applyVisualFriction);
    }
});

// Listen to tilte change
const observer = new MutationObserver(() => {
    analyzeContent();
    applyVisualFriction();
});
observer.observe(document.querySelector('title'), { subtree: true, characterData: true, childList: true });

// THE DOOM METER
let totalPixelsScrolled = 0;
let lastScrollY = window.scrollY;
let isScrolling = false;

window.addEventListener('scroll', () => {
    const currentScrollY = window.scrollY;
    const distance = Math.abs(currentScrollY - lastScrollY);
    
    if (currentMode === 'DOPAMINE' || currentMode === 'NEUTRAL') {
        totalPixelsScrolled += distance;
    }
    
    lastScrollY = currentScrollY;
    isScrolling = true;
});

setInterval(() => {
    if (isScrolling) {
        chrome.storage.local.get(['doomScrollPixels'], (result) => {
            const oldTotal = result.doomScrollPixels || 0;
            const newTotal = oldTotal + totalPixelsScrolled;
            
            chrome.storage.local.set({ doomScrollPixels: newTotal });
            
            totalPixelsScrolled = 0;
            isScrolling = false;
        });
    }
}, 2000);