let isUnlocked = false;
let audioInstance: HTMLAudioElement | null = null;

// Initialisation de l'instance audio unique
if (typeof window !== 'undefined') {
    audioInstance = new Audio('/notification.m4a');
}

/**
 * Déverrouille l'audio sur les navigateurs mobiles et desktop en simulant
 * une brève lecture lors de la toute première interaction utilisateur.
 */
export const unlockAudio = () => {
    if (isUnlocked || !audioInstance) return;

    audioInstance.play()
        .then(() => {
            isUnlocked = true;
            audioInstance!.pause();
            audioInstance!.currentTime = 0;
            console.log("[Audio] Système audio déverrouillé avec succès !");
            removeUnlockListeners();
        })
        .catch((err) => {
            // Échoue normalement si l'interaction n'est pas qualifiée par le navigateur
            console.log("[Audio] Tentative de déverrouillage en attente d'interaction :", err.message);
        });
};

const handleUnlock = () => {
    unlockAudio();
};

const removeUnlockListeners = () => {
    if (typeof document !== 'undefined') {
        document.removeEventListener('click', handleUnlock);
        document.removeEventListener('touchstart', handleUnlock);
        document.removeEventListener('keydown', handleUnlock);
    }
};

// Enregistrement des écouteurs pour capter le premier geste utilisateur
if (typeof window !== 'undefined' && typeof document !== 'undefined') {
    document.addEventListener('click', handleUnlock, { once: true });
    document.addEventListener('touchstart', handleUnlock, { once: true });
    document.addEventListener('keydown', handleUnlock, { once: true });
}

/**
 * Joue le son de notification. L'utilisation d'une instance unique et
 * pré-déverrouillée évite les blocages d'autoplay des navigateurs mobiles (iOS/Android).
 */
export const playNotificationSound = () => {
    try {
        if (!audioInstance) {
            audioInstance = new Audio('/notification.m4a');
        }

        // Réinitialise la lecture si le son est déjà en train de jouer
        audioInstance.currentTime = 0;

        audioInstance.play().catch((err) => {
            console.warn("[Audio] La lecture automatique du son de notification a été bloquée par le navigateur :", err.message);
        });
    } catch (e) {
        console.error("[Audio] Erreur lors de la lecture audio :", e);
    }
};
