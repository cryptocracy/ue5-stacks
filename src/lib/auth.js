import { showConnect, UserSession, AppConfig } from "@stacks/connect";
import axios from "axios";

export const appConfig = new AppConfig(["store_write", "publish_data"]);
export const userSession = new UserSession({ appConfig });
export const isAuthed = userSession?.isUserSignedIn();

function getPlatformName(urlString) {
    try {
        const { hostname } = new URL(urlString);

        // Split the domain into parts
        const parts = hostname.split('.');

        // Handle short domains like "x.com" → "x"
        if (parts.length === 2) return parts[0];

        // Handle subdomains: want subdomain + domain
        // e.g. discord.boostx.cc → discord.boostx
        // Take the last 3 parts and use the first of those as "subdomain"
        const tldParts = parts.slice(-2); // e.g. boostx.cc
        const domainParts = parts.slice(0, -2); // e.g. ["discord"]

        if (domainParts.length) {
            return `${domainParts.join('.')}.${tldParts[0]}`;
        }

        return tldParts[0]; // fallback to domain only
    } catch (err) {
        return "unknown";
    }
}

export const origin = getPlatformName(window.location.origin);

// HANDLES LOCALSTORAGE
export function saveToLocal(key, value) {
    if (!key) return;
    localStorage.setItem(key, value);
}
export function getFromLocal(key) {
    if (!key) return;
    return localStorage.getItem(key);
}
export function deleteFromLocal(key) {
    console.log({ key });
    if (!key) return;
    localStorage.removeItem(key);
}

export function getWalletToConnectProvider(key) {
    let provider;
    if (key === 'leather') {
        provider = window?.LeatherProvider;
    } else if (key === 'xverse') {
        provider = window?.XverseProviders?.StacksProvider;
    } else if (key === 'asigna') {
        provider = window?.AsignaProvider;
    }

    return provider;
}
export function getWalletConnectedProvider() {
    let provider;
    const localStoreKey = getFromLocal('provider');
    if (!localStoreKey) return '';

    if (localStoreKey === 'leather') {
        provider = window?.LeatherProvider;
    } else if (localStoreKey === 'xverse') {
        provider = window?.XverseProviders?.StacksProvider;
    } else if (localStoreKey === 'asigna') {
        provider = window?.AsignaProvider;
    }

    return provider;
}

/**
 * Checks if any Stacks wallet provider is available
 * @returns {boolean} True if any provider is available
 */
export function hasAnyProvider() {
    return !!(
        window?.StacksProvider ||
        window?.LeatherProvider ||
        window?.XverseProviders?.StacksProvider ||
        window?.AsignaProvider
    );
}

/**
 * Waits for a Stacks wallet provider to become available
 * @param {number} timeout - Maximum time to wait in milliseconds (default: 3000)
 * @param {number} interval - Polling interval in milliseconds (default: 100)
 * @returns {Promise<boolean>} Resolves to true if provider is found, false if timeout
 */
export function waitForProvider(timeout = 3000, interval = 100) {
    return new Promise((resolve) => {
        // Check immediately first
        if (hasAnyProvider()) {
            resolve(true);
            return;
        }

        const startTime = Date.now();
        const checkInterval = setInterval(() => {
            if (hasAnyProvider()) {
                clearInterval(checkInterval);
                resolve(true);
                return;
            }

            if (Date.now() - startTime >= timeout) {
                clearInterval(checkInterval);
                resolve(false);
                return;
            }
        }, interval);
    });
}

export function authenticate() {
    let data, isUserSignedIn, loadUserData;
    // HANDLES USER NOT AUTHED AND RETURNS THE SESSION
    if (!isAuthed) {
        showConnect({
            appDetails: {
                name: "BoostX",
                icon: window.location.origin + "/favicon.ico",
            },
            onFinish: () => {
                isUserSignedIn = userSession?.isUserSignedIn() || false;
                loadUserData = userSession?.loadUserData();
                data = JSON.stringify({
                    source: "boostx-cc",
                    action: "connect",
                    payload: {
                        origin, source: "boostx-cc", action: "connect",
                        userSession: {
                            origin,
                            isUserSignedIn: isUserSignedIn,
                            loadUserData: loadUserData,
                        }
                    }
                });
                
                let config = { method: 'post', maxBodyLength: Infinity, url: 'http://127.0.0.1:8080', headers: { 'Content-Type': 'application/json' }, data: data };
                axios.request(config)
                    .then((response) => {
                        console.log(JSON.stringify(response.data));
                    })
                    .catch((error) => {
                        console.log(error);
                    }).finally(() => {
                        console.log('done')
                        window.close();
                    });

            },
            userSession,
            redirectTo: "/"
        })
    } else {
        // HANDLES USER NOT AUTHED AND RETURNS THE SESSION      
        isUserSignedIn = userSession?.isUserSignedIn() || false;
        loadUserData = isUserSignedIn ? userSession?.loadUserData() : null;
        data = {
            source: "boostx-cc",
            action: "session",
            payload: {
                origin, source: "boostx-cc", action: "session", userSession: {
                    origin,
                    isUserSignedIn: isUserSignedIn,
                    loadUserData: loadUserData,
                }
            }
        }
        let config = { method: 'post', maxBodyLength: Infinity, url: 'http://127.0.0.1:8080', headers: { 'Content-Type': 'application/json' }, data: data };
        axios.request(config)
            .then((response) => {
                console.log(JSON.stringify(response.data));
            })
            .catch((error) => {
                console.log(error);
            }).finally(() => {
                console.log('done')
                // window.close();
            });
    }
}

export function deAuthenticate() {
    try {
        userSession?.signUserOut();
        const isUserSignedIn = false;
        const loadUserData = null;
        const data = {
            source: "boostx-cc",
            action: "disconnect",
            payload: {
                origin, source: "boostx-cc", action: "disconnect", userSession: {
                    origin,
                    isUserSignedIn: isUserSignedIn,
                    loadUserData: loadUserData,
                }
            }
        }
        let config = { method: 'post', maxBodyLength: Infinity, url: 'http://127.0.0.1:8080', headers: { 'Content-Type': 'application/json' }, data: data };
        axios.request(config)
            .then((response) => {
                console.log(JSON.stringify(response.data));
            })
            .catch((error) => {
                console.log(error);
            }).finally(() => {
                console.log('done')
                window.close();
            });
    } catch (error) {
        console.log({ error });
    }

}

export function getSession() {
    // HANDLES USER NOT AUTHED AND RETURNS THE SESSION      
    const isUserSignedIn = userSession?.isUserSignedIn() || false;
    const loadUserData = isUserSignedIn ? userSession?.loadUserData() : null;
    const data = {
        origin,
        isUserSignedIn: isUserSignedIn,
        loadUserData: loadUserData,
    }
    console.log({ data });
    window.postMessage({
        source: "boostx-cc",
        action: "session",
        payload: { origin, source: "boostx-cc", action: "session", userSession: data }
    }, "*");
    window.close();
}