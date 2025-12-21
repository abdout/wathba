// Fix for Node.js 21+ broken localStorage
// Node 21+ has experimental localStorage that breaks SSR when --localstorage-file is not properly configured

export async function register() {
    if (typeof globalThis.localStorage !== 'undefined') {
        // Check if localStorage.getItem is broken
        if (typeof globalThis.localStorage.getItem !== 'function') {
            // Replace with a working no-op implementation for SSR
            globalThis.localStorage = {
                getItem: () => null,
                setItem: () => {},
                removeItem: () => {},
                clear: () => {},
                key: () => null,
                length: 0
            };
        }
    }
}
