import { useState, useEffect, useRef } from 'react';

interface AnimatedCounterProps {
    value: string;
    duration?: number;
}

export default function AnimatedCounter({ value, duration = 1500 }: AnimatedCounterProps) {
    const [displayVal, setDisplayVal] = useState('0');
    const ref = useRef<HTMLSpanElement>(null);
    const hasAnimated = useRef(false);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;

        // Retire les espaces pour le parsing (ex: "1 300+" -> "1300+")
        const cleanString = value.replace(/\s/g, '');
        const numMatch = cleanString.match(/^(\d+)(.*)$/);
        
        if (!numMatch) {
            setDisplayVal(value);
            return;
        }

        const targetNum = parseInt(numMatch[1], 10);
        const suffix = numMatch[2] || '';

        // Fallback si IntersectionObserver n'est pas supporté
        if (typeof IntersectionObserver === 'undefined') {
            setDisplayVal(value);
            return;
        }

        const observer = new IntersectionObserver((entries) => {
            const entry = entries[0];
            if (entry.isIntersecting && !hasAnimated.current) {
                hasAnimated.current = true;
                
                let startTimestamp: number | null = null;
                const step = (timestamp: number) => {
                    if (!startTimestamp) startTimestamp = timestamp;
                    const progress = Math.min((timestamp - startTimestamp) / duration, 1);
                    
                    // Courbe ease-out quadratique
                    const easedProgress = progress * (2 - progress);
                    const currentNum = Math.floor(easedProgress * targetNum);
                    
                    // Formatage en français pour les milliers
                    const formattedNum = new Intl.NumberFormat('fr-FR').format(currentNum);
                    setDisplayVal(formattedNum + suffix);
                    
                    if (progress < 1) {
                        window.requestAnimationFrame(step);
                    }
                };
                window.requestAnimationFrame(step);
                observer.unobserve(el);
            }
        }, { threshold: 0.1 });

        observer.observe(el);
        return () => observer.disconnect();
    }, [value, duration]);

    return <span ref={ref}>{displayVal}</span>;
}
