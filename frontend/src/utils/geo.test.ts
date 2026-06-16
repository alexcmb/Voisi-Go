import { describe, it, expect } from 'vitest';
import { calculateDistance } from './geo';

describe('calculateDistance (Haversine)', () => {
    it('renvoie 0 pour deux points identiques', () => {
        expect(calculateDistance(47.2173, -1.5534, 47.2173, -1.5534)).toBe(0);
    });

    it('estime une distance plausible Nantes Centre → Rezé (~3-6 km)', () => {
        const d = calculateDistance(47.2173, -1.5534, 47.1839, -1.5494);
        expect(d).toBeGreaterThan(3);
        expect(d).toBeLessThan(6);
    });

    it('est symétrique (A→B == B→A)', () => {
        const ab = calculateDistance(47.21, -1.55, 47.27, -1.62);
        const ba = calculateDistance(47.27, -1.62, 47.21, -1.55);
        expect(Math.abs(ab - ba)).toBeLessThan(1e-9);
    });
});
