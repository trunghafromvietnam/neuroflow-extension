# NeuroFlow | AI-Powered Attention OS (v7.1)

![Version](https://img.shields.io/badge/version-7.1.0-blue.svg)
![Stack](https://img.shields.io/badge/stack-Chrome%20Extension%20MV3%20%7C%20OpenAI%20%7C%20Web%20Audio%20API-success)
![License](https://img.shields.io/badge/license-MIT-green)

> **"Don't just block distractions. Outsmart them."** > An AI-driven cognitive layer that engineers Flow State through intent alignment, contextual whitelisting, and binaural entrainment.

---

## The Problem
We are fighting an asymmetric war. On one side: The human brain, evolved to seek quick rewards. On the other side: Supercomputers processing billions of data points to hack our **Dopamine Loops**. Traditional blockers act like "Jailers" (restriction), which users inevitably resent.

**NeuroFlow** acts as a **Cognitive Firewall**. It doesn't blindly block the internet; it architects your environment based on your intent.

---

## Key Features

### 1. Session Architecting (The Modal)
Instead of a static blocklist, NeuroFlow is **Session-First**.
* **Intent Injection:** Upon opening the browser, you must declare your specific goal (e.g., *"Learn React Hooks"*).
* **AI Whitelisting:** GPT-4o-mini analyzes your goal in real-time and constructs a bespoke whitelist of necessary resources (e.g., `react.dev`, `github.com`, `stackoverflow.com`).

### 2. The Intent Gateway
Navigating outside the AI-generated whitelist triggers the **Cyberpunk Gateway**.
* **Justification Protocol:** Access is paused. You must type a justification for the deviation.
* **Alignment Check:** The AI evaluates your justification against the original mission. If it aligns (e.g., "Looking up history of React"), access is granted. If it's a distraction, it is rejected.

### 3. Contextual Intelligence (Route-Aware)
NeuroFlow understands that not all pages on a domain are equal.
* **YouTube Handling:** Home Feed, Shorts, and Trending are treated as **Dopamine Zones** (Blocked/Friction). Specific watch URLs or Search Results containing educational keywords are evaluated by AI for **Growth** potential.

### 4. Sensory Bio-Feedback
* **Visual Friction (Dopamine Bleach):** In high-dopamine zones, the screen turns grayscale and blurs dynamically as you scroll, making the content chemically boring to the visual cortex.
* **Auditory Entrainment:** In **Growth Mode**, the system utilizes the Web Audio API to synthesize **40Hz Binaural Beats (Gamma Waves)**, scientifically proven to enhance focus and binding.

### 5. Global State Synchronization
A sophisticated message bus ensures **Real-time State Sync** between isolated content scripts and the full-screen Dashboard. Toggling audio or changing states in one tab reflects instantly across the entire browser ecosystem.

---

## Technical Architecture

This project leverages the full power of **Manifest V3**:

* **Prefrontal Cortex (Logic):** `background.js` handles API orchestration and strictly sanitizes domains to prevent whitelist leakage.
* **Sensory System (Content):** `content.js` injects the Bio-Layer. It uses a **Lazy Priming** mechanism to bypass Chrome's Autoplay Policy, arming the AudioContext on the first meaningful user interaction.
* **Central Nervous System (State):** Uses `chrome.storage.local` as the single source of truth, broadcasting state changes via `chrome.runtime.sendMessage` to ensure UI consistency.

### Project Structure
```text
NEUROFLOW/
├── src/
│   ├── assets/             # Icons and Bio-Garden assets
│   ├── background.js       # Service Worker (AI & Logic)
│   ├── content.js          # DOM Injection (Gateway, Audio, Visuals)
│   ├── dashboard.html      # Full-screen Mission Control
│   ├── dashboard.js        # Dashboard Logic & State Sync
│   ├── config.js           # API Configuration
│   ├── manifest.json       # Extension Config (MV3)
│   ├── styles.css          # Cyberpunk UI & Animations
│   ├── welcom.js
│   └── welcome.html        # Onboarding Flow
├── package.json
├── .gitignore
└── README.md
```

## Installation & Setup

**Prerequisites**
- Google Chrome (or Chromium-based browser).
- An OpenAI API Key.

**Steps**
1. Clone the Repository:

```
git clone [https://github.com/trunghafromvietnam/neuroflow-extension.git](https://github.com/trunghafromvietnam/neuroflow-extension.git)
```

2. Configure API Key:

- Navigate to src/config.js.
- Replace YOUR_API_KEY_HERE with your actual OpenAI API Key.
- Note: This file is included in .gitignore for security in production environments.

3. Load into Chrome:

- Open chrome://extensions/.
- Enable Developer Mode (top right).
- Click Load unpacked.
- Select the src folder.

## Usage Guide

1. **Initialization**: Upon installation, the Welcome Protocol initiates. Click "Initialize".

2. **Start a Session**: Open a new tab. The Session Architect modal will appear. Enter your goal.

3. **Deep Work:**

- Navigate to allowed sites -> Enjoy Green Interface & Gamma Waves.

- Navigate to distractions -> Face the Gateway or Visual Friction.

4. **Mission Control**: Click the extension icon to open the full-screen Dashboard. Use the Master Switch to toggle Gamma Waves globally or view your Bio-Garden status.

## Privacy & Security

- **Local Processing**: Logic regarding scroll depth and interaction is processed locally within the content script.

- **Data Minimization**: Only URL domains and Titles are sent to OpenAI for alignment verification. No page content or personal data is scraped.

## Acknowledgements

Built for the Hackathon 2025.
- **AI Model**: OpenAI GPT-4o-mini.
- **Audio Synthesis**: Native Web Audio API (No external libraries).

_**NeuroFlow: Reclaim your mind.**_