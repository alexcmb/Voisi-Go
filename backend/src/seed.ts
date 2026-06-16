/**
 * Seed de démonstration — annonces « vraies que nature » sur l'agglomération nantaise.
 *
 *   npm run seed
 *
 * Idempotent : toutes les entités créées ont un id préfixé "demo-". À chaque
 * exécution, les lignes "demo-%" sont supprimées puis réinsérées. Les comptes et
 * annonces réels (non préfixés) ne sont jamais touchés.
 *
 * Mot de passe de tous les comptes démo : "demo1234"
 */
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import { Pool } from 'pg';
import { initDb } from './utils/db';

dotenv.config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_URL?.includes('localhost') ? undefined : { rejectUnauthorized: false },
});

const iso = (d: Date) => d.toISOString();
const now = () => iso(new Date());
function inDays(days: number, hour = 9, minute = 0): string {
    const d = new Date();
    d.setDate(d.getDate() + days);
    d.setHours(hour, minute, 0, 0);
    return iso(d);
}
const pad = (n: number) => String(n).padStart(2, '0');
const rint = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
const pickr = <T,>(a: T[]) => a[Math.floor(Math.random() * a.length)];

// ── Communes & lieux de l'agglo nantaise (GPS réels) ──
const communes = [
    { name: 'Nantes Centre', lat: 47.2173, lon: -1.5534 },
    { name: 'Nantes (Île de Nantes)', lat: 47.2050, lon: -1.5570 },
    { name: 'Nantes (Doulon)', lat: 47.2330, lon: -1.5180 },
    { name: 'Rezé', lat: 47.1839, lon: -1.5494 },
    { name: 'Saint-Herblain', lat: 47.2122, lon: -1.6486 },
    { name: 'Orvault', lat: 47.2719, lon: -1.6219 },
    { name: 'Vertou', lat: 47.1697, lon: -1.4699 },
    { name: 'Carquefou', lat: 47.2975, lon: -1.4906 },
    { name: 'Bouguenais', lat: 47.1772, lon: -1.6086 },
    { name: 'Saint-Sébastien-sur-Loire', lat: 47.2078, lon: -1.5017 },
    { name: 'La Chapelle-sur-Erdre', lat: 47.2997, lon: -1.5497 },
    { name: 'Sainte-Luce-sur-Loire', lat: 47.2528, lon: -1.4858 },
];
const hubs = [
    { name: 'Gare de Nantes', lat: 47.2155, lon: -1.5421 },
    { name: 'Aéroport Nantes Atlantique', lat: 47.1532, lon: -1.6111 },
    { name: 'Campus Tertre (Université de Nantes)', lat: 47.2375, lon: -1.5530 },
    { name: 'Centre commercial Atlantis', lat: 47.2247, lon: -1.6360 },
    { name: 'Jardin des Plantes', lat: 47.2188, lon: -1.5430 },
    { name: 'CHU de Nantes (Hôtel-Dieu)', lat: 47.2110, lon: -1.5460 },
];

// ── Utilisateurs démo ──
const persons = [
    ['Camille', 'Bernard'], ['Lucas', 'Moreau'], ['Sarah', 'Dubois'], ['Yanis', 'Lefebvre'],
    ['Léa', 'Garcia'], ['Thomas', 'Roux'], ['Inès', 'Fontaine'], ['Hugo', 'Mercier'],
    ['Manon', 'Blanc'], ['Nadia', 'Benali'], ['Paul', 'Girard'], ['Chloé', 'Faure'],
    ['Karim', 'Hamadi'], ['Émile', 'Rousseau'], ['Julie', 'Henry'],
];
const bios = [
    'Habitant·e du quartier, toujours partant·e pour rendre service.',
    'Je bricole, je jardine et je rends volontiers des petits coups de main.',
    'Étudiant·e au campus du Tertre, je covoiture souvent vers la fac.',
    'Jeune retraité·e, disponible en journée pour aider mes voisins.',
    'Parent débordé mais solidaire — l\'entraide locale, j\'adore.',
    'Je fais mes trajets boulot tous les jours, autant les partager.',
    '',
];

interface U { id: string; email: string; name: string; bio: string; avatarUrl: string; isPremium: boolean; isVerified: boolean; commune: typeof communes[number]; }
const users: U[] = persons.map(([first, last], i) => {
    const id = `demo-user-${pad(i + 1)}`;
    return {
        id,
        email: `${first}.${last}.demo@voisigo.fr`.toLowerCase().replace(/[é è ê]/g, 'e'),
        name: `${first} ${last}`,
        bio: pickr(bios),
        avatarUrl: `https://i.pravatar.cc/200?u=${id}`,
        isPremium: i % 5 === 0,
        isVerified: i % 3 !== 0,
        commune: communes[i % communes.length],
    };
});

// ── Trajets ──
const tripDescriptions = [
    'Trajet régulier le matin, ponctuel·le et non-fumeur·se.',
    'Je fais ce trajet plusieurs fois par semaine, deux places dispo.',
    'Petite musique sympa et bonne humeur garanties !',
    'Possibilité de prendre un bagage cabine, dites-le moi à la résa.',
    'Départ à l\'heure pile, merci d\'être ponctuel·le.',
    'Trajet tranquille, on peut faire un crochet si besoin.',
];
const vehicles = ['citadine', 'berline', 'SUV', 'break', 'utilitaire'];
const fuels = ['essence', 'diesel', 'hybride', 'électrique'];

interface T { id: string; driver: U; from: { name: string; lat: number; lon: number }; to: { name: string; lat: number; lon: number }; date: string; price: number; seats: number; desc: string; vehicle: string; fuel: string; }
const trips: T[] = [];
for (let i = 0; i < 20; i++) {
    const driver = users[i % users.length];
    const from = i % 3 === 0 ? pickr(hubs) : driver.commune;
    let to = pickr([...communes, ...hubs]);
    while (to.name === from.name) to = pickr([...communes, ...hubs]);
    trips.push({
        id: `demo-trip-${pad(i + 1)}`,
        driver,
        from,
        to,
        date: inDays(rint(1, 21), rint(7, 19), pickr([0, 15, 30, 45])),
        price: pickr([1.5, 2, 2.5, 3, 4, 5, 6, 8]),
        seats: rint(1, 4),
        desc: pickr(tripDescriptions),
        vehicle: pickr(vehicles),
        fuel: pickr(fuels),
    });
}

// ── Services (offres & demandes) ──
type Cat = 'courses' | 'bricolage' | 'jardinage' | 'visite' | 'autre';
const serviceTpl: Record<Cat, { offer: [string, string][]; request: [string, string][] }> = {
    courses: {
        offer: [
            ['Je fais vos courses au marché de Talensac', 'Je vais au marché ce samedi matin, je rapporte fruits, légumes et fromages à un·e voisin·e.'],
            ['Courses au centre commercial Atlantis', 'Je prends la voiture jeudi, j\'ai de la place pour faire les courses d\'une personne âgée du quartier.'],
        ],
        request: [
            ['Besoin d\'aide pour des courses lourdes', 'Je me remets d\'une entorse, j\'aurais besoin qu\'on me ramène quelques packs d\'eau et provisions.'],
            ['Une baguette et le journal chaque matin ?', 'Pour ma maman de 82 ans : un petit passage boulangerie en semaine, on s\'arrange sur les détails.'],
        ],
    },
    bricolage: {
        offer: [
            ['Montage de meubles IKEA', 'Habitué du tournevis et de la clé Allen, je monte vos meubles rapidement et proprement.'],
            ['Petit coup de perceuse', 'Je fixe étagères, cadres et tringles à rideaux. J\'ai tout le matériel.'],
        ],
        request: [
            ['Réparer un robinet qui fuit', 'Fuite sous l\'évier de la cuisine, je cherche quelqu\'un de bricoleur pour y jeter un œil.'],
            ['Aide pour accrocher une télé au mur', 'Support déjà acheté, il me manque juste un coup de main et une perceuse costaud.'],
        ],
    },
    jardinage: {
        offer: [
            ['Tonte de pelouse ce week-end', 'Je passe avec ma tondeuse, idéal pour les petits jardins de l\'agglo.'],
            ['Taille de haie et désherbage', 'Je remets votre extérieur au propre avant l\'arrivée des beaux jours.'],
        ],
        request: [
            ['Arrosage des plantes pendant mes vacances', 'Absent·e deux semaines en août, je cherche un·e voisin·e pour arroser le balcon.'],
            ['Un coup de main pour retourner la terre', 'Petit potager à préparer, je fournis les outils et le café.'],
        ],
    },
    visite: {
        offer: [
            ['Compagnie pour une balade au Jardin des Plantes', 'Je propose des balades tranquilles aux personnes seules du quartier, l\'après-midi.'],
            ['Un café et un peu de discussion', 'Disponible en journée pour tenir compagnie et papoter autour d\'un thé.'],
        ],
        request: [
            ['Visite de courtoisie à mon grand-père', 'Je cherche une personne bienveillante pour passer voir mon grand-père une fois par semaine.'],
            ['Accompagnement à un rendez-vous médical', 'Besoin d\'être accompagné·e au CHU de Nantes mardi prochain.'],
        ],
    },
    autre: {
        offer: [
            ['Garde d\'animaux quelques heures', 'Je garde volontiers chiens et chats, j\'ai un grand jardin à Orvault.'],
            ['Prêt de perceuse et d\'escabeau', 'Matériel dispo à emprunter pour vos petits travaux, sur l\'agglo.'],
        ],
        request: [
            ['Aide au déménagement (cartons)', 'Quelques cartons à descendre du 3e sans ascenseur, samedi matin. Pizza offerte !'],
            ['Cours de soutien en maths (collège)', 'Pour mon fils en 4e, une à deux heures par semaine, niveau patient demandé.'],
        ],
    },
};
const cats: Cat[] = ['courses', 'bricolage', 'jardinage', 'visite', 'autre'];

interface S { id: string; author: U; type: 'offer' | 'request'; category: Cat; title: string; description: string; commune: typeof communes[number]; price: number; date: string; }
const services: S[] = [];
let sIdx = 0;
for (let i = 0; i < 30; i++) {
    const author = users[(i + 3) % users.length];
    const category = cats[i % cats.length];
    const type: 'offer' | 'request' = i % 2 === 0 ? 'offer' : 'request';
    const tpls = serviceTpl[category][type];
    const [title, description] = tpls[i % tpls.length];
    const commune = author.commune;
    services.push({
        id: `demo-service-${pad(++sIdx)}`,
        author,
        type,
        category,
        title,
        description,
        commune,
        price: pickr([0, 0, 5, 8, 10, 12, 15, 20]),
        date: inDays(rint(0, 14), rint(8, 18), 0),
    });
}

// ── Avis ──
const reviewComments = [
    'Super sympa et ponctuel·le, je recommande !',
    'Très arrangeant·e, trajet agréable.',
    'Personne de confiance, rien à redire.',
    'Service rendu nickel, merci encore !',
    'Communication facile et bonne humeur.',
    'Un vrai coup de main, je referai appel sans hésiter.',
];
interface R { id: string; reviewer: U; target: U; rating: number; comment: string; }
const reviews: R[] = [];
for (let i = 0; i < 14; i++) {
    const reviewer = users[i % users.length];
    let target = users[(i * 3 + 1) % users.length];
    if (target.id === reviewer.id) target = users[(i + 1) % users.length];
    reviews.push({
        id: `demo-review-${pad(i + 1)}`,
        reviewer,
        target,
        rating: pickr([4, 5, 5, 5, 3]),
        comment: pickr(reviewComments),
    });
}

// ── Réservations ──
interface B { id: string; trip: T; passenger: U; seats: number; status: string; }
const bookings: B[] = [];
for (let i = 0; i < 7; i++) {
    const trip = trips[i];
    let passenger = users[(i * 2 + 5) % users.length];
    if (passenger.id === trip.driver.id) passenger = users[(i + 2) % users.length];
    bookings.push({
        id: `demo-booking-${pad(i + 1)}`,
        trip,
        passenger,
        seats: 1,
        status: pickr(['pending', 'confirmed', 'confirmed', 'rejected']),
    });
}

async function main() {
    if (!process.env.DATABASE_URL) {
        throw new Error('DATABASE_URL manquant — configurez votre .env avant de lancer le seed.');
    }
    await initDb();
    const client = await pool.connect();
    const passwordHash = await bcrypt.hash('demo1234', 10);
    try {
        await client.query('BEGIN');

        // Purge des anciennes données démo (ordre FK : enfants d'abord)
        for (const table of ['bookings', 'reviews', 'messages', 'conversations', 'services', 'trips', 'push_subscriptions', 'users']) {
            await client.query(`DELETE FROM ${table} WHERE id LIKE 'demo-%'`);
        }

        for (const u of users) {
            await client.query(
                `INSERT INTO users (id, email, password, name, bio, "avatarUrl", "createdAt", "isPremium", "isVerified")
                 VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
                [u.id, u.email, passwordHash, u.name, u.bio, u.avatarUrl, now(), u.isPremium, u.isVerified]
            );
        }

        for (const t of trips) {
            await client.query(
                `INSERT INTO trips (id, "driverId", "driverName", departure, destination,
                    "departureLat", "departureLon", "destinationLat", "destinationLon",
                    date, price, seats, description, "createdAt", completed, "vehicleType", "fuelType")
                 VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17)`,
                [t.id, t.driver.id, t.driver.name, t.from.name, t.to.name,
                 t.from.lat, t.from.lon, t.to.lat, t.to.lon,
                 t.date, t.price, t.seats, t.desc, now(), false, t.vehicle, t.fuel]
            );
        }

        for (const s of services) {
            await client.query(
                `INSERT INTO services (id, "authorId", "authorName", type, category, title, description,
                    location, lat, lon, date, "createdAt", price)
                 VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)`,
                [s.id, s.author.id, s.author.name, s.type, s.category, s.title, s.description,
                 s.commune.name, s.commune.lat, s.commune.lon, s.date, now(), s.price]
            );
        }

        for (const r of reviews) {
            await client.query(
                `INSERT INTO reviews (id, "reviewerId", "reviewerName", "targetUserId", rating, comment, "createdAt")
                 VALUES ($1,$2,$3,$4,$5,$6,$7)`,
                [r.id, r.reviewer.id, r.reviewer.name, r.target.id, r.rating, r.comment, now()]
            );
        }

        for (const b of bookings) {
            await client.query(
                `INSERT INTO bookings (id, "tripId", "passengerId", "passengerName", seats, status, "createdAt")
                 VALUES ($1,$2,$3,$4,$5,$6,$7)`,
                [b.id, b.trip.id, b.passenger.id, b.passenger.name, b.seats, b.status, now()]
            );
        }

        await client.query('COMMIT');
    } catch (e) {
        await client.query('ROLLBACK');
        throw e;
    } finally {
        client.release();
    }

    console.log('✅ Seed démo terminé :');
    console.log(`   ${users.length} utilisateurs (mot de passe : demo1234)`);
    console.log(`   ${trips.length} trajets · ${services.length} services · ${reviews.length} avis · ${bookings.length} réservations`);
    console.log('   Exemple de connexion :', users[0].email);
    await pool.end();
}

main().catch((e) => {
    console.error('❌ Seed échoué :', e);
    process.exit(1);
});
