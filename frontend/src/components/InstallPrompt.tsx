import { useState, useEffect } from 'react';
import Icon from './Icon';

// Extend the window object for beforeinstallprompt
interface BeforeInstallPromptEvent extends Event {
    prompt: () => Promise<void>;
    userChoice: Promise<{ outcome: 'accepted' | 'dismissed', platform: string }>;
}

export default function InstallPrompt() {
    const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
    const [showPrompt, setShowPrompt] = useState(false);

    useEffect(() => {
        // Check if user already dismissed or installed
        const hasDismissed = localStorage.getItem('pwa_prompt_dismissed');
        
        const handleBeforeInstallPrompt = (e: Event) => {
            e.preventDefault();
            // Stash the event so it can be triggered later.
            setDeferredPrompt(e as BeforeInstallPromptEvent);
            
            if (!hasDismissed) {
                // Show the prompt with a slight delay for better UX
                setTimeout(() => setShowPrompt(true), 2000);
            }
        };

        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

        // Also handle successful installation
        const handleAppInstalled = () => {
            setShowPrompt(false);
            setDeferredPrompt(null);
        };
        window.addEventListener('appinstalled', handleAppInstalled);

        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
            window.removeEventListener('appinstalled', handleAppInstalled);
        };
    }, []);

    const handleInstallClick = async () => {
        if (!deferredPrompt) return;
        
        // Show the native install prompt
        deferredPrompt.prompt();
        
        // Wait for the user to respond
        const { outcome } = await deferredPrompt.userChoice;
        
        if (outcome === 'accepted') {
            setShowPrompt(false);
        } else {
            // User dismissed the native prompt
            handleDismiss();
        }
        
        setDeferredPrompt(null);
    };

    const handleDismiss = () => {
        setShowPrompt(false);
        localStorage.setItem('pwa_prompt_dismissed', 'true');
    };

    if (!showPrompt) return null;

    return (
        <div className="fixed bottom-20 md:bottom-6 left-4 right-4 md:left-auto md:right-6 md:w-96 bg-paper rounded-2xl shadow-card border border-ink/10 p-5 z-[60] animate-slideUp">
            <div className="flex items-start gap-4">
                <div className="w-12 h-12 flex-shrink-0 bg-primary-100 text-primary-600 rounded-xl flex items-center justify-center">
                    <Icon name="sparkle" size={24} />
                </div>
                <div className="flex-1">
                    <h3 className="font-display font-semibold text-ink text-lg">Installer VoisiGo</h3>
                    <p className="text-ink/60 text-sm mt-1 leading-snug">
                        Ajoutez l'application sur votre écran d'accueil pour un accès plus rapide.
                    </p>
                    <div className="flex gap-3 mt-4">
                        <button 
                            onClick={handleInstallClick}
                            className="bg-primary-600 text-paper font-bold py-2.5 px-4 rounded-xl text-sm hover:bg-primary-700 transition-colors flex-1"
                        >
                            Installer
                        </button>
                        <button 
                            onClick={handleDismiss}
                            className="bg-ink/5 text-ink/70 font-semibold py-2.5 px-4 rounded-xl text-sm hover:bg-ink/10 transition-colors"
                        >
                            Plus tard
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
