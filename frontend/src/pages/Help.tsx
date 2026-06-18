import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import Icon from '../components/Icon';

interface FAQItem {
    question: string;
    answer: string;
    category: 'covoiturage' | 'entraide' | 'securite' | 'compte';
}

const FAQ_DATA: FAQItem[] = [
    // Covoiturage
    {
        category: 'covoiturage',
        question: 'Comment fonctionne le covoiturage sur VoisiGo ?',
        answer: 'VoisiGo permet de mettre en relation des voisins qui font le même trajet. Les conducteurs publient leurs trajets prévus, et les passagers peuvent demander à réserver une place. C’est idéal pour faire des économies, réduire la pollution et discuter en chemin !'
    },
    {
        category: 'covoiturage',
        question: 'Le covoiturage est-il payant ?',
        answer: 'Le conducteur peut choisir de proposer le trajet gratuitement (solidarité de voisinage) ou de demander une petite participation aux frais (essence, usure). Le prix est clairement indiqué sur l’annonce avant que vous ne réserviez.'
    },
    {
        category: 'covoiturage',
        question: 'Comment puis-je être sûr que le conducteur va m’emmener ?',
        answer: 'Une fois que le conducteur accepte votre demande, vous êtes mis en relation par messagerie. Vous pouvez vous écrire ou vous appeler pour fixer le lieu exact du rendez-vous. En cas d’annulation, vous êtes prévenu par notification.'
    },
    // Entraide
    {
        category: 'entraide',
        question: 'Qu’est-ce que la rubrique "Services d’entraide" ?',
        answer: 'C’est un espace où vous pouvez rendre service ou demander de l’aide pour des tâches quotidiennes : faire des courses pour un voisin, tondre la pelouse, changer une ampoule, arroser les plantes pendant les vacances, ou simplement passer prendre un café pour discuter.'
    },
    {
        category: 'entraide',
        question: 'Faut-il payer pour les services d’entraide ?',
        answer: 'La plupart des services sont gratuits et basés sur l’entraide amicale entre voisins. Cependant, pour des travaux plus importants ou nécessitant du matériel, vous pouvez convenir d’un petit dédommagement, à préciser dans l’annonce.'
    },
    // Securite
    {
        category: 'securite',
        question: 'Est-ce que la plateforme est sécurisée ?',
        answer: 'Oui, la sécurité est notre priorité. Nous vérifions l’identité des membres qui le souhaitent (badge vert "Vérifié" sur leur profil). De plus, chaque membre dispose d’une note et d’avis laissés par ses voisins après un trajet ou un service.'
    },
    {
        category: 'securite',
        question: 'Que faire en cas de problème avec un voisin ?',
        answer: 'Si un comportement vous semble suspect ou inapproprié, vous pouvez nous le signaler immédiatement via le support ou en écrivant à support@voisigo.fr. Nous prenons ces signalements très au sérieux.'
    },
    // Compte
    {
        category: 'compte',
        question: 'Comment puis-je modifier mes informations personnelles ?',
        answer: 'Rendez-vous dans la rubrique "Profil" (en bas sur mobile, ou en haut à droite sur ordinateur), puis cliquez sur "Modifier mon profil". Vous pourrez y changer votre nom, votre photo et votre description.'
    },
    {
        category: 'compte',
        question: 'Qu’est-ce que le compte Premium ?',
        answer: 'Le compte Premium (actuellement gratuit pour toute la communauté en phase de lancement) vous permet de supprimer toutes les publicités de l’application et d’avoir un badge couronne exclusif sur votre profil.'
    }
];

export default function Help() {
    const [textSize, setTextSize] = useState<'normal' | 'large' | 'xlarge'>('normal');
    const [searchQuery, setSearchQuery] = useState('');
    const [activeGuide, setActiveGuide] = useState<'driver' | 'passenger' | 'services' | 'chat'>('driver');
    const [isPlaying, setIsPlaying] = useState<string | null>(null);
    const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);
    const [activeFaqCategory, setActiveFaqCategory] = useState<string>('all');

    useEffect(() => {
        return () => {
            window.speechSynthesis.cancel();
        };
    }, []);

    // Stop speaking if playing and we switch guides
    useEffect(() => {
        window.speechSynthesis.cancel();
        setIsPlaying(null);
    }, [activeGuide]);

    // Text Size helpers
    const getTextSizeClass = (type: 'title' | 'body' | 'subtitle') => {
        if (textSize === 'xlarge') {
            return type === 'title' ? 'text-4xl' : type === 'subtitle' ? 'text-2xl' : 'text-xl';
        }
        if (textSize === 'large') {
            return type === 'title' ? 'text-3xl' : type === 'subtitle' ? 'text-xl' : 'text-lg';
        }
        return type === 'title' ? 'text-2xl' : type === 'subtitle' ? 'text-lg' : 'text-base';
    };

    // Text to Speech
    const speak = (text: string, sectionId: string) => {
        if (isPlaying === sectionId) {
            window.speechSynthesis.cancel();
            setIsPlaying(null);
            return;
        }

        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'fr-FR';
        utterance.onend = () => setIsPlaying(null);
        utterance.onerror = () => setIsPlaying(null);
        setIsPlaying(sectionId);
        window.speechSynthesis.speak(utterance);
    };

    // Filter FAQs
    const filteredFaqs = FAQ_DATA.filter(item => {
        const matchesCategory = activeFaqCategory === 'all' || item.category === activeFaqCategory;
        const matchesSearch = item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.answer.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    const guides = {
        driver: {
            title: "Proposer un trajet (Conducteur)",
            steps: [
                {
                    number: "1",
                    title: "Ouvrir le formulaire",
                    desc: "Allez sur votre Tableau de Bord ou sur l'onglet 'Trajets', puis cliquez sur le gros bouton bleu 'Proposer un trajet'."
                },
                {
                    number: "2",
                    title: "Indiquer les détails du voyage",
                    desc: "Renseignez vos villes de départ et d'arrivée, le jour, l'heure de départ, le nombre de places disponibles, et la participation aux frais souhaitée (ou écrivez 0 pour offrir le voyage de bon cœur)."
                },
                {
                    number: "3",
                    title: "Publier l'annonce",
                    desc: "Validez votre saisie. Votre trajet apparaît sur la carte et sur le fil d'actualité. Vos voisins peuvent désormais s'inscrire !"
                }
            ],
            audioText: "Comment proposer un trajet en tant que conducteur. Étape 1 : Allez sur votre tableau de bord ou sur l'onglet Trajets, puis cliquez sur le bouton bleu Proposer un trajet. Étape 2 : Renseignez vos villes de départ et d'arrivée, la date, l'heure, les places disponibles et le prix. Étape 3 : Validez. Votre trajet est visible par tous vos voisins !"
        },
        passenger: {
            title: "Réserver un trajet (Passager)",
            steps: [
                {
                    number: "1",
                    title: "Rechercher votre trajet",
                    desc: "Allez dans l'onglet 'Explorer le fil' ou 'Trajets'. Utilisez la barre de recherche en haut pour indiquer votre destination."
                },
                {
                    number: "2",
                    title: "Demander une réservation",
                    desc: "Cliquez sur l'annonce qui vous intéresse pour voir les détails, puis cliquez sur le bouton vert 'Demander à réserver'."
                },
                {
                    number: "3",
                    title: "Confirmer avec votre voisin",
                    desc: "Dès que le conducteur accepte votre demande, vous recevez une notification. Vous pouvez alors discuter par messages pour vous accorder sur le lieu de rencontre exact."
                }
            ],
            audioText: "Comment réserver un trajet en tant que passager. Étape 1 : Allez dans l'onglet Explorer le fil ou Trajets, puis cherchez votre destination. Étape 2 : Cliquez sur l'annonce voulue et cliquez sur Demander à réserver. Étape 3 : Une fois le trajet accepté, échangez par messagerie avec le conducteur pour vous accorder sur le lieu de rendez-vous."
        },
        services: {
            title: "Rendre service ou demander de l'aide (Entraide)",
            steps: [
                {
                    number: "1",
                    title: "Choisir votre besoin ou offre",
                    desc: "Allez sur l'onglet 'Services', puis cliquez sur 'Proposer un service' (si vous souhaitez aider) ou 'Demander de l'aide' (si vous avez besoin de soutien)."
                },
                {
                    number: "2",
                    title: "Remplir l'annonce",
                    desc: "Choisissez la catégorie (Courses, Jardinage, Bricolage, Visite amicale) et décrivez précisément ce que vous proposez ou ce dont vous avez besoin."
                },
                {
                    number: "3",
                    title: "Entrer en contact",
                    desc: "Une fois publiée, vos voisins peuvent voir votre annonce. Si quelqu'un est intéressé, il clique sur 'Contacter' pour démarrer une discussion privée avec vous."
                }
            ],
            audioText: "Comment utiliser l'entraide de voisinage. Étape 1 : Allez sur l'onglet Services et choisissez de proposer un service ou demander de l'aide. Étape 2 : Choisissez une catégorie comme courses, jardinage ou bricolage et décrivez le besoin. Étape 3 : Validez pour publier. Vos voisins pourront vous contacter directement."
        },
        chat: {
            title: "Discuter avec mes voisins (Messagerie)",
            steps: [
                {
                    number: "1",
                    title: "Démarrer une conversation",
                    desc: "Sur n'importe quelle annonce de trajet ou de service, cliquez sur le bouton 'Contacter' pour ouvrir une discussion directe avec l'auteur."
                },
                {
                    number: "2",
                    title: "Saisir votre message",
                    desc: "Écrivez votre message dans la zone de saisie en bas de l'écran (ex: 'Bonjour, seriez-vous disponible pour m'aider samedi ?') et cliquez sur la flèche bleue pour envoyer."
                },
                {
                    number: "3",
                    title: "Recevoir les alertes sonores",
                    desc: "Laissez l'application ouverte. Dès que votre voisin vous répond, un son de notification retentira pour vous avertir instantanément !"
                }
            ],
            audioText: "Comment discuter avec vos voisins. Étape 1 : Sur une annonce, cliquez sur le bouton Contacter. Étape 2 : Écrivez votre message en bas et appuyez sur la flèche pour envoyer. Étape 3 : Un son de notification retentit dès que votre voisin vous répond pour ne louper aucun message."
        }
    };

    return (
        <Layout>
            <div className="max-w-4xl mx-auto px-4 py-8">
                
                {/* ─── Barre de titre & introduction ─── */}
                <div className="text-center mb-8">
                    <span className="text-primary-600 font-extrabold text-sm uppercase tracking-wider bg-primary-50 px-4 py-1.5 rounded-full inline-block mb-3">
                        Centre d'aide & tutoriels
                    </span>
                    <h1 className="text-4xl font-extrabold text-ink tracking-tight mb-3">
                        Comment puis-je vous aider ?
                    </h1>
                    <p className="text-ink/60 max-w-lg mx-auto text-base">
                        Découvrez comment utiliser VoisiGo étape par étape. Ajustez la taille de l'écriture ou écoutez les guides pour une lecture plus confortable !
                    </p>
                </div>

                {/* ─── Barre d'outils d'accessibilité (Senior-Friendly) ─── */}
                <div className="bg-paper border border-ink/8 rounded-2xl p-4 mb-8 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
                    <div className="flex items-center gap-2 text-ink/75 font-semibold text-sm">
                        <span className="text-lg">👓</span> Confort visuel et de lecture :
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                        <button
                            onClick={() => setTextSize('normal')}
                            className={`px-4 py-2 rounded-xl text-sm font-bold border transition-all cursor-pointer ${textSize === 'normal' ? 'bg-primary-600 text-paper border-primary-600' : 'bg-cream text-ink/70 border-ink/10 hover:border-ink/20'}`}
                        >
                            A (Normal)
                        </button>
                        <button
                            onClick={() => setTextSize('large')}
                            className={`px-4 py-2 rounded-xl text-base font-bold border transition-all cursor-pointer ${textSize === 'large' ? 'bg-primary-600 text-paper border-primary-600' : 'bg-cream text-ink/70 border-ink/10 hover:border-ink/20'}`}
                        >
                            A+ (Grand)
                        </button>
                        <button
                            onClick={() => setTextSize('xlarge')}
                            className={`px-4 py-2 rounded-xl text-lg font-bold border transition-all cursor-pointer ${textSize === 'xlarge' ? 'bg-primary-600 text-paper border-primary-600' : 'bg-cream text-ink/70 border-ink/10 hover:border-ink/20'}`}
                        >
                            A++ (Très Grand)
                        </button>
                    </div>
                </div>

                {/* ─── Guides pas-à-pas (Visual Guides) ─── */}
                <div className="mb-12">
                    <h2 className={`font-bold text-ink mb-6 flex items-center gap-2 ${getTextSizeClass('title')}`}>
                        📖 Guides Pas-à-Pas
                    </h2>

                    {/* Onglets des guides */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-6">
                        {(Object.keys(guides) as Array<keyof typeof guides>).map((key) => {
                            const active = activeGuide === key;
                            const emoji = key === 'driver' ? '🚗' : key === 'passenger' ? '🙋' : key === 'services' ? '🤝' : '💬';
                            const label = key === 'driver' ? 'Conduire' : key === 'passenger' ? 'Voyager' : key === 'services' ? 'Entraide' : 'Messages';
                            return (
                                <button
                                    key={key}
                                    onClick={() => setActiveGuide(key)}
                                    className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center justify-center text-center gap-2 cursor-pointer ${active ? 'bg-primary-600 text-paper border-primary-600 scale-[1.02] shadow-md' : 'bg-paper text-ink/70 border-ink/8 hover:border-ink/15'}`}
                                >
                                    <span className="text-3xl">{emoji}</span>
                                    <span className="font-bold text-sm">{label}</span>
                                </button>
                            );
                        })}
                    </div>

                    {/* Contenu du guide sélectionné */}
                    <div className="bg-paper border border-ink/8 rounded-2xl p-6 sm:p-8 shadow-sm relative overflow-hidden">
                        
                        {/* Option de lecture audio */}
                        <div className="absolute top-4 right-4 z-10">
                            <button
                                onClick={() => speak(guides[activeGuide].audioText, activeGuide)}
                                className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold transition-all border cursor-pointer ${isPlaying === activeGuide ? 'bg-red-500 text-white border-red-500 animate-pulse' : 'bg-primary-50 text-primary-700 border-primary-100 hover:bg-primary-100'}`}
                            >
                                {isPlaying === activeGuide ? (
                                    <>
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25v13.5m-7.5-13.5v13.5" />
                                        </svg>
                                        Arrêter la lecture
                                    </>
                                ) : (
                                    <>
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 0 1 0 12.728M16.463 8.288a5.25 5.25 0 0 1 0 7.424M6.75 8.25l4.72-4.72a.75.75 0 0 1 1.28.53v15.88a.75.75 0 0 1-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.009 9.009 0 0 1 2.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75Z" />
                                        </svg>
                                        Écouter à voix haute
                                    </>
                                )}
                            </button>
                        </div>

                        <h3 className={`font-bold text-ink mb-6 border-b border-ink/8 pb-4 pr-32 ${getTextSizeClass('subtitle')}`}>
                            {guides[activeGuide].title}
                        </h3>

                        {/* Liste des étapes */}
                        <div className="grid md:grid-cols-3 gap-6 relative">
                            {guides[activeGuide].steps.map((step, idx) => (
                                <div key={idx} className="flex flex-col gap-3 relative">
                                    <div className="flex items-start gap-3">
                                        <span className="w-10 h-10 rounded-full bg-primary-100 text-primary-700 font-black flex items-center justify-center text-lg shadow-sm border border-primary-200 flex-shrink-0">
                                            {step.number}
                                        </span>
                                        <div>
                                            <h4 className={`font-bold text-ink mb-1 ${getTextSizeClass('subtitle')}`}>
                                                {step.title}
                                            </h4>
                                            <p className={`text-ink/65 leading-relaxed ${getTextSizeClass('body')}`}>
                                                {step.desc}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* ─── Foire Aux Questions (FAQ) ─── */}
                <div className="mb-12">
                    <h2 className={`font-bold text-ink mb-6 flex items-center gap-2 ${getTextSizeClass('title')}`}>
                        ❓ Foire Aux Questions (FAQ)
                    </h2>

                    {/* Barre de recherche FAQ */}
                    <div className="relative mb-6">
                        <span className="absolute inset-y-0 left-4 flex items-center text-ink/40 pointer-events-none">
                            <Icon name="search" size={20} />
                        </span>
                        <input
                            type="text"
                            placeholder="Rechercher une question (ex: prix, sécurité, profil...)"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-12 pr-4 py-3.5 bg-paper border border-ink/8 rounded-2xl focus:ring-4 focus:ring-primary-100 text-ink shadow-sm text-base"
                        />
                    </div>

                    {/* Filtres par catégorie */}
                    <div className="flex flex-wrap gap-2 mb-6">
                        {[
                            { id: 'all', label: 'Toutes les questions', emoji: '💡' },
                            { id: 'covoiturage', label: 'Covoiturage', emoji: '🚗' },
                            { id: 'entraide', label: 'Entraide', emoji: '🤝' },
                            { id: 'securite', label: 'Sécurité', emoji: '🔒' },
                            { id: 'compte', label: 'Mon Compte', emoji: '⚙️' }
                        ].map((cat) => (
                            <button
                                key={cat.id}
                                onClick={() => setActiveFaqCategory(cat.id)}
                                className={`px-4 py-2 rounded-xl text-sm font-bold border transition-all cursor-pointer flex items-center gap-1.5 ${activeFaqCategory === cat.id ? 'bg-primary-600 text-paper border-primary-600 shadow-sm' : 'bg-paper text-ink/70 border-ink/8 hover:border-ink/15'}`}
                            >
                                <span>{cat.emoji}</span> {cat.label}
                            </button>
                        ))}
                    </div>

                    {/* Liste des questions accordéon */}
                    <div className="space-y-3">
                        {filteredFaqs.length === 0 ? (
                            <div className="text-center py-8 text-ink/40 bg-paper rounded-2xl border border-ink/8">
                                Aucun résultat trouvé pour "{searchQuery}". Essayez avec d'autres mots.
                            </div>
                        ) : (
                            filteredFaqs.map((item, idx) => {
                                const isOpen = openFaqIndex === idx;
                                return (
                                    <div
                                        key={idx}
                                        className="bg-paper border border-ink/8 rounded-2xl overflow-hidden transition-all shadow-sm"
                                    >
                                        <button
                                            onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                                            className="w-full text-left p-5 flex justify-between items-center gap-4 cursor-pointer hover:bg-ink/2 font-semibold"
                                        >
                                            <span className={`font-bold text-ink ${getTextSizeClass('subtitle')}`}>
                                                {item.question}
                                            </span>
                                            <span className={`text-xs transition-transform duration-200 text-primary-600 ${isOpen ? 'rotate-180' : ''}`}>
                                                ▼
                                            </span>
                                        </button>
                                        {isOpen && (
                                            <div className="px-5 pb-5 border-t border-ink/5 pt-4 bg-ink/1">
                                                <p className={`text-ink/70 leading-relaxed ${getTextSizeClass('body')}`}>
                                                    {item.answer}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>

                {/* ─── Pied de page de support ─── */}
                <div className="bg-gradient-to-br from-primary-600 to-secondary-600 rounded-3xl p-8 text-paper text-center shadow-lg">
                    <span className="text-3xl mb-3 block">✉️</span>
                    <h3 className="text-2xl font-black mb-2">Vous n'avez pas trouvé votre réponse ?</h3>
                    <p className="text-paper/85 max-w-md mx-auto mb-6 text-sm">
                        Notre équipe de voisins est là pour vous guider. Écrivez-nous à tout moment et nous vous répondrons dans les plus brefs délais.
                    </p>
                    <a
                        href="mailto:support@voisigo.fr"
                        className="bg-paper text-primary-700 hover:bg-primary-50 px-8 py-3.5 rounded-2xl font-bold transition-all inline-block shadow-md"
                    >
                        Contacter le Support : support@voisigo.fr
                    </a>
                </div>

            </div>
        </Layout>
    );
}
