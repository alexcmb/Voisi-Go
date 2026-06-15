import { Response } from 'express';
import { z } from 'zod';
import { AuthRequest } from '../middleware/auth.middleware';
import { getVapidPublicKey, pushEnabled, sendPush } from '../utils/push';
import {
    savePushSubscription,
    deleteSubscriptionByEndpoint,
    getPushSubscriptionsForUser,
} from '../utils/db';

const subscriptionSchema = z.object({
    endpoint: z.string().url(),
    keys: z.object({
        p256dh: z.string().min(1),
        auth: z.string().min(1),
    }),
});

// GET /api/push/vapid-public-key — clé publique pour l'abonnement côté front
export const vapidPublicKey = (_req: AuthRequest, res: Response) => {
    res.json({ publicKey: getVapidPublicKey(), enabled: pushEnabled() });
};

// POST /api/push/subscribe — enregistre l'abonnement de l'utilisateur courant
export const subscribe = async (req: AuthRequest, res: Response) => {
    try {
        if (!req.user) {
            res.status(401).json({ message: 'Unauthorized' });
            return;
        }
        const sub = subscriptionSchema.parse(req.body);
        await savePushSubscription(req.user.userId, {
            endpoint: sub.endpoint,
            p256dh: sub.keys.p256dh,
            auth: sub.keys.auth,
        });
        res.status(201).json({ message: 'Abonnement enregistré' });
    } catch (error: any) {
        res.status(400).json({ message: error.message || 'Validation error' });
    }
};

// POST /api/push/unsubscribe — supprime un abonnement par endpoint
export const unsubscribe = async (req: AuthRequest, res: Response) => {
    try {
        if (!req.user) {
            res.status(401).json({ message: 'Unauthorized' });
            return;
        }
        const { endpoint } = z.object({ endpoint: z.string().min(1) }).parse(req.body);
        await deleteSubscriptionByEndpoint(endpoint);
        res.json({ message: 'Désabonné' });
    } catch (error: any) {
        res.status(400).json({ message: error.message || 'Validation error' });
    }
};

// POST /api/push/test — envoie une notification de test à l'utilisateur courant
export const sendTest = async (req: AuthRequest, res: Response) => {
    if (!req.user) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
    }
    if (!pushEnabled()) {
        res.status(503).json({ message: 'Notifications push non configurées côté serveur' });
        return;
    }
    const subs = await getPushSubscriptionsForUser(req.user.userId);
    if (subs.length === 0) {
        res.status(404).json({ message: 'Aucun appareil abonné' });
        return;
    }
    const payload = {
        title: 'VoisiGo',
        body: 'Notification de test reçue.',
        url: '/dashboard',
        tag: 'test',
    };
    let sent = 0;
    await Promise.all(
        subs.map(async (s) => {
            try {
                await sendPush({ endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } }, payload);
                sent++;
            } catch (err: any) {
                if (err?.statusCode === 404 || err?.statusCode === 410) {
                    await deleteSubscriptionByEndpoint(s.endpoint);
                }
            }
        })
    );
    res.json({ message: `Notification de test envoyée à ${sent} appareil(s)` });
};
