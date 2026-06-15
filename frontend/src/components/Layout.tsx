import Header from './Header';
import Footer from './Footer';
import BottomNav from './BottomNav';
import InstallPrompt from './InstallPrompt';

interface LayoutProps {
    children: React.ReactNode;
    showHeader?: boolean;
    showFooter?: boolean;
    className?: string;
}

export default function Layout({
    children,
    showHeader = true,
    showFooter = true,
    className = ''
}: LayoutProps) {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

    return (
        <div className={`min-h-screen bg-cream text-ink transition-colors duration-300 font-sans flex flex-col pb-[80px] md:pb-0 ${className}`}>
            {showHeader && <Header />}
            <main className="flex-1">
                {children}
            </main>
            {showFooter && <Footer />}
            
            {/* Mobile Bottom Navigation */}
            {token && <BottomNav />}
        </div>
    );
}
