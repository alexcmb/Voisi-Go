import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../lib/api';
import type { AppNotification } from '../types';
import { useTheme } from '../context/ThemeContext';
import Icon, { type IconName } from './Icon';
import { playNotificationSound } from '../utils/sound';

export default function Header() {
    const navigate = useNavigate();
    const { theme, toggleTheme } = useTheme();
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const [unreadCount, setUnreadCount] = useState(0);
    const firstFetch = useRef(true);
    const [notifications, setNotifications] = useState<AppNotification[]>([]);
    const [showNotifs, setShowNotifs] = useState(false);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/');
    };

    // Poll unread count
    useEffect(() => {
        if (!token) return;
        const fetchCount = () => {
            fetch(`${API_BASE_URL}/api/notifications/unread-count`, {
                headers: { 'Authorization': `Bearer ${token}` },
            })
                .then(res => res.json())
                .then(data => {
                    const newCount = data.unreadCount || 0;
                    setUnreadCount(prev => {
                        if (newCount > prev && !firstFetch.current) {
                            playNotificationSound();
                        }
                        return newCount;
                    });
                    firstFetch.current = false;
                })
                .catch(() => { });
        };
        fetchCount();
        const interval = setInterval(fetchCount, 15000);
        return () => clearInterval(interval);
    }, [token]);

    // Fetch full notifications when the panel opens
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
                    <Link to="/help" className={navLink}>Aide</Link>
                    <Link to="/premium" className="font-semibold text-accent-600 hover:text-accent-700 transition-colors flex items-center gap-1.5">
                        <Icon name="sparkle" size={16} /> Premium
                    </Link>

                    {token ? (
                        <>
                            <Link to="/messages" className={iconBtn} title="Messages"><Icon name="message" /></Link>

                            <button
                                onClick={() => setShowNotifs(s => !s)}
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

                {/* ── Mobile : thème + notif ── */}
                <div className="flex md:hidden items-center gap-3">
                    <button onClick={toggleTheme} className={`${iconBtn} border-none shadow-sm`} title={theme === 'dark' ? 'Mode clair' : 'Mode sombre'}>
                        <Icon name={theme === 'dark' ? 'sun' : 'moon'} size={20} />
                    </button>

                    {token ? (
                        <>
                            <button onClick={() => setShowNotifs(s => !s)} className={`relative ${iconBtn} border-none shadow-sm`} title="Notifications">
                                <Icon name="bell" size={20} />
                                {unreadCount > 0 && (
                                    <span className="absolute -top-1 -right-1 bg-primary-600 text-paper text-[10px] font-bold rounded-full min-w-[16px] h-4 flex items-center justify-center px-1">
                                        {unreadCount > 99 ? '99+' : unreadCount}
                                    </span>
                                )}
                            </button>
                            <button onClick={handleLogout} className={`${iconBtn} border-none shadow-sm text-ink/50 hover:text-red-500`} title="Déconnexion">
                                <Icon name="logout" size={20} />
                            </button>
                        </>
                    ) : (
                        <Link to="/login" className="bg-primary-600 text-paper px-4 py-2 rounded-full font-bold text-sm hover:bg-primary-700 transition-colors">
                            Connexion
                        </Link>
                    )}
                </div>
            </div>

            {/* ── Panneau notifications (responsive : desktop ancré à droite, mobile pleine largeur) ── */}
            {token && showNotifs && (
                <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowNotifs(false)} aria-hidden="true" />
                    <div className="fixed z-50 top-16 left-3 right-3 sm:left-auto sm:right-6 sm:w-80 bg-paper rounded-xl shadow-card border border-ink/8 overflow-hidden animate-slideDown">
                        <div className="flex justify-between items-center px-4 py-3 border-b border-ink/8">
                            <span className="font-semibold text-ink">Notifications</span>
                            {unreadCount > 0 && (
                                <button onClick={markAllRead} className="text-xs text-primary-600 hover:underline cursor-pointer">
                                    Tout marquer lu
                                </button>
                            )}
                        </div>
                        <div className="max-h-[70vh] sm:max-h-80 overflow-y-auto">
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
                </>
            )}
        </>
    );
}
