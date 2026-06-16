import { useEffect, useRef, useState, type ReactNode } from 'react';

interface RevealProps {
    children: ReactNode;
    className?: string;
    /** Décalage d'apparition en ms (pour les effets en cascade). */
    delay?: number;
}

/**
 * Révèle son contenu (fondu + léger glissement) lorsqu'il entre dans le viewport,
 * via IntersectionObserver. Animation en styles inline (fiable, non purgeable).
 * En mode "animations réduites", on garde le fondu et on retire le glissement.
 */
export default function Reveal({ children, className = '', delay = 0 }: RevealProps) {
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
                    if (entry.isIntersecting) {
                        setVisible(true);
                        observer.unobserve(entry.target);
                    }
                }
            },
            { threshold: 0.1, rootMargin: '0px 0px -5% 0px' }
        );

        observer.observe(el);
        return () => observer.disconnect();
    }, []);

    return (
        <div
            ref={ref}
            className={className}
            style={{
                opacity: visible ? 1 : 0,
                transform: visible || reduced ? 'none' : 'translateY(2rem)',
                transition: 'opacity 700ms cubic-bezier(0.22, 1, 0.36, 1), transform 700ms cubic-bezier(0.22, 1, 0.36, 1)',
                transitionDelay: delay + 'ms',
                willChange: 'opacity, transform',
            }}
        >
            {children}
        </div>
    );
}
