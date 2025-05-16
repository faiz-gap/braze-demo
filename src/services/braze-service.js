// src/services/braze-service.js
import * as braze from '@braze/web-sdk';

console.debug('[BrazeService] Module loaded. Using @braze/web-sdk package.');

const BrazeService = {
    apiKey: null,
    sdkEndpoint: null,
    isInitialized: false,

    async _fetchConfig() {
        console.debug('[BrazeService-_fetchConfig] Starting to fetch Braze config from /api/braze-config.');
        try {
            const response = await fetch('/api/braze-config');
            console.debug(`[BrazeService-_fetchConfig] Response status: ${response.status}`);
            if (!response.ok) {
                let errorData;
                try {
                    errorData = await response.json();
                } catch (e) {
                    const textError = await response.text();
                    errorData = { error: `Non-JSON error response: ${textError}` };
                }
                throw new Error(errorData.error || `Failed to fetch Braze config: ${response.status}`);
            }
            const config = await response.json();
            console.debug('[BrazeService-_fetchConfig] Raw config received:', config);
            if (config.success) {
                this.apiKey = config.apiKey;
                this.sdkEndpoint = config.sdkEndpoint;
                console.log(`[BrazeService-_fetchConfig] Braze config fetched successfully. API Key: ${this.apiKey ? 'SET' : 'NOT SET'}, SDK Endpoint: ${this.sdkEndpoint}`);
            } else {
                throw new Error(config.error || "Failed to retrieve Braze config from server.");
            }
        } catch (error) {
            console.error('[BrazeService-_fetchConfig] Error fetching Braze config:', error.message);
            this.apiKey = null;
            this.sdkEndpoint = null;
            throw error;
        }
    },

    async initialize() {
        console.debug('[BrazeService-initialize] Starting initialization with @braze/web-sdk package.');
        if (this.isInitialized) {
            console.log("[BrazeService-initialize] Braze already initialized. Skipping.");
            return true;
        }

        try {
            await this._fetchConfig();
        } catch (error) {
            console.error('[BrazeService-initialize] Failed to fetch config, cannot initialize Braze.', error.message);
            this.isInitialized = false;
            return false;
        }

        if (this.apiKey && this.sdkEndpoint) {
            console.debug(`[BrazeService-initialize] API Key and SDK Endpoint are available.`);
            const brazeOptions = {
                baseUrl: this.sdkEndpoint,
                enableLogging: true,
            };
            console.debug('[BrazeService-initialize] Options for braze.initialize:', JSON.stringify(brazeOptions));

            try {
                braze.initialize(this.apiKey, brazeOptions);
                console.log('[BrazeService-initialize] braze.initialize called.');

                // According to docs, subscribe *before* openSession for initial fetch
                // However, we do this in DashboardPage to manage state and unsubscription.
                // openSession will trigger an initial fetch if a subscription exists.

                braze.openSession();
                console.log('[BrazeService-initialize] braze.openSession called.');
                
                this.isInitialized = true;
                console.log('Braze SDK Initialized by BrazeService using @braze/web-sdk.');

                setTimeout(() => {
                    const user = braze.getUser();
                    if (user && typeof user.getUserId === 'function') {
                         console.debug(`[BrazeService-initialize] Current Braze User ID after init: ${user.getUserId()}`);
                    }
                }, 500);

                return true;
            } catch (error) {
                console.error('[BrazeService-initialize] Error during braze.initialize or openSession:', error);
                this.isInitialized = false;
                return false;
            }
        } else {
            console.warn('[BrazeService-initialize] Braze API Key or SDK Endpoint not available. Braze initialization skipped.');
            this.isInitialized = false;
            return false;
        }
    },

    changeUser(userId, attributes = {}) {
        console.debug(`[BrazeService-changeUser] User: ${userId}, Attrs:`, attributes);
        if (!this.isInitialized) {
            console.warn("[BrazeService-changeUser] Braze not initialized.");
            return;
        }
        if (!userId) {
            console.warn("[BrazeService-changeUser] userId is required.");
            return;
        }
        try {
            braze.changeUser(userId);
            const userToModify = braze.getUser();
            if (!userToModify) {
                console.error("[BrazeService-changeUser] braze.getUser() returned null after changeUser.");
                return;
            }
            for (const key in attributes) {
                if (Object.prototype.hasOwnProperty.call(attributes, key)) {
                    const value = attributes[key];
                    if (value === null || typeof value === 'undefined') continue;
                    switch (key.toLowerCase()) {
                        case 'firstname': case 'first_name': userToModify.setFirstName(value); break;
                        case 'lastname': case 'last_name': userToModify.setLastName(value); break;
                        case 'email': userToModify.setEmail(value); break;
                        default: userToModify.setCustomUserAttribute(key, value); break;
                    }
                }
            }
            console.log('[BrazeService-changeUser] User change and attributes queued.');
        } catch (error) {
            console.error('[BrazeService-changeUser] Error:', error);
        }
    },

    logCustomEvent(eventName, eventProperties = {}) {
        if (!this.isInitialized || !eventName) {
            console.warn("[BrazeService-logCustomEvent] Not initialized or eventName missing.");
            return;
        }
        try {
            braze.logCustomEvent(eventName, eventProperties);
            console.log(`[BrazeService-logCustomEvent] Event '${eventName}' queued.`);
        } catch (error) {
            console.error('[BrazeService-logCustomEvent] Error:', error);
        }
    },

    logOutUser() {
        if (!this.isInitialized) {
            console.warn("[BrazeService-logOutUser] Braze not initialized.");
            return;
        }
        try {
            // The `@braze/web-sdk` typings and common practice suggest `braze.request डाटाFlush()` followed by
            // app-level logic to clear user state. An explicit `braze.logOut()` is not consistently documented for web SDK v4+.
            // `braze.wipeData()` is more for GDPR/data deletion and logs out the user.
            // For a simple logout, changing to an anonymous user or just clearing local state is often enough.
            // Let's try to see if wipeData is what we want for a "full" logout from Braze's perspective.
            // If wipeData is too destructive (e.g., you want to retain anonymous tracking),
            // then you would simply clear your app's local session and on next login, `changeUser` again.
            if (typeof braze.wipeData === 'function') {
                console.log('[BrazeService-logOutUser] Calling braze.wipeData() for logout.');
                braze.wipeData(); // This will effectively log the user out and clear Braze data for them.
            } else if (typeof braze.logOut === 'function') { // Check if logOut exists after all
                console.log('[BrazeService-logOutUser] Calling braze.logOut().');
                braze.logOut();
            }
            else {
                 console.warn('[BrazeService-logOutUser] Neither braze.wipeData() nor braze.logOut() found. Logout on Braze might not be fully complete. App should clear local session.');
            }
            // braze.requestImmediateDataFlush(); // Good to call to send pending events
        } catch (error) {
            console.error('[BrazeService-logOutUser] Error:', error);
        }
    },

    subscribeToContentCardsUpdates(callback) {
        if (!this.isInitialized) {
            console.warn("[BrazeService-subscribeToContentCardsUpdates] Braze not initialized.");
            return () => {}; 
        }
        try {
            return braze.subscribeToContentCardsUpdates(callback);
        } catch (error) {
            console.error('[BrazeService-subscribeToContentCardsUpdates] Error:', error);
            return () => {};
        }
    },

    requestContentCardsRefresh() {
        if (!this.isInitialized) {
            console.warn("[BrazeService-requestContentCardsRefresh] Braze not initialized.");
            return;
        }
        try {
            braze.requestContentCardsRefresh();
            console.log('[BrazeService] Requested Content Cards refresh.');
        } catch (error) {
            console.error('[BrazeService-requestContentCardsRefresh] Error:', error);
        }
    },
    
    logContentCardImpression(cardObject) { // Takes a single card object
        if (!this.isInitialized || !cardObject || !cardObject.id) {
            console.warn("[BrazeService-logContentCardImpression] Not initialized or card/card.id missing.", cardObject);
            return;
        }
        try {
            // Documentation indicates logContentCardImpressions (plural) takes an array.
            // If logging a single impression, wrap the card in an array.
            if (typeof braze.logContentCardImpressions === 'function') { // Note the 's'
                braze.logContentCardImpressions([cardObject]);
                console.log(`[BrazeService] Logged impression for Card ID: ${cardObject.id}`);
            } else {
                console.warn("[BrazeService-logContentCardImpression] braze.logContentCardImpressions is not a function.");
            }
        } catch (error) {
            console.error('[BrazeService-logContentCardImpression] Error:', error);
        }
    },

    logContentCardClick(cardObject) { // Takes a single card object
        if (!this.isInitialized || !cardObject || !cardObject.id) {
             console.warn("[BrazeService-logContentCardClick] Not initialized or card/card.id missing.", cardObject);
            return;
        }
        try {
            if (typeof braze.logContentCardClick === 'function') {
                braze.logContentCardClick(cardObject); // This seems correct as per your docs
                console.log(`[BrazeService] Logged click for Card ID: ${cardObject.id}`);
            } else {
                console.warn("[BrazeService-logContentCardClick] braze.logContentCardClick is not a function.");
            }
        } catch (error) {
            console.error('[BrazeService-logContentCardClick] Error:', error);
        }
    },

    getCachedContentCards() {
        if (!this.isInitialized) {
            console.warn("[BrazeService-getCachedContentCards] Braze not initialized.");
            return { cards: [] }; // Return an empty array structure
        }
        try {
            const result = braze.getCachedContentCards();
            return result || { cards: [] }; // Ensure it returns an object with a cards array
        } catch (error) {
            console.error('[BrazeService-getCachedContentCards] Error:', error);
            return { cards: [] };
        }
    }
};

export default BrazeService;