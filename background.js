// Background service worker for the extension

// Log installation event
chrome.runtime.onInstalled.addListener(() => {
    console.log('DuoTracker installed successfully');
});

// Listen for messages from other parts of the extension
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'getUserData') {
        // Handle data requests if needed
    }
});