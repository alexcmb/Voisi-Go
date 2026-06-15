import dotenv from 'dotenv';

dotenv.config();

const env = process.env.NODE_ENV ?? 'development';
const isDevLike = env === 'development' || env === 'test';

const DEV_FALLBACK_SECRET = 'dev_secret_key_local_only_do_not_use_in_prod';

function resolveJwtSecret(): string {
    const secret = process.env.JWT_SECRET;

    if (secret && secret.trim().length > 0) {
        return secret;
    }

    // En production (ou tout env non-dev), on refuse de démarrer avec un secret
    // par défaut : un token signé avec une clé publique = compte de n'importe qui.
    if (!isDevLike) {
        throw new Error(
            'FATAL: la variable d\'environnement JWT_SECRET doit être définie ' +
            '(générez une chaîne aléatoire longue). Démarrage interrompu.'
        );
    }

    console.warn(
        '⚠️  JWT_SECRET non défini — utilisation d\'une clé de développement. ' +
        'NE JAMAIS utiliser en production.'
    );
    return DEV_FALLBACK_SECRET;
}

export const JWT_SECRET: string = resolveJwtSecret();
