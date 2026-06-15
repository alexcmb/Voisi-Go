# VoisiGO

Application d'entraide et de covoiturage local.

## Fonctionnalités
- **Covoiturage** : Proposez ou recherchez des trajets.
- **Entraide (Services)** : Demandes et offres de services (bricolage, courses, etc.).
- **Géolocalisation** : Recherche par rayon et carte interactive.
- **Messagerie** : Discutez avec vos voisins.
- **Système de Réservation** : Gérez les places et les demandes.

## Installation

### Prérequis
- Node.js (v18+)
- PostgreSQL (accès via le driver `pg`)

### Démarrage

1. **Backend**
   ```bash
   cd backend
   npm install
   cp .env.example .env   # puis renseignez DATABASE_URL et JWT_SECRET
   npm run dev
   ```
   Le serveur démarre sur `http://localhost:3000`.

   > **Important** : `JWT_SECRET` doit être défini. Hors développement, le
   > serveur refuse de démarrer si la variable est absente.

2. **Frontend**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
   L'application est accessible sur `http://localhost:5173` (ou votre IP locale).

---

## Gestion des Publicités

L'application intègre des espaces publicitaires de démonstration ("encarts").
Pour personnaliser ces publicités (ajouter une vraie image, changer le texte ou le lien), modifiez le composant `AdBanner`.

### Fichier à modifier
`frontend/src/components/AdBanner.tsx`

### Exemple de personnalisation

Pour afficher une image à la place du bloc gris :

```tsx
export default function AdBanner({ format = 'banner', className = '' }: { format?: 'square' | 'banner', className?: string }) {
    // URL de votre image publicitaire
    const adImageUrl = "https://example.com/ma-pub.jpg";
    const adLink = "https://mon-partenaire.com";

    return (
        <a href={adLink} target="_blank" rel="noopener noreferrer" className={`block relative overflow-hidden group rounded-lg ${format === 'banner' ? 'h-32 w-full' : 'h-64 w-full md:w-64'} ${className}`}>
             {/* Badge "Publicité" */}
            <span className="absolute top-2 right-2 z-10 text-[10px] bg-white/80 px-1 rounded uppercase tracking-wider text-gray-600">Publicité</span>
            
            {/* Image */}
            <img 
                src={adImageUrl} 
                alt="Publicité" 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
        </a>
    );
}
```

### Emplacements actuels
- **Fil d'actualité (Explore)** : Haut de page.
- **Tableau de bord** : Entre les sections "Covoiturage" et "Entraide".

---

## Application mobile (PWA & notifications push)

VoisiGo est une **PWA** : installable sur l'écran d'accueil, elle s'ouvre en plein écran comme une app native et peut recevoir des **notifications push** (même fermée).

### Installer sur le téléphone
- **Android / Chrome** : menu ⋮ → « Installer l'application ».
- **iOS / Safari** : bouton Partager → « Sur l'écran d'accueil ».
  (Sur iOS, le push ne fonctionne qu'une fois l'app **installée** — iOS 16.4+.)

### Activer les notifications push (serveur)
1. Générer les clés VAPID une seule fois :
   ```bash
   cd backend
   npm run generate-vapid
   ```
2. Renseigner `backend/.env` :
   ```
   VAPID_PUBLIC_KEY=...
   VAPID_PRIVATE_KEY=...
   VAPID_SUBJECT=mailto:vous@exemple.fr
   ```
3. Redémarrer le backend. Sans ces clés, le push est simplement **désactivé** (le reste de l'app fonctionne normalement, et la carte d'activation est masquée).

Les utilisateurs activent ensuite le push depuis leur **Tableau de bord** (carte « Notifications push »). L'envoi est automatique à chaque événement : nouveau message, demande/confirmation de réservation, nouvel avis, etc.

### À savoir
- Le push exige **HTTPS** (déjà géré en prod via nginx + Certbot). En local, le service worker tourne sur `http://localhost`, mais l'envoi réel nécessite des clés VAPID valides.
- Après modification du service worker (`frontend/public/sw.js`), recharger avec vidage du cache.
- Endpoints backend : `GET /api/push/vapid-public-key`, `POST /api/push/subscribe`, `POST /api/push/unsubscribe`, `POST /api/push/test`.
