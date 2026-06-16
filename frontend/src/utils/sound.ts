/**
 * Joue le son de notification de l'application (notification.m4a).
 */
export const playNotificationSound = () => {
    try {
        const audio = new Audio('/notification.m4a');
        audio.play().catch((err) => {
            // Les navigateurs bloquent la lecture tant que l'utilisateur n'a pas cliqué sur la page.
            console.warn("La lecture du son de notification a été reportée après interaction :", err.message);
        });
    } catch (e) {
        console.error("Erreur lors de l'initialisation audio :", e);
    }
};
