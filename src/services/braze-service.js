// braze-service.js - CDN Version with Enhanced Debugging (for Braze SDK v5.x)
// This module wraps the global braze object from the CDN

console.debug('[BrazeService] Module loaded. Waiting for Braze SDK from CDN snippet.');

const waitForBraze = () => {
    console.debug('[BrazeService-waitForBraze] Starting to wait for window.braze.initialize.');
    return new Promise((resolve, reject) => {
        // The snippet creates window.braze and window.brazeQueue immediately.
        // We need to wait for the actual SDK to load and define window.braze.initialize.
        if (typeof window.braze !== 'undefined' && typeof window.braze.initialize === 'function') {
            console.debug('[BrazeService-waitForBraze] window.braze.initialize found immediately.');
            resolve();
        } else {
            let attempts = 0;
            const maxAttempts = 100; // Wait up to 10 seconds (increased a bit)
            const interval = 100; // ms
            console.debug(`[BrazeService-waitForBraze] window.braze.initialize not found. Checking every ${interval}ms for up to ${maxAttempts * interval / 1000}s.`);

            const checkInterval = setInterval(() => {
                attempts++;
                if (typeof window.braze !== 'undefined' && typeof window.braze.initialize === 'function') {
                    clearInterval(checkInterval);
                    console.debug(`[BrazeService-waitForBraze] window.braze.initialize found after ${attempts} attempts.`);
                    resolve();
                } else if (attempts >= maxAttempts) {
                    clearInterval(checkInterval);
                    console.error('[BrazeService-waitForBraze] Braze SDK (window.braze.initialize) failed to load after 10 seconds.');
                    reject(new Error('Braze SDK (window.braze.initialize) failed to load after 10 seconds.'));
                } else if (attempts % 20 === 0) { // Log every 2 seconds to reduce noise
                    console.debug(`[BrazeService-waitForBraze] Still waiting for window.braze.initialize (attempt ${attempts}/${maxAttempts}). Is window.braze defined? ${typeof window.braze !== 'undefined'}`);
                }
            }, interval);
        }
    });
};

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
                    console.debug('[BrazeService-_fetchConfig] Error response JSON:', errorData);
                } catch (e) {
                    console.debug('[BrazeService-_fetchConfig] Could not parse error response as JSON.');
                    const textError = await response.text(); // Get text for non-JSON errors
                    errorData = { error: `Non-JSON error response: ${textError}` }; // Store it
                }
                throw new Error(errorData.error || `Failed to fetch Braze config: ${response.status}`);
            }
            const config = await response.json();
            console.debug('[BrazeService-_fetchConfig] Raw config received:', config);
            if (config.success) {
                this.apiKey = config.apiKey;
                this.sdkEndpoint = config.sdkEndpoint; // e.g., sdk.fra-01.braze.eu
                console.log(`[BrazeService-_fetchConfig] Braze config fetched successfully. API Key: ${this.apiKey ? 'SET' : 'NOT SET'}, SDK Endpoint: ${this.sdkEndpoint}`);
            } else {
                throw new Error(config.error || "Failed to retrieve Braze config from server.");
            }
        } catch (error) {
            console.error('[BrazeService-_fetchConfig] Error fetching Braze config:', error.message);
            this.apiKey = null;
            this.sdkEndpoint = null;
        }
    },

    async initialize() {
        console.debug('[BrazeService-initialize] Starting initialization.');
        if (this.isInitialized) {
            console.log("[BrazeService-initialize] Braze already initialized. Skipping.");
            return true;
        }

        try {
            await waitForBraze();
        } catch (error) {
            console.error('[BrazeService-initialize] Failed waiting for Braze SDK:', error.message);
            this.isInitialized = false;
            return false;
        }

        if (!window.braze || typeof window.braze.initialize !== 'function') {
            console.error('[BrazeService-initialize] window.braze or window.braze.initialize is not available after waiting. Cannot initialize.');
            this.isInitialized = false;
            return false;
        }
        console.debug('[BrazeService-initialize] window.braze.initialize function is available.');

        await this._fetchConfig();

        if (this.apiKey && this.sdkEndpoint) {
            console.debug(`[BrazeService-initialize] API Key and SDK Endpoint are available. Proceeding with Braze SDK initialization.`);
            console.debug(`[BrazeService-initialize] Using API Key (first 5 chars): ${this.apiKey.substring(0, 5)}...`);
            console.debug(`[BrazeService-initialize] Using SDK Endpoint (baseUrl): ${this.sdkEndpoint}`);

            let cleanSdkEndpoint = this.sdkEndpoint.replace(/^https?:\/\//, '');
            if (cleanSdkEndpoint !== this.sdkEndpoint) {
                console.warn(`[BrazeService-initialize] Original sdkEndpoint "${this.sdkEndpoint}" was cleaned to "${cleanSdkEndpoint}" for Braze baseUrl.`);
            }

            const brazeOptions = {
                baseUrl: cleanSdkEndpoint,
                enableLogging: true,
                // allowUserSuppliedHtml: true, // REMOVED - Deprecated in SDK v4.0.0 (current is v5.x)
                // serviceWorkerLocation: '/service-worker.js' // Example: if you host a custom SW
            };
            console.debug('[BrazeService-initialize] Options for window.braze.initialize:', JSON.stringify(brazeOptions));

            try {
                window.braze.initialize(this.apiKey, brazeOptions);
                console.log('[BrazeService-initialize] window.braze.initialize called.');

                window.braze.openSession();
                console.log('[BrazeService-initialize] window.braze.openSession called.');

                this.isInitialized = true; 
                console.log('Braze SDK Initialized by BrazeService.');

                setTimeout(() => {
                    if (window.braze && typeof window.braze.getUser === 'function') {
                        const user = window.braze.getUser();
                        if (user && typeof user.getUserId === 'function') {
                             console.debug(`[BrazeService-initialize] Current Braze User ID after init and short delay: ${user.getUserId()}`);
                        } else {
                             console.warn('[BrazeService-initialize] user.getUserId() not available after init and short delay.');
                        }
                    } else {
                         console.warn('[BrazeService-initialize] window.braze.getUser() not available after init and short delay.');
                    }
                }, 500);

                return true;
            } catch (error) {
                console.error('[BrazeService-initialize] Error during window.braze.initialize or openSession:', error);
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
        console.debug(`[BrazeService-changeUser] Attempting to change user to ID: ${userId} with attributes:`, JSON.stringify(attributes));
        if (!this.isInitialized) {
            console.warn("[BrazeService-changeUser] Braze not initialized. Call BrazeService.initialize() first. User not changed.");
            return;
        }
        if (!userId) {
            console.warn("[BrazeService-changeUser] userId is required. User not changed.");
            return;
        }

        try {
            const brazeUser = window.braze.getUser(); 
            if (!brazeUser || typeof brazeUser.getUserId !== 'function') {
                console.error("[BrazeService-changeUser] window.braze.getUser() or getUserId not available. Cannot change user.");
                return;
            }
            
            console.debug(`[BrazeService-changeUser] Calling window.braze.changeUser('${userId}')`);
            window.braze.changeUser(userId); 

            const userToModify = window.braze.getUser(); 

            for (const key in attributes) {
                if (Object.prototype.hasOwnProperty.call(attributes, key)) {
                    const value = attributes[key];
                    switch (key.toLowerCase()) { 
                        case 'firstname':
                        case 'first_name':
                            userToModify.setFirstName(value);
                            console.debug(`[BrazeService-changeUser] setFirstName('${value}') called.`);
                            break;
                        case 'lastname':
                        case 'last_name':
                            userToModify.setLastName(value);
                            console.debug(`[BrazeService-changeUser] setLastName('${value}') called.`);
                            break;
                        case 'email':
                            userToModify.setEmail(value);
                            console.debug(`[BrazeService-changeUser] setEmail('${value}') called.`);
                            break;
                        default:
                            userToModify.setCustomUserAttribute(key, value);
                            console.debug(`[BrazeService-changeUser] setCustomUserAttribute('${key}', '${value}') called.`);
                            break;
                    }
                }
            }

            console.log('[BrazeService-changeUser] User change and attribute setting calls queued.');
            setTimeout(() => {
                if (window.braze && window.braze.getUser()) {
                    console.debug(`[BrazeService-changeUser] Braze User ID after ~500ms: ${window.braze.getUser().getUserId()}`);
                }
            }, 500);

        } catch (error) {
            console.error('[BrazeService-changeUser] Error in changeUser:', error);
        }
    },

    logCustomEvent(eventName, eventProperties = {}) {
        console.debug(`[BrazeService-logCustomEvent] Attempting to log event: '${eventName}' with properties:`, JSON.stringify(eventProperties));
        if (!this.isInitialized) {
            console.warn("[BrazeService-logCustomEvent] Braze not initialized. Event not logged.");
            return;
        }
        if (!eventName) {
            console.warn("[BrazeService-logCustomEvent] eventName is required. Event not logged.");
            return;
        }
        try {
            window.braze.logCustomEvent(eventName, eventProperties); 
            console.log(`[BrazeService-logCustomEvent] Custom event '${eventName}' logging call queued.`);
        } catch (error) {
            console.error('[BrazeService-logCustomEvent] Error logging custom event:', error);
        }
    },

    logOutUser() {
        console.debug('[BrazeService-logOutUser] Attempting to log out user from Braze.');
        if (!this.isInitialized) {
            console.warn("[BrazeService-logOutUser] Braze not initialized. Cannot log out Braze user.");
            return;
        }
        try {
            window.braze.logOut(); 
            console.log('[BrazeService-logOutUser] User logout call queued.');
            setTimeout(() => {
                 if (window.braze && window.braze.getUser()) {
                    console.debug(`[BrazeService-logOutUser] Braze User ID after logout call and ~500ms: ${window.braze.getUser().getUserId()}`);
                }
            }, 500);
        } catch (error) {
            console.error('[BrazeService-logOutUser] Error logging out Braze user:', error);
        }
    }
};

export default BrazeService;