import { createContext, useContext, useEffect, useState } from 'react';

export type TextSize = 'normal' | 'large' | 'xlarge';

interface AccessibilityContextType {
    textSize: TextSize;
    setTextSize: (size: TextSize) => void;
}

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined);

export function AccessibilityProvider({ children }: { children: React.ReactNode }) {
    const [textSize, setTextSizeState] = useState<TextSize>(() => {
        const saved = localStorage.getItem('textSize');
        if (saved === 'normal' || saved === 'large' || saved === 'xlarge') return saved;
        return 'normal';
    });

    const setTextSize = (size: TextSize) => {
        setTextSizeState(size);
        localStorage.setItem('textSize', size);
    };

    useEffect(() => {
        const root = document.documentElement;
        // Remove existing text classes
        root.classList.remove('ts-normal', 'ts-large', 'ts-xlarge');
        // Add current text class
        root.classList.add(`ts-${textSize}`);
    }, [textSize]);

    return (
        <AccessibilityContext.Provider value={{ textSize, setTextSize }}>
            {children}
        </AccessibilityContext.Provider>
    );
}

export function useAccessibility() {
    const context = useContext(AccessibilityContext);
    if (!context) {
        throw new Error('useAccessibility must be used within an AccessibilityProvider');
    }
    return context;
}
