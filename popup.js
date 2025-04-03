/**
 * Main controller for the DuoTracker extension
 */
document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const trackBtn = document.getElementById('trackBtn');
    const usernameInput = document.getElementById('username');
    const loadingDiv = document.getElementById('loading');
    const resultsDiv = document.getElementById('results');
    const errorDiv = document.getElementById('error');

    // Load last searched username from storage
    loadLastUsername();

    // Event listener for the track button
    trackBtn.addEventListener('click', trackUser);

    /**
     * Loads the last searched username from chrome.storage
     */
    function loadLastUsername() {
        chrome.storage.local.get('lastUsername', (data) => {
            if (data.lastUsername) {
                usernameInput.value = data.lastUsername;
            }
        });
    }

    /**
     * Main function to track a user's non-followers
     */
    async function trackUser() {
        const username = usernameInput.value.trim();

        if (!username) {
            showError('Please enter a Duolingo username');
            return;
        }

        try {
            resetUI();
            showLoading();

            // Save username for next time
            chrome.storage.local.set({ lastUsername: username });

            // Fetch user data
            const user = await fetchUserData(username);
            displayProfileInfo(user);
            console.log(user);

            // Fetch followers and following in parallel
            const [followers, following] = await Promise.all([
                fetchFollowers(user.id),
                fetchFollowing(user.id)
            ]);

            // Process and display results
            const nonFollowers = findNonFollowers(followers, following);
            updateStats(user.totalXp, followers.length, following.length, nonFollowers.length);
            displayNonFollowers(nonFollowers);

            showResults();
        } catch (error) {
            showError(error.message);
            console.error('DuoTracker error:', error);
        } finally {
            hideLoading();
        }
    }

    /**
     * Gets only user ID (lightweight request)
     * @param {string} username - Duolingo username
     * @returns {Promise<string>} User ID
     */
    async function fetchUserId(username) {
        const data = await fetchDuolingoData(
            `users?fields=users%7Bid%7D&username=${username}`
        );
        if (!data.users?.length) throw new Error('User not found');
        return data.users[0].id;
    }

    /**
     * Gets complete user data with fresh XP/streaks
     * @param {string} username - Duolingo username
     * @returns {Promise<Object>} Full user data
     */
    async function fetchUserData(username) {
        const userId = await fetchUserId(username);
        const fields = [
            'id',
            'name',
            'picture',
            'totalXp',
            'username'
        ].join(',');

        return fetchDuolingoData(`users/${userId}?fields=${fields}`);
    }

    /**
     * Fetches user's followers
     * @param {string} userId - Duolingo user ID
     * @returns {Promise<Array>} Array of followers
     */
    async function fetchFollowers(userId) {
        const data = await fetchDuolingoData(
            `friends/users/${userId}/followers?fields=users%7BuserId,username,picture,totalXp%7D`
        );
        return data.followers?.users || [];
    }

    /**
     * Fetches who the user is following
     * @param {string} userId - Duolingo user ID
     * @returns {Promise<Array>} Array of users being followed
     */
    async function fetchFollowing(userId) {
        const data = await fetchDuolingoData(
            `friends/users/${userId}/following?fields=users%7BuserId,username,picture,totalXp%7D`
        );
        return data.following?.users || [];
    }

    /**
     * Generic function to fetch data from Duolingo API
     * @param {string} endpoint - API endpoint
     * @returns {Promise<Object>} JSON response
     */
    async function fetchDuolingoData(endpoint) {
        const response = await fetch(`https://www.duolingo.com/2017-06-30/${endpoint}`, {
            credentials: 'include' // Send cookies for authentication
        });

        if (!response.ok) {
            throw new Error('Failed to fetch data from Duolingo');
        }

        return await response.json();
    }

    /**
     * Identifies users who don't follow back
     * @param {Array} followers - Array of follower objects
     * @param {Array} following - Array of users being followed
     * @returns {Array} Users who don't follow back
     */
    function findNonFollowers(followers, following) {
        const followerIds = new Set(followers.map(u => u.userId));
        return following.filter(u => !followerIds.has(u.userId));
    }

    /**
     * Formats Duolingo avatar URL with HTTPS and proper size
     * @param {string} url - Original URL (may start with //)
     * @param {string} [size='medium'] - Size suffix (small/medium/large)
     * @returns {string} Formatted URL
     */
    function formatAvatarUrl(url, size = 'medium') {
        if (!url) return chrome.runtime.getURL('icons/icon48.png');

        // Handle protocol-relative URLs
        const secureUrl = url.startsWith('//') ? `https:${url}` : url;

        // Skip if already has a size suffix
        if (/\/(small|medium|large)(\/|$)/.test(secureUrl)) {
            return secureUrl;
        }

        // Add size suffix to ALL avatar URLs (both SSR and default)
        if (secureUrl.includes('duolingo.com')) {
            return `${secureUrl}/${size}`;
        }

        return secureUrl;
    }

    /**
     * Displays basic profile information
     * @param {Object} user - User data object
     */
    function displayProfileInfo(user) {
        document.getElementById('profile-pic').src = formatAvatarUrl(user.picture);
        document.getElementById('display-name').textContent = user.name;
        document.getElementById('username-display').textContent = `${user.username}`;
    }

    /**
     * Updates the statistics display
     * @param {number} totalXp - User's total XP
     * @param {number} followersCount - Number of followers
     * @param {number} followingCount - Number of users being followed
     * @param {number} nonFollowersCount - Count of non-reciprocal follows (following but not followed back)
     */
    function updateStats(totalXp, followersCount, followingCount, nonFollowersCount) {
        document.getElementById('total-xp').textContent = totalXp.toLocaleString();
        document.getElementById('followers-count').textContent = followersCount;
        document.getElementById('following-count').textContent = followingCount;
        document.getElementById('non-followers').textContent = nonFollowersCount;
    }

    /**
     * Displays non-followers or hides section if empty
     * @param {Array} nonFollowers - Array of non-follower users
     */
    function displayNonFollowers(nonFollowers) {
        const nonFollowersSection = document.querySelector('.non-followers-list');
        const listElement = document.getElementById('non-followers-list');

        // Clear existing list
        listElement.innerHTML = '';

        if (nonFollowers.length === 0) {
            // Hide entire section if no non-followers
            nonFollowersSection.classList.add('hidden');
        } else {
            // Show section and populate list
            nonFollowersSection.classList.remove('hidden');

            nonFollowers.forEach(user => {
                const li = document.createElement('li');
                const formattedUrl = formatAvatarUrl(user.picture);

                li.innerHTML = `
                    <img src="${formattedUrl}" alt="${user.username}">
                    <div>
                        <strong><a href="https://www.duolingo.com/profile/${user.username}" 
                                  target="_blank" 
                                  class="username-link">${user.username}</a></strong>
                        <div>${user.totalXp ? user.totalXp.toLocaleString() + ' XP' : ''}</div>
                    </div>
                `;

                listElement.appendChild(li);
            });
        }
    }

    // UI Helper Functions
    function resetUI() {
        hideError();
        hideResults();
    }

    function showLoading() {
        loadingDiv.classList.remove('hidden');
    }

    function hideLoading() {
        loadingDiv.classList.add('hidden');
    }

    function showResults() {
        resultsDiv.classList.remove('hidden');
    }

    function hideResults() {
        resultsDiv.classList.add('hidden');
    }

    function showError(message) {
        errorDiv.textContent = message;
        errorDiv.classList.remove('hidden');
    }

    function hideError() {
        errorDiv.classList.add('hidden');
    }
});