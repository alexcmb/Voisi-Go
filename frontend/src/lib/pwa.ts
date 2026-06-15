/* Enregistrement du service worker (PWA + push) */
export function registerServiceWorker() {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return;

    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').catch((err) => {
            console.warn('Échec de l\'enregistrement du service worker :', err);
        });
    });
}
