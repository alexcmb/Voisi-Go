import { useEffect, useRef, useState, type ReactNode } from 'react';

interface RevealProps {
    children: ReactNode;
    className?: string;
    /** Décalage d'apparition en ms (pour les effets en cascade). */
    delay?: number;
    /** Durée du fondu en ms (par défaut 1800). */
    duration?: number;
}

/**
 * Fond enchaîné au scroll : le contenu apparaît (fondu + glissement + zoom)
 * quand il entre dans le viewport, et redisparaît quand il en sort — dans les
 * deux sens. Styles inline (fiables, non purgeables). En mode "animations
 * réduites", on garde le fondu seul (sans mouvement ni zoom).
 */
export default function Reveal({ children, className = '', delay = 0, duration = 1800 }: RevealProps) {
    const ref = useRef<HTMLDivElement>(null);
    const [visible, setVisible] = useState(false);
    const [reduced, setReduced] = useState(false);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;

        setReduced(window.matchMedia('(prefers-reduced-motion: reduce)').matches);

        if (typeof IntersectionObserver === 'undefined') {
            setVisible(true);
            return;
        }

        const observer = new IntersectionObserver(
            (entries) => {
                for (const entry of entries) {
                    // bidirectionnel : visible à l'entrée, masqué à la sortie
                    setVisible(entry.isIntersecting);
                }
            },
            // marge faible : le contenu reste visible plus longtemps et ne se
            // fond qu'au tout bord du viewport
            { threshold: 0, rootMargin: '-4% 0px -4% 0px' }
        );

        observer.observe(el);
        return () => observer.disconnect();
    }, []);

    const ease = 'cubic-bezier(0.22, 1, 0.36, 1)';

    return (
        <div
            ref={ref}
            className={className}
            style={{
                opacity: visible ? 1 : 0,
                transform: visible || reduced ? 'none' : 'translateY(1.5rem) scale(0.92)',
                transition: `opacity ${duration}ms ${ease}, transform ${duration}ms ${ease}`,
                transitionDelay: delay + 'ms',
                willChange: 'opacity, transform',
            }}
        >
            {children}
        </div>
    );
}
