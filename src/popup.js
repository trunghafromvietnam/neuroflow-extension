const PIXELS_PER_METER = 3500; 

const LANDMARKS = [
    { height: 2, name: "an adult" },
    { height: 15, name: "an electric pole" },
    { height: 46, name: "Statue of Liberty" },
    { height: 81, name: "Landmark 81" },
    { height: 300, name: "Eiffel Tower" },
    { height: 8848, name: "Mount Everest" }
];

function updateUI() {
    chrome.storage.local.get(['doomScrollPixels'], (result) => {
        const pixels = result.doomScrollPixels || 0;
        
        const meters = (pixels / PIXELS_PER_METER).toFixed(1);
        
        document.getElementById('distance').innerText = meters;

        let comparison = "Not rolled enough.";
        for (let i = LANDMARKS.length - 1; i >= 0; i--) {
            if (meters >= LANDMARKS[i].height) {
                comparison = `You have scrolled over ${LANDMARKS[i].name}!`;
                break; 
            }
        }
        document.getElementById('comparison-text').innerText = comparison;
    });
}

document.getElementById('reset-btn').addEventListener('click', () => {
    chrome.storage.local.set({ doomScrollPixels: 0 }, () => {
        updateUI(); 
    });
});

updateUI();

// --- MISSION CONTROL ---
const missionInput = document.getElementById('mission-url');
const saveBtn = document.getElementById('save-mission-btn');
const statusText = document.getElementById('save-status');

chrome.storage.local.get(['missionUrl'], (result) => {
    if (result.missionUrl) {
        missionInput.value = result.missionUrl;
    }
});

saveBtn.addEventListener('click', () => {
    const url = missionInput.value;
    if (url) {
        chrome.storage.local.set({ missionUrl: url }, () => {
            statusText.style.display = 'block';
            setTimeout(() => { statusText.style.display = 'none'; }, 2000);
        });
    }
});