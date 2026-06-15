import { useCallback, useEffect, useState } from 'react';
import { apiFetch } from '../lib/api';

function urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const raw = atob(base64);
    const arr = new Uint8Array(raw.length);
    for (let i = 0; i < raw.length; i++) arr[i] = raw.charCodeAt(i);
    return arr;
}

export type PushStatus = 'unsupported' | 'denied' | 'subscribed' | 'unsubscribed';

interface VapidInfo {
    publicKey: string | null;
    enabled: boolean;
}

export function usePush() {
    const supported =
        typeof window !== 'undefined' &&
        'serviceWorker' in navigator &&
        'PushManager' in window &&
        'Notification' in window;

    const [status, setStatus] = useState<PushStatus>(supported ? 'unsubscribed' : 'unsupported');
    const [serverEnabled, setServerEnabled] = useState<boolean | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!supported) return;
        let cancelled = false;

        apiFetch<VapidInfo>('/api/push/vapid-public-key')
            .then((r) => { if (!cancelled) setServerEnabled(r.enabled); })
            .catch(() => { if (!cancelled) setServerEnabled(false); });

        navigator.serviceWorker.ready
            .then(async (reg) => {
                const sub = await reg.pushManager.getSubscription();
                if (cancelled) return;
                if (Notification.permission === 'denied') setStatus('denied');
                else setStatus(sub ? 'subscribed' : 'unsubscribed');
            })
            .catch(() => {});

        return () => { cancelled = true; };
    }, [supported]);

    const subscribe = useCallback(async () => {
        if (!supported) return;
        setLoading(true);
        setError(null);
        try {
            const { publicKey, enabled } = await apiFetch<VapidInfo>('/api/push/vapid-public-key');
            if (!enabled || !publicKey) throw new Error('Notifications non configurées côté serveur.');

            const permission = await Notification.requestPermission();
            if (permission !== 'granted') {
                setStatus(permission === 'denied' ? 'denied' : 'unsubscribed');
                return;
            }

            const reg = await navigator.serviceWorker.ready;
            const sub = await reg.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: urlBase64ToUint8Array(publicKey) as BufferSource,
            });

            const json = sub.toJSON();
            await apiFetch('/api/push/subscribe', {
                method: 'POST',
                body: JSON.stringify({ endpoint: sub.endpoint, keys: json.keys }),
            });
            setStatus('subscribed');
        } catch (e: any) {
            setError(e?.message || 'Impossible d\'activer les notifications.');
        } finally {
            setLoading(false);
        }
    }, [supported]);

    const unsubscribe = useCallback(async () => {
        if (!supported) return;
        setLoading(true);
        setError(null);
        try {
            const reg = await navigator.serviceWorker.ready;
            const sub = await reg.pushManager.getSubscription();
            if (sub) {
                await apiFetch('/api/push/unsubscribe', {
                    method: 'POST',
                    body: JSON.stringify({ endpoint: sub.endpoint }),
                }).catch(() => {});
                await sub.unsubscribe();
            }
            setStatus('unsubscribed');
        } catch (e: any) {
            setError(e?.message || 'Impossible de désactiver les notifications.');
        } finally {
            setLoading(false);
        }
    }, [supported]);

    return { supported, serverEnabled, status, loading, error, subscribe, unsubscribe };
}
