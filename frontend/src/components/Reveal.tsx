import { useEffect, useRef, useState, type ReactNode } from 'react';

interface RevealProps {
    children: ReactNode;
    className?: string;
    /** Décalage d'apparition en ms (pour les effets en cascade). */
    delay?: number;
}

/**
 * Révèle son contenu (fondu + léger glissement) lorsqu'il entre dans le viewport,
 * via IntersectionObserver (pas de listener scroll). Respecte prefers-reduced-motion.
 */
export default function Reveal({ children, className = '', delay = 0 }: RevealProps) {
    const ref = useRef<HTMLDivElement>(null);
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;

        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
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
            { threshold: 0.15, rootMargin: '0px 0px -8% 0px' }
        );

        observer.observe(el);
        return () => observer.disconnect();
    }, []);

    return (
        <div
            ref={ref}
            style={{ transitionDelay: `${delay}ms` }}
            className={`transition-all duration-700 ease-out motion-reduce:transition-none motion-reduce:transform-none ${
                visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            } ${className}`}
        >
            {children}
        </div>
    );
}
