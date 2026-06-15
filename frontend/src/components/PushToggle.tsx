import { usePush } from '../hooks/usePush';
import Icon from './Icon';

/**
 * Carte d'activation des notifications push.
 * Masquée si le navigateur ne supporte pas le push ou si le serveur
 * n'a pas configuré les clés VAPID.
 */
export default function PushToggle({ className = '' }: { className?: string }) {
    const { supported, serverEnabled, status, loading, error, subscribe, unsubscribe } = usePush();

    if (!supported || serverEnabled === false) return null;

    const isOn = status === 'subscribed';
    const denied = status === 'denied';

    return (
        <div className={`surface-card rounded-2xl p-5 flex items-center gap-4 ${className}`}>
            <span className={`flex-shrink-0 w-11 h-11 rounded-xl flex items-center justify-center ${isOn ? 'bg-primary-600 text-paper' : 'bg-primary-50 text-primary-600'}`}>
                <Icon name="bell" size={22} />
            </span>

            <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-ink">Notifications push</h3>
                <p className="text-sm text-ink/60 leading-snug">
                    {denied
                        ? "Notifications bloquées. Autorisez-les dans les réglages de votre navigateur."
                        : isOn
                            ? "Activées sur cet appareil. Vous serez prévenu même l'app fermée."
                            : "Recevez les messages et réservations directement sur cet appareil."}
                </p>
                {error && <p className="text-sm text-accent-600 mt-1">{error}</p>}
            </div>

            {!denied && (
                <button
                    onClick={isOn ? unsubscribe : subscribe}
                    disabled={loading}
                    className={`flex-shrink-0 px-4 py-2.5 rounded-full text-sm font-bold transition-colors disabled:opacity-50 cursor-pointer ${
                        isOn
                            ? 'bg-transparent border border-ink/15 text-ink hover:bg-primary-50'
                            : 'bg-primary-600 text-paper hover:bg-primary-700'
                    }`}
                >
                    {loading ? '…' : isOn ? 'Désactiver' : 'Activer'}
                </button>
            )}
        </div>
    );
}
