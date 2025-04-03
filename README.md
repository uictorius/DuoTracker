# DuoTracker - Duolingo Non-Follower Tracker

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT) 
![Privacy](https://img.shields.io/badge/Privacy-100%25_local_processing-blue)

A privacy-focused browser extension that identifies non-reciprocal followers on Duolingo.

## 🔍 Important Disclaimers

### 🔑 Login Required
**You must be logged into Duolingo** in your browser for this extension to work. It uses your active session to access follower data.

### 🚫 Not Official
**This is NOT an official Duolingo product**  
This extension is independently developed and not affiliated with Duolingo, Inc. "Duolingo" is a registered trademark of Duolingo, Inc.

### 🔒 Zero Data Collection
**We don't collect ANY data**  
- No tracking
- No analytics
- No data leaves your browser
- No personal information stored
- No third-party requests

## ✨ Features

| Feature | Description |
|---------|-------------|
| 🔍 Non-follower detection | Identifies who doesn't follow you back |
| 📊 Profile statistics | Shows XP, followers, and following counts |
| 💾 Local storage | Remembers only your last searched username |
| 🛡️ 100% private | All processing happens in your browser |
| 🆓 Free & open source | Transparent code under MIT license |

## 🛠️ Installation

### Chrome/Edge (Manual Installation)
1. Download or clone this repository
2. Visit `chrome://extensions`
3. Enable **Developer mode** (top-right toggle)
4. Click **Load unpacked**
5. Select the `DuoTracker` folder

## 🖥️ Usage
1. Click the DuoTracker icon in your toolbar
2. Enter your Duolingo username
3. Click "Check Non-Followers"
4. View your results:
   - Profile summary
   - Follower statistics
   - List of non-reciprocal follows

## 🏗️ File Structure
```DuoTracker/
├── icons/               # Extension icons
│   ├── icon.png         # 16x16 toolbar icon
│   ├── icon48.png       # 48x48 extension icon
│   └── icon128.png      # 128x128 store icon
├── manifest.json        # Extension configuration
├── popup.html           # Main interface
├── popup.js             # Core functionality
├── styles.css           # UI styling
└── background.js        # Background processes
```

## 📄 License
MIT License - See [LICENSE](LICENSE) for full text