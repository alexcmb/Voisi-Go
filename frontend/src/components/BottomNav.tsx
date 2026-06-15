import { Link, useLocation } from 'react-router-dom';
import Icon from './Icon';

export default function BottomNav() {
    const location = useLocation();
    const token = localStorage.getItem('token');

    if (!token) return null;

    const navItems = [
        { path: '/explore', icon: 'search' as const, label: 'Explorer' },
        { path: '/trips', icon: 'car' as const, label: 'Trajets' },
        { path: '/services', icon: 'hands' as const, label: 'Services' },
        { path: '/messages', icon: 'message' as const, label: 'Messages' },
        { path: '/profile', icon: 'user' as const, label: 'Profil' },
    ];

    return (
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-paper/90 backdrop-blur-md border-t border-ink/8 pb-safe shadow-[0_-4px_20px_rgba(0,0,0,0.02)]">
            <nav className="flex justify-around items-center h-[68px] px-2">
                {navItems.map((item) => {
                    const isActive = location.pathname.startsWith(item.path);
                    return (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`flex flex-col items-center justify-center w-16 h-full gap-1 transition-all duration-300 ${
                                isActive ? 'text-primary-600 scale-105' : 'text-ink/40 hover:text-ink/70'
                            }`}
                        >
                            <div className={`relative flex items-center justify-center transition-all duration-300 ${isActive ? 'translate-y-[-2px]' : ''}`}>
                                <Icon name={item.icon} size={24} />
                                {isActive && (
                                    <span className="absolute -bottom-2 w-1 h-1 rounded-full bg-primary-600 animate-slideUp" />
                                )}
                            </div>
                            <span className={`text-[10px] font-semibold tracking-wide transition-colors ${
                                isActive ? 'text-primary-700 font-bold' : ''
                            }`}>
                                {item.label}
                            </span>
                        </Link>
                    );
                })}
            </nav>
        </div>
    );
}
