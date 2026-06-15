import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../lib/api';
import type { AppNotification } from '../types';
import { useTheme } from '../context/ThemeContext';
import Icon, { type IconName } from './Icon';

export default function Header() {
    const navigate = useNavigate();
    const { theme, toggleTheme } = useTheme();
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const [unreadCount, setUnreadCount] = useState(0);
    const [notifications, setNotifications] = useState<AppNotification[]>([]);
    const [showNotifs, setShowNotifs] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setMobileOpen(false);
        navigate('/');
    };

    const closeMobile = () => setMobileOpen(false);

    // Poll unread count
    useEffect(() => {
        if (!token) return;
        const fetchCount = () => {
            fetch(`${API_BASE_URL}/api/notifications/unread-count`, {
                headers: { 'Authorization': `Bearer ${token}` },
            })
                .then(res => res.json())
                .then(data => setUnreadCount(data.unreadCount || 0))
                .catch(() => { });
        };
        fetchCount();
        const interval = setInterval(fetchCount, 15000);
        return () => clearInterval(interval);
    }, [token]);

    // Fetch full notifications when dropdown opens
    useEffect(() => {
        if (!showNotifs || !token) return;
        fetch(`${API_BASE_URL}/api/notifications`, {
            headers: { 'Authorization': `Bearer ${token}` },
        })
            .then(res => res.json())
            .then(data => {
                setNotifications(data.notifications || []);
                setUnreadCount(data.unreadCount || 0);
            })
            .catch(() => { });
    }, [showNotifs, token]);

    // Close notification dropdown on outside click
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setShowNotifs(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    // Close mobile menu on resize to desktop
    useEffect(() => {
        const handler = () => { if (window.innerWidth >= 768) setMobileOpen(false); };
        window.addEventListener('resize', handler);
        return () => window.removeEventListener('resize', handler);
    }, []);

    const handleNotifClick = async (notif: AppNotification) => {
        if (!notif.read) {
            await fetch(`${API_BASE_URL}/api/notifications/${notif.id}/read`, {
                method: 'PATCH',
                headers: { 'Authorization': `Bearer ${token}` },
            });
            setUnreadCount(prev => Math.max(0, prev - 1));
            setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, read: 1 } : n));
        }
        setShowNotifs(false);
        if (notif.type === 'new_message' && notif.relatedId) {
            navigate(`/messages/${notif.relatedId}`);
        } else if (
            ['new_booking_request', 'booking_cancelled', 'booking_approved', 'booking_rejected', 'trip_completed'].includes(notif.type) &&
            notif.relatedId
        ) {
            navigate(`/trips/${notif.relatedId}`);
        } else if (notif.type === 'new_review' || notif.type === 'review') {
            navigate('/profile');
        }
    };

    const markAllRead = async () => {
        await fetch(`${API_BASE_URL}/api/notifications/read-all`, {
            method: 'PATCH',
            headers: { 'Authorization': `Bearer ${token}` },
        });
        setUnreadCount(0);
        setNotifications(prev => prev.map(n => ({ ...n, read: 1 })));
    };

    const timeAgo = (dateStr: string) => {
        const diff = Date.now() - new Date(dateStr).getTime();
        const mins = Math.floor(diff / 60000);
        if (mins < 1) return 'à l\'instant';
        if (mins < 60) return `il y a ${mins}min`;
        const hours = Math.floor(mins / 60);
        if (hours < 24) return `il y a ${hours}h`;
        return `il y a ${Math.floor(hours / 24)}j`;
    };

    const notifIcon = (type: string): IconName => {
        switch (type) {
            case 'new_message':         return 'message';
            case 'new_booking_request': return 'ticket';
            case 'booking_approved':    return 'check';
            case 'booking_rejected':    return 'close';
            case 'booking_cancelled':   return 'close';
            case 'trip_completed':      return 'flag';
            case 'new_review':          return 'star';
            default:                    return 'bell';
        }
    };

    const navLink = "font-semibold text-ink/70 hover:text-primary-600 transition-colors";
    const iconBtn = "p-2 rounded-lg bg-paper text-ink/70 hover:text-primary-600 hover:bg-primary-50 transition-colors flex items-center justify-center border border-ink/8 cursor-pointer";

    return (
        <>
            {/* ── Barre supérieure ── */}
            <div className="w-full px-6 flex justify-between items-center py-4 mb-2 relative z-50">
                <Link
                    to={token ? '/dashboard' : '/'}
                    className="font-display text-2xl font-semibold tracking-tight text-ink hover:opacity-80 transition-opacity"
                >
                    Voisi<span className="text-primary-600">Go</span>
                </Link>

                {/* ── Nav desktop ── */}
                <div className="hidden md:flex gap-5 items-center">
                    <Link to="/explore" className={navLink}>Explorer</Link>
                    <Link to="/premium" className="font-semibold text-accent-600 hover:text-accent-700 transition-colors flex items-center gap-1.5">
                        <Icon name="sparkle" size={16} /> Premium
                    </Link>

                    {token ? (
                        <>
                            <Link to="/messages" className={iconBtn} title="Messages"><Icon name="message" /></Link>

                            {/* Cloche de notifications */}
                            <div className="relative" ref={dropdownRef}>
                                <button
                                    onClick={() => setShowNotifs(!showNotifs)}
                                    className={`${iconBtn} relative`}
                                    title="Notifications"
                                >
                                    <Icon name="bell" />
                                    {unreadCount > 0 && (
                                        <span className="absolute -top-1 -right-1 bg-primary-600 text-paper text-[10px] font-bold rounded-full min-w-[16px] h-4 flex items-center justify-center px-1">
                                            {unreadCount > 99 ? '99+' : unreadCount}
                                        </span>
                                    )}
                                </button>

                                {showNotifs && (
                                    <div className="absolute right-0 top-11 w-80 bg-paper rounded-xl shadow-card border border-ink/8 z-50 overflow-hidden">
                                        <div className="flex justify-between items-center px-4 py-3 border-b border-ink/8">
                                            <span className="font-semibold text-ink">Notifications</span>
                                            {unreadCount > 0 && (
                                                <button onClick={markAllRead} className="text-xs text-primary-600 hover:underline cursor-pointer">
                                                    Tout marquer lu
                                                </button>
                                            )}
                                        </div>
                                        <div className="max-h-80 overflow-y-auto">
                                            {notifications.length === 0 ? (
                                                <div className="p-6 text-center text-ink/40 text-sm">Aucune notification</div>
                                            ) : (
                                                notifications.map(notif => (
                                                    <button
                                                        key={notif.id}
                                                        onClick={() => handleNotifClick(notif)}
                                                        className={`w-full text-left px-4 py-3 hover:bg-primary-50 transition-colors border-b border-ink/5 flex gap-3 items-start cursor-pointer ${!notif.read ? 'bg-primary-50/60' : ''}`}
                                                    >
                                                        <span className="mt-0.5 text-primary-600"><Icon name={notifIcon(notif.type)} size={18} /></span>
                                                        <div className="flex-1 min-w-0">
                                                            <div className="text-sm font-semibold text-ink truncate">{notif.title}</div>
                                                            <div className="text-xs text-ink/55 truncate">{notif.message}</div>
                                                            <div className="text-[10px] text-ink/40 mt-0.5">{timeAgo(notif.createdAt)}</div>
                                                        </div>
                                                        {!notif.read && <span className="w-2 h-2 rounded-full bg-primary-500 mt-2 flex-shrink-0" />}
                                                    </button>
                                                ))
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>

                            <Link to="/dashboard" className={navLink}>Tableau de bord</Link>
                            <div className="h-6 w-px bg-ink/15 mx-1" />

                            <button onClick={toggleTheme} className={iconBtn} title={theme === 'dark' ? 'Mode clair' : 'Mode sombre'}>
                                <Icon name={theme === 'dark' ? 'sun' : 'moon'} size={18} />
                            </button>

                            <div className="flex items-center gap-3">
                                <Link to="/profile" className="relative group">
                                    {user.avatarUrl ? (
                                        <img src={user.avatarUrl} alt="Profil" className="w-9 h-9 rounded-full border border-ink/10 object-cover" />
                                    ) : (
                                        <div className="w-9 h-9 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center"><Icon name="user" size={18} /></div>
                                    )}
                                    <div className="absolute -bottom-1 -right-1 flex gap-0.5 pointer-events-none">
                                        {user.isPremium && (
                                            <span className="w-4 h-4 bg-accent-400 text-secondary-900 rounded-full flex items-center justify-center shadow-sm border border-paper" title="Premium"><Icon name="sparkle" size={10} /></span>
                                        )}
                                        {user.isVerified && (
                                            <span className="w-4 h-4 bg-secondary-500 text-paper rounded-full flex items-center justify-center shadow-sm border border-paper" title="Profil vérifié"><Icon name="check" size={10} /></span>
                                        )}
                                    </div>
                                </Link>
                                <button onClick={handleLogout} className="text-ink/50 hover:text-primary-600 hover:bg-primary-50 p-2 rounded-lg transition-colors cursor-pointer" title="Déconnexion">
                                    <Icon name="logout" size={18} />
                                </button>
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="h-6 w-px bg-ink/15 mx-1" />
                            <button onClick={toggleTheme} className={`${iconBtn} mr-1`} title={theme === 'dark' ? 'Mode clair' : 'Mode sombre'}>
                                <Icon name={theme === 'dark' ? 'sun' : 'moon'} size={18} />
                            </button>
                            <Link to="/login" className={navLink}>Connexion</Link>
                            <Link to="/register" className="bg-primary-600 text-paper px-4 py-2 rounded-full font-bold text-sm hover:bg-primary-700 transition-colors">
                                S'inscrire
                            </Link>
                        </>
                    )}
                </div>

                {/* ── Mobile : thème + notif + burger ── */}
                <div className="flex md:hidden items-center gap-2.5">
                    <button onClick={toggleTheme} className={iconBtn} title={theme === 'dark' ? 'Mode clair' : 'Mode sombre'}>
                        <Icon name={theme === 'dark' ? 'sun' : 'moon'} size={18} />
                    </button>

                    {token && unreadCount > 0 && (
                        <Link to="/dashboard" className="relative p-2 text-ink/70">
                            <Icon name="bell" />
                            <span className="absolute -top-0.5 -right-0.5 bg-primary-600 text-paper text-[10px] font-bold rounded-full min-w-[16px] h-4 flex items-center justify-center px-1">
                                {unreadCount > 99 ? '99+' : unreadCount}
                            </span>
                        </Link>
                    )}

                    <button
                        onClick={() => setMobileOpen(o => !o)}
                        aria-label={mobileOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
                        className="w-10 h-10 rounded-xl border border-ink/10 bg-paper flex items-center justify-center text-ink cursor-pointer"
                    >
                        <Icon name={mobileOpen ? 'close' : 'menu'} />
                    </button>
                </div>
            </div>

            {/* ── Menu mobile ── */}
            {mobileOpen && (
                <div className="md:hidden fixed inset-0 z-40 flex flex-col" style={{ top: 64 }}>
                    <div className="bg-paper border-b border-ink/8 shadow-card px-6 py-5 flex flex-col gap-1.5 animate-slideDown">
                        <div className="grid grid-cols-3 gap-3 mb-2">
                            <Link to="/explore" onClick={closeMobile} className="flex flex-col items-center justify-center gap-2 p-4 rounded-2xl bg-primary-50 text-primary-700 border border-primary-100 hover:bg-primary-100 transition-colors">
                                <Icon name="search" size={22} />
                                <span className="text-[11px] font-bold uppercase tracking-wide">Explorer</span>
                            </Link>
                            <Link to="/premium" onClick={closeMobile} className="flex flex-col items-center justify-center gap-2 p-4 rounded-2xl bg-accent-50 text-accent-600 border border-accent-100 hover:bg-accent-100 transition-colors">
                                <Icon name="sparkle" size={22} />
                                <span className="text-[11px] font-bold uppercase tracking-wide">Premium</span>
                            </Link>
                            <Link to={token ? "/dashboard" : "/login"} onClick={closeMobile} className="flex flex-col items-center justify-center gap-2 p-4 rounded-2xl bg-secondary-50 text-secondary-700 border border-secondary-100 hover:bg-secondary-100 transition-colors">
                                <Icon name="home" size={22} />
                                <span className="text-[11px] font-bold uppercase tracking-wide text-center leading-tight">Tableau</span>
                            </Link>
                        </div>

                        {token ? (
                            <>
                                <div className="border-t border-ink/8 my-1" />
                                <Link to="/trips" onClick={closeMobile} className="flex items-center gap-3 px-4 py-3 rounded-xl text-ink/80 font-semibold hover:bg-primary-50 hover:text-primary-700 transition-colors">
                                    <Icon name="car" /> <span>Covoiturage</span>
                                </Link>
                                <Link to="/services" onClick={closeMobile} className="flex items-center gap-3 px-4 py-3 rounded-xl text-ink/80 font-semibold hover:bg-primary-50 hover:text-primary-700 transition-colors">
                                    <Icon name="hands" /> <span>Services</span>
                                </Link>
                                <Link to="/messages" onClick={closeMobile} className="flex items-center gap-3 px-4 py-3 rounded-xl text-ink/80 font-semibold hover:bg-primary-50 hover:text-primary-700 transition-colors">
                                    <Icon name="message" /> <span>Messages</span>
                                </Link>
                                <Link to="/profile" onClick={closeMobile} className="flex items-center gap-3 px-4 py-3 rounded-xl text-ink/80 font-semibold hover:bg-primary-50 hover:text-primary-700 transition-colors">
                                    <Icon name="user" /> <span>Mon profil</span>
                                </Link>
                                <div className="border-t border-ink/8 my-1" />
                                <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-3 rounded-xl text-primary-600 font-semibold hover:bg-primary-50 transition-colors w-full text-left cursor-pointer">
                                    <Icon name="logout" /> <span>Déconnexion</span>
                                </button>
                            </>
                        ) : (
                            <>
                                <div className="border-t border-ink/8 my-1" />
                                <Link to="/login" onClick={closeMobile} className="flex items-center gap-3 px-4 py-3 rounded-xl text-ink/80 font-semibold hover:bg-primary-50 hover:text-primary-700 transition-colors">
                                    <Icon name="login" /> <span>Connexion</span>
                                </Link>
                                <Link to="/register" onClick={closeMobile} className="flex items-center justify-center gap-2 mx-4 py-3 rounded-full bg-primary-600 text-paper font-bold hover:bg-primary-700 transition-colors">
                                    S'inscrire
                                </Link>
                            </>
                        )}
                    </div>

                    <div className="flex-1 bg-ink/20" onClick={closeMobile} />
                </div>
            )}
        </>
    );
}
