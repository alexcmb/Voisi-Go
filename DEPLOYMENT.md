# Déploiement — VoisiGo

Architecture cible :

- **Frontend** (Vite / React) → **Vercel** (statique)
- **Backend** (Express / Node) → **Railway** (nixpacks)
- **Base de données** → **Railway PostgreSQL**

Le dépôt est un monorepo (`frontend/` + `backend/`) : chaque plateforme doit pointer
vers le bon sous-dossier (réglage « Root Directory »).

---

## 1. Backend + base PostgreSQL sur Railway

1. [railway.app](https://railway.app) → **New Project** → **Deploy from GitHub repo** (`Voisi-Go`).
2. Dans le service créé → **Settings** → **Root Directory** = `backend`.
3. Ajouter la base : **New** → **Database** → **PostgreSQL**. Railway crée un service
   `Postgres` exposant une variable `DATABASE_URL`.
4. Service backend → onglet **Variables** :

   | Variable | Valeur |
   |---|---|
   | `DATABASE_URL` | `${{Postgres.DATABASE_URL}}` (référence le service Postgres) |
   | `JWT_SECRET` | une longue chaîne aléatoire |
   | `NODE_ENV` | `production` *(important — sinon le serveur démarre avec une clé JWT de dev)* |
   | `ALLOWED_ORIGINS` | `https://<votre-app>.vercel.app` (virgules si plusieurs) |
   | `VAPID_PUBLIC_KEY` | voir ci-dessous |
   | `VAPID_PRIVATE_KEY` | voir ci-dessous |
   | `VAPID_SUBJECT` | `mailto:vous@exemple.fr` |

   > `PORT` est injecté automatiquement par Railway — ne pas le définir.

   Clés VAPID (une seule fois, en local) :
   ```bash
   cd backend && npm install && npm run generate-vapid
   ```

5. Build Railway (nixpacks, déjà configuré dans `backend/railway.toml`) :
   `npm install --include=dev && npm run build`, puis `npm start`.
   Le schéma SQL se crée tout seul au démarrage (`CREATE TABLE IF NOT EXISTS`),
   aucune migration à lancer.
6. **Settings → Networking → Generate Domain** pour obtenir l'URL publique :
   `https://xxxx.up.railway.app`.

---

## 2. Frontend sur Vercel

1. [vercel.com](https://vercel.com) → **New Project** → importer le repo.
2. **Root Directory** = `frontend`. Framework détecté : **Vite**
   (Build `npm run build`, Output `dist`).
3. **Environment Variables** : `VITE_API_URL` = l'URL Railway du backend
   (sans slash final), ex. `https://xxxx.up.railway.app`.
4. **Deploy**. Le fichier `frontend/vercel.json` gère le routing SPA
   (toutes les routes → `index.html`) et les en-têtes du service worker.

---

## 3. Relier les deux

- Renseigne l'URL Vercel finale dans `ALLOWED_ORIGINS` (Railway). Les domaines
  `*.vercel.app` sont déjà acceptés automatiquement par le backend, donc ça
  fonctionne même sans config — ajoute simplement ton **domaine custom** si tu en as un.
- Un `git push` redéploie automatiquement Vercel **et** Railway.

---

## Notes

- **HTTPS** est fourni par Vercel et Railway → les **notifications push** fonctionnent en production.
- La connexion Postgres utilise SSL automatiquement hors `localhost` (déjà géré dans le code).
- Régénérer les clés VAPID : `cd backend && npm run generate-vapid`.
- Le `backend/Dockerfile` (Node multi-stage, sans Prisma) n'est utilisé que pour
  `docker compose` en local ; Railway passe par nixpacks.
