import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Footer from '../components/Footer';
import Icon from '../components/Icon';

export default function Home() {
    const [mobileOpen, setMobileOpen] = useState(false);
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

    const closeMobile = () => setMobileOpen(false);

    useEffect(() => {
        const handler = () => { if (window.innerWidth >= 768) setMobileOpen(false); };
        window.addEventListener('resize', handler);
        return () => window.removeEventListener('resize', handler);
    }, []);

    const features = [
        {
            icon: 'hands' as const,
            title: 'Entraide de proximité',
            text: "Un coup de main pour les courses, le jardinage ou un petit bricolage : vos voisins répondent présents.",
        },
        {
            icon: 'car' as const,
            title: 'Covoiturage du quotidien',
            text: "Partagez vos trajets réguliers, économisez et allégez le trafic de votre commune.",
        },
        {
            icon: 'leaf' as const,
            title: 'Plus sobre, plus local',
            text: "Moins de voitures, moins de déplacements inutiles : un impact concret à l'échelle du quartier.",
        },
    ];

    return (
        <div className="min-h-screen bg-cream text-ink font-sans pb-[80px] md:pb-0">
            {/* ── Barre de navigation ── */}
            <nav className="relative z-30 flex justify-between items-center px-6 md:px-8 py-5 max-w-6xl mx-auto">
                <div className="font-display text-2xl font-semibold tracking-tight text-ink">
                    Voisi<span className="text-primary-600">Go</span>
                </div>

                <div className="hidden md:flex gap-7 items-center">
                    <Link to="/explore" className="text-sm font-semibold text-ink/70 hover:text-primary-600 transition-colors">Explorer</Link>
                    <Link to="/premium" className="text-sm font-semibold text-ink/70 hover:text-primary-600 transition-colors">Premium</Link>
                    <div className="w-px h-5 bg-ink/15" />
                    {token ? (
                        <Link to="/dashboard" className="bg-primary-600 text-paper px-5 py-2.5 rounded-full text-sm font-bold hover:bg-primary-700 transition-colors">
                            Mon tableau de bord
                        </Link>
                    ) : (
                        <>
                            <Link to="/login" className="text-sm font-semibold text-ink/70 hover:text-primary-600 transition-colors">Connexion</Link>
                            <Link to="/register" className="bg-primary-600 text-paper px-5 py-2.5 rounded-full text-sm font-bold hover:bg-primary-700 transition-colors">
                                Rejoindre
                            </Link>
                        </>
                    )}
                </div>

                <button
                    onClick={() => setMobileOpen(o => !o)}
                    aria-label={mobileOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
                    className="md:hidden w-10 h-10 rounded-xl border border-ink/10 bg-paper flex items-center justify-center text-ink cursor-pointer"
                >
                    <Icon name={mobileOpen ? 'close' : 'menu'} />
                </button>
            </nav>

            {/* ── Menu mobile ── */}
            {mobileOpen && (
                <div className="md:hidden max-w-6xl mx-auto px-6 pb-2 animate-slideDown">
                    <div className="surface-card rounded-2xl p-4 flex flex-col gap-1">
                        <Link to="/explore" onClick={closeMobile} className="flex items-center gap-3 px-3 py-3 rounded-xl text-ink/80 font-semibold hover:bg-primary-50 transition-colors">
                            <Icon name="search" /> Explorer
                        </Link>
                        <Link to="/premium" onClick={closeMobile} className="flex items-center gap-3 px-3 py-3 rounded-xl text-ink/80 font-semibold hover:bg-primary-50 transition-colors">
                            <Icon name="sparkle" /> Premium
                        </Link>
                        <Link to={token ? '/dashboard' : '/login'} onClick={closeMobile} className="flex items-center gap-3 px-3 py-3 rounded-xl text-ink/80 font-semibold hover:bg-primary-50 transition-colors">
                            <Icon name="home" /> {token ? 'Tableau de bord' : 'Connexion'}
                        </Link>
                        {!token && (
                            <Link to="/register" onClick={closeMobile} className="mt-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-primary-600 text-paper font-bold hover:bg-primary-700 transition-colors">
                                Rejoindre VoisiGo
                            </Link>
                        )}
                    </div>
                </div>
            )}

            {/* ── Hero (plein écran sur mobile) ── */}
            <header className="relative max-w-6xl mx-auto px-6 flex flex-col justify-center min-h-[calc(100svh_-_72px)] py-12 md:py-16">
                <div className="max-w-3xl">
                    <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-primary-700">
                        <span className="rule-accent" /> Bêta privée
                    </span>

                    <h1 className="font-display text-[2.7rem] leading-[1.05] md:text-6xl md:leading-[1.04] font-semibold text-ink mt-6">
                        L'entraide entre voisins,<br />
                        <span className="text-primary-600">à portée de rue.</span>
                    </h1>

                    <p className="text-lg md:text-xl text-ink/70 mt-6 leading-relaxed max-w-2xl">
                        Petits services, jardinage, courses et covoiturage du quotidien.
                        VoisiGo relie les habitants d'un même quartier pour se simplifier la vie, ensemble.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-3 mt-9">
                        <Link
                            to="/register"
                            className="inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-primary-600 hover:bg-primary-700 text-paper text-base font-bold rounded-full transition-colors"
                        >
                            Je participe <Icon name="arrow-right" size={18} />
                        </Link>
                        <Link
                            to="/explore"
                            className="inline-flex items-center justify-center px-7 py-3.5 bg-transparent hover:bg-paper text-ink text-base font-bold rounded-full border border-ink/15 transition-colors"
                        >
                            Voir les annonces
                        </Link>
                    </div>

                    <dl className="flex flex-wrap gap-x-10 gap-y-4 mt-12">
                        {[
                            ['Communes pilotes', '12'],
                            ['Trajets partagés', '480+'],
                            ['Services rendus', '1 300+'],
                        ].map(([label, value]) => (
                            <div key={label}>
                                <dt className="text-sm text-ink/55">{label}</dt>
                                <dd className="font-display text-2xl font-semibold text-ink">{value}</dd>
                            </div>
                        ))}
                    </dl>
                </div>
            </header>

            {/* ── Piliers (plein écran sur mobile) ── */}
            <section className="border-t border-ink/8 bg-paper/60 flex items-center min-h-[100svh]">
                <div className="max-w-6xl mx-auto px-6 py-16 md:py-20 w-full">
                    <h2 className="font-display text-3xl md:text-4xl font-semibold text-ink">
                        Une plateforme, trois usages
                    </h2>
                    <div className="rule-accent mt-4 mb-12" />

                    <div className="grid md:grid-cols-3 gap-6">
                        {features.map(f => (
                            <article key={f.title} className="surface-card rounded-2xl p-7">
                                <span className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary-50 text-primary-600 border border-primary-100">
                                    <Icon name={f.icon} size={24} />
                                </span>
                                <h3 className="font-display text-xl font-semibold text-ink mt-5 mb-2">{f.title}</h3>
                                <p className="text-ink/65 leading-relaxed">{f.text}</p>
                            </article>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── Confiance & sécurité (plein écran sur mobile) ── */}
            <section className="bg-secondary-800 text-secondary-50 flex items-center min-h-[100svh]">
                <div className="max-w-6xl mx-auto px-6 py-16 md:py-24 grid lg:grid-cols-2 gap-12 items-center w-full">
                    <div>
                        <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-secondary-200">
                            <Icon name="shield" size={16} /> Confiance & sécurité
                        </span>
                        <h2 className="font-display text-3xl md:text-5xl font-semibold leading-tight mt-5 mb-6">
                            Un réseau local où l'on sait à qui l'on parle
                        </h2>
                        <p className="text-secondary-100/80 text-lg leading-relaxed mb-9">
                            En validant une pièce d'identité officielle, chaque voisin obtient un badge vérifié.
                            De quoi rendre service et covoiturer l'esprit tranquille.
                        </p>

                        <ul className="space-y-5">
                            {[
                                ['Identité vérifiée', "CNI, passeport ou permis pour certifier chaque membre."],
                                ['Avis après échange', "Notes et commentaires sincères à chaque service rendu."],
                                ['Protection anti-spam', "Une modération active qui protège vos données et vos conversations."],
                            ].map(([t, d]) => (
                                <li key={t} className="flex items-start gap-3">
                                    <span className="mt-0.5 text-secondary-200"><Icon name="check" size={20} /></span>
                                    <div>
                                        <h4 className="font-semibold text-secondary-50">{t}</h4>
                                        <p className="text-secondary-100/70 text-sm">{d}</p>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Carte Premium */}
                    <div className="rounded-2xl p-8 bg-secondary-900/60 border border-secondary-700/60">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-display text-2xl font-semibold text-secondary-50">Premium</h3>
                            <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-accent-300 border border-accent-300/40 rounded-full px-3 py-1">
                                <Icon name="sparkle" size={14} /> Recommandé
                            </span>
                        </div>
                        <p className="text-secondary-100/75 text-sm leading-relaxed mb-7">
                            Soutenez ce projet communautaire et profitez d'avantages de visibilité et de confort.
                        </p>

                        <ul className="space-y-3.5 mb-8 text-sm text-secondary-100">
                            {[
                                'Badge Premium sur votre profil',
                                'Mise en avant de vos annonces',
                                'Navigation sans publicité',
                                "Vérification d'identité incluse",
                            ].map(item => (
                                <li key={item} className="flex items-center gap-2.5">
                                    <span className="text-accent-300"><Icon name="check" size={18} /></span>
                                    {item}
                                </li>
                            ))}
                        </ul>

                        <div className="flex flex-col sm:flex-row gap-3">
                            <Link to="/premium" className="flex-1 text-center py-3 bg-accent-400 hover:bg-accent-500 text-secondary-900 font-bold text-sm rounded-full transition-colors">
                                Découvrir Premium
                            </Link>
                            <Link to="/register" className="flex-1 text-center py-3 bg-transparent hover:bg-secondary-50/10 text-secondary-50 font-bold text-sm rounded-full border border-secondary-50/20 transition-colors">
                                S'inscrire
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
}
