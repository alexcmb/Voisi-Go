import { describe, it, expect } from 'vitest';
import { pushEnabled, getVapidPublicKey, sendPush } from './push';

describe('push (configuration VAPID)', () => {
    it('cohérence entre pushEnabled() et getVapidPublicKey()', () => {
        if (pushEnabled()) {
            expect(typeof getVapidPublicKey()).toBe('string');
        } else {
            expect(getVapidPublicKey()).toBeNull();
        }
    });

    it('sendPush() est un no-op silencieux quand le push est désactivé', async () => {
        if (!pushEnabled()) {
            await expect(
                sendPush(
                    { endpoint: 'https://example.com/endpoint', keys: { p256dh: 'x', auth: 'y' } },
                    { title: 'Test', body: 'Test' }
                )
            ).resolves.toBeUndefined();
        }
    });
});
