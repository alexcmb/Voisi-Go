import webpush from 'web-push';

const PUBLIC = process.env.VAPID_PUBLIC_KEY;
const PRIVATE = process.env.VAPID_PRIVATE_KEY;
const SUBJECT = process.env.VAPID_SUBJECT || 'mailto:support@voisigo.fr';

let configured = false;

if (PUBLIC && PRIVATE) {
    try {
        webpush.setVapidDetails(SUBJECT, PUBLIC, PRIVATE);
        configured = true;
    } catch (e) {
        console.warn('⚠️  Clés VAPID invalides — notifications push désactivées.', e);
    }
} else {
    console.warn('⚠️  VAPID_PUBLIC_KEY / VAPID_PRIVATE_KEY absents — notifications push désactivées.');
}

export const pushEnabled = (): boolean => configured;

export const getVapidPublicKey = (): string | null => (configured ? PUBLIC! : null);

export interface WebPushSubscription {
    endpoint: string;
    keys: { p256dh: string; auth: string };
}

/**
 * Envoie une notification push à UN abonnement.
 * Lève l'erreur web-push (avec statusCode) pour que l'appelant puisse
 * purger les abonnements expirés (404 / 410).
 */
export async function sendPush(sub: WebPushSubscription, payload: object): Promise<void> {
    if (!configured) return;
    await webpush.sendNotification(
        { endpoint: sub.endpoint, keys: sub.keys },
        JSON.stringify(payload)
    );
}
