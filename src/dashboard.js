/**
 * NEUROFLOW - DASHBOARD CONTROLLER v7.1
 * Features: Real-time State Sync, Master Audio Switch
 */

const setupView = document.getElementById('setup-view');
const activeView = document.getElementById('active-view');
const goalInput = document.getElementById('goal-input');
const activeGoal = document.getElementById('active-goal');
const whitelistDisplay = document.getElementById('whitelist-display');
const gammaToggle = document.getElementById('gamma-toggle');

// --- 1. SYNC STATE & RENDER UI ---
document.addEventListener('DOMContentLoaded', () => {
    chrome.storage.local.get(['activeSession', 'sessionGoal', 'sessionWhitelist', 'gammaEnabled', 'currentBrainState', 'doomScrollPixels'], (res) => {
        
        // A. SESSION STATE
        if (res.activeSession) {
            setupView.classList.add('hidden');
            activeView.classList.remove('hidden');
            activeGoal.innerText = res.sessionGoal;
            whitelistDisplay.innerHTML = (res.sessionWhitelist || []).map(s => `<span style="color:#2ecc71">✔ ${s}</span>`).join('<br>');
            
            if (gammaToggle) gammaToggle.checked = res.gammaEnabled !== false;

            // B. BIO-GARDEN LOGIC (THÔNG MINH HƠN)
            updateBioTree(res.currentBrainState, res.doomScrollPixels);

        } else {
            activeView.classList.add('hidden');
            setupView.classList.remove('hidden');
            resetBioTree();
        }
    });
});

function updateBioTree(brainState, pixels = 0) {
    const img = document.getElementById('tree-img');
    const title = document.getElementById('garden-status');
    const sub = document.getElementById('dopamine-stat'); // Thêm id này vào html sau

    // ƯU TIÊN 1: Trạng thái tức thì (Real-time Context)
    // Nếu tab cuối cùng bạn xem là Dopamine -> Cây chết ngay lập tức (Cảnh báo)
    if (brainState === 'DOPAMINE') {
        img.src = "assets/tree_dead.png";
        img.classList.remove('breathe');
        title.innerText = "CRITICAL ALERT";
        title.style.color = "#e74c3c"; // Đỏ
        if(sub) sub.innerText = "Source: High Dopamine Environment detected.";
        return;
    }

    // ƯU TIÊN 2: Trạng thái tích lũy (Accumulated Fatigue)
    if (pixels > 15000) {
        img.src = "assets/tree_withered.png";
        img.classList.remove('breathe');
        title.innerText = "COGNITIVE FATIGUE";
        title.style.color = "#f1c40f"; // Vàng
        if(sub) sub.innerText = "Doomscrolling detected over time.";
    } else {
        img.src = "assets/tree_healthy.png";
        img.classList.add('breathe');
        title.innerText = "DEEP FLOW";
        title.style.color = "#2ecc71"; // Xanh
        if(sub) sub.innerText = "Brainwaves synchronized. Optimal state.";
    }
}

function resetBioTree() {
    const img = document.getElementById('tree-img');
    const title = document.getElementById('garden-status');
    img.src = "assets/tree_healthy.png";
    img.classList.add('breathe');
    title.innerText = "SYSTEM IDLE";
    title.style.color = "#888";
}

// --- 2. MASTER AUDIO SWITCH ---
if (gammaToggle) {
    gammaToggle.addEventListener('change', () => {
        const isEnabled = gammaToggle.checked;
        
        // 1. Lưu cài đặt
        chrome.storage.local.set({ gammaEnabled: isEnabled });

        // 2. BROADCAST (Gửi lệnh cho TẤT CẢ các tab ngay lập tức)
        chrome.tabs.query({}, (tabs) => {
            tabs.forEach(tab => {
                chrome.tabs.sendMessage(tab.id, { 
                    action: "GLOBAL_AUDIO_STATE_CHANGE", 
                    enabled: isEnabled 
                });
            });
        });
    });
}

// --- 3. SESSION CONTROLS ---
document.getElementById('start-btn').onclick = () => {
    const goal = goalInput.value;
    startBtn.innerText = "ARCHITECTING..."; 
    chrome.runtime.sendMessage({ action: "INIT_SESSION_AI", goal: goal }, (res) => {
        chrome.storage.local.set({ activeSession: true, sessionGoal: goal, sessionWhitelist: res.whitelist, gammaEnabled: true }, () => {
            chrome.runtime.sendMessage({ action: "START_SESSION" });
            window.location.reload();
        });
    });
};

document.getElementById('stop-btn').onclick = () => {
    chrome.storage.local.set({ activeSession: false }, () => window.location.reload());
};