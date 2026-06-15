import { Link } from 'react-router-dom';

export default function Footer() {
    return (
        <footer className="relative z-10 bg-secondary-900 text-secondary-100/80 py-14">
            <div className="max-w-6xl mx-auto px-6 text-center md:text-left">
                <div className="grid md:grid-cols-4 gap-8 mb-10">
                    <div className="col-span-1 md:col-span-2">
                        <div className="font-display text-2xl font-semibold text-secondary-50 mb-3">VoisiGo</div>
                        <p className="max-w-xs mx-auto md:mx-0 text-secondary-100/65 leading-relaxed">
                            La plateforme de mobilité solidaire qui rapproche les voisins, une rue à la fois.
                        </p>
                    </div>
                    <div>
                        <h4 className="font-semibold text-secondary-50 mb-4">Liens utiles</h4>
                        <ul className="space-y-2 text-sm">
                            <li><Link to="/" className="hover:text-primary-300 transition-colors">Accueil</Link></li>
                            <li><Link to="/explore" className="hover:text-primary-300 transition-colors">Explorer le fil</Link></li>
                            <li><Link to="/login" className="hover:text-primary-300 transition-colors">Connexion</Link></li>
                            <li><Link to="/register" className="hover:text-primary-300 transition-colors">Inscription</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-semibold text-secondary-50 mb-4">Contact</h4>
                        <ul className="space-y-2 text-sm">
                            <li>support@voisigo.fr</li>
                            <li>Aide &amp; FAQ</li>
                        </ul>
                    </div>
                </div>
                <div className="border-t border-secondary-700/50 pt-8 text-sm text-secondary-100/50">
                    © 2026 VoisiGo. Tous droits réservés.
                </div>
            </div>
        </footer>
    );
}
