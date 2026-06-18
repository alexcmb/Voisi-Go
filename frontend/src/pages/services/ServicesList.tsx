import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../../components/Layout';
import AddressInput from '../../components/AddressInput';
import { calculateDistance } from '../../utils/geo';
import { API_BASE_URL } from '../../lib/api';
import { CATEGORY_EMOJIS } from '../../types';
import type { Service, ServiceCategory } from '../../types';
import { useToast, useConfirm } from '../../context/UIContext';

type TypeFilter = 'all' | 'request' | 'offer';
type PriceFilter = 'all' | 'free' | 'under5' | 'under10';

export default function ServicesList() {
    const [services, setServices] = useState<Service[]>([]);
    const [loading, setLoading] = useState(true);
    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
    const token = localStorage.getItem('token');
    const toast = useToast();
    const confirm = useConfirm();

    // Filters
    const [searchQuery, setSearchQuery] = useState('');
    const [locationFilter, setLocationFilter] = useState<{ label: string; lat?: number; lon?: number }>({ label: '' });
    const [radiusFilter, setRadiusFilter] = useState(10);
    const [typeFilter, setTypeFilter] = useState<TypeFilter>('all');
    const [categoryFilter, setCategoryFilter] = useState<ServiceCategory | 'all'>('all');
    const [priceFilter, setPriceFilter] = useState<PriceFilter>('all');

    useEffect(() => {
        fetch(`${API_BASE_URL}/api/services`)
            .then(res => res.json())
            .then(response => {
                setServices(response.data);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, []);

    const handleDelete = async (serviceId: string, e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        const ok = await confirm('Supprimer cette annonce définitivement ?', {
            title: 'Supprimer l\'annonce',
            confirmLabel: 'Supprimer',
            danger: true,
        });
        if (!ok) return;
        try {
            const res = await fetch(`${API_BASE_URL}/api/services/${serviceId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` },
            });
            if (res.ok) {
                setServices(prev => prev.filter(s => s.id !== serviceId));
                toast.success('Annonce supprimée');
            } else {
                const data = await res.json();
                toast.error(data.message || 'Erreur lors de la suppression');
            }
        } catch {
            toast.error('Erreur réseau');
        }
    };

    const filtersActive = typeFilter !== 'all' || categoryFilter !== 'all' || priceFilter !== 'all';
    const resetFilters = () => { setTypeFilter('all'); setCategoryFilter('all'); setPriceFilter('all'); };

    const filteredServices = services.filter(service => {
        // Localisation (rayon autour d'un point)
        if (locationFilter.lat && locationFilter.lon) {
            if (service.lat && service.lon) {
                if (calculateDistance(locationFilter.lat, locationFilter.lon, service.lat, service.lon) > radiusFilter) return false;
            } else return false;
        }
        // Recherche texte
        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            const text = `${service.title} ${service.description} ${service.authorName} ${service.location ?? ''}`;
            if (!text.toLowerCase().includes(q)) return false;
        }
        // Type
        if (typeFilter !== 'all' && service.type !== typeFilter) return false;
        // Catégorie
        if (categoryFilter !== 'all' && service.category !== categoryFilter) return false;
        // Prix
        if (priceFilter !== 'all') {
            const price = service.price ?? 0;
            if (priceFilter === 'free' && price !== 0) return false;
            if (priceFilter === 'under5' && price > 5) return false;
            if (priceFilter === 'under10' && price > 10) return false;
        }
        return true;
    });

    return (
        <Layout>
            <div className="p-4">
                <div className="max-w-4xl mx-auto">
                    <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                        <h2 className="text-3xl font-bold text-gray-800">Entraide entre voisins</h2>
                        <Link to="/services/create" className="bg-secondary-600 text-white px-6 py-3 rounded-lg font-bold text-lg hover:bg-secondary-700 transition shadow-md">
                            + Publier une annonce
                        </Link>
                    </div>

                    {/* Search */}
                    <div className="mb-4">
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg">🔍</span>
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                placeholder="Rechercher une annonce, un voisin..."
                                className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl text-lg focus:ring-4 focus:ring-primary-100 focus:border-primary-400 transition-all bg-white shadow-sm"
                            />
                            {searchQuery && (
                                <button onClick={() => setSearchQuery('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-lg">✕</button>
                            )}
                        </div>
                    </div>

                    {/* Filters */}
                    <div className="bg-white rounded-xl border border-gray-200 p-4 mb-8 shadow-sm">
                        <div className="flex flex-col gap-4">
                            <div className="flex flex-col md:flex-row gap-4 items-center border-b pb-4 mb-2">
                                <div className="flex-1 w-full">
                                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Localisation</label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-3 z-10">📍</span>
                                        <div className="pl-6">
                                            <AddressInput
                                                value={locationFilter.label}
                                                onChange={(addr, lat, lon) => setLocationFilter({ label: addr, lat, lon })}
                                                placeholder="Rechercher autour de..."
                                                required={false}
                                            />
                                        </div>
                                    </div>
                                </div>
                                {locationFilter.lat && (
                                    <div className="flex items-center gap-3 bg-primary-50 p-2 rounded-lg min-w-[200px]">
                                        <span className="text-sm font-semibold text-primary-700 whitespace-nowrap">Rayon: {radiusFilter} km</span>
                                        <input type="range" min="1" max="50" value={radiusFilter} onChange={e => setRadiusFilter(Number(e.target.value))} className="w-full accent-primary-600 cursor-pointer" />
                                    </div>
                                )}
                            </div>
                            <div className="flex flex-wrap gap-4 items-center">
                                <div className="flex-1 min-w-[140px]">
                                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Type</label>
                                    <select value={typeFilter} onChange={e => setTypeFilter(e.target.value as TypeFilter)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:ring-2 focus:ring-primary-200 focus:border-primary-400">
                                        <option value="all">Tous</option>
                                        <option value="request">🙋 Demande d'aide</option>
                                        <option value="offer">💪 Offre d'aide</option>
                                    </select>
                                </div>
                                <div className="flex-1 min-w-[140px]">
                                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Catégorie</label>
                                    <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value as ServiceCategory | 'all')} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:ring-2 focus:ring-primary-200 focus:border-primary-400">
                                        <option value="all">Toutes</option>
                                        <option value="courses">🛒 Courses</option>
                                        <option value="bricolage">🔨 Bricolage</option>
                                        <option value="jardinage">🌻 Jardinage</option>
                                        <option value="visite">☕ Visite</option>
                                        <option value="autre">✨ Autre</option>
                                    </select>
                                </div>
                                <div className="flex-1 min-w-[140px]">
                                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Prix</label>
                                    <select value={priceFilter} onChange={e => setPriceFilter(e.target.value as PriceFilter)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:ring-2 focus:ring-primary-200 focus:border-primary-400">
                                        <option value="all">Tous les prix</option>
                                        <option value="free">Gratuit</option>
                                        <option value="under5">≤ 5 €</option>
                                        <option value="under10">≤ 10 €</option>
                                    </select>
                                </div>
                                {filtersActive && (
                                    <button onClick={resetFilters} className="text-sm text-red-500 hover:text-red-700 font-medium mt-4 sm:mt-0">
                                        ✕ Réinitialiser
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    {!loading && (searchQuery || filtersActive || locationFilter.lat) && (
                        <div className="text-sm text-gray-500 mb-4">
                            {filteredServices.length} résultat{filteredServices.length !== 1 ? 's' : ''} trouvé{filteredServices.length !== 1 ? 's' : ''}
                        </div>
                    )}

                    {loading ? (
                        <div className="text-center py-10 text-xl text-gray-500">Chargement...</div>
                    ) : services.length === 0 ? (
                        <div className="bg-white p-8 rounded-xl shadow text-center">
                            <p className="text-xl text-gray-600 mb-4">Aucune annonce pour le moment.</p>
                            <Link to="/services/create" className="text-secondary-600 font-bold hover:underline text-lg">Lancez le mouvement !</Link>
                        </div>
                    ) : filteredServices.length === 0 ? (
                        <div className="bg-white p-8 rounded-xl shadow text-center text-gray-500">
                            Aucune annonce ne correspond à vos critères.
                        </div>
                    ) : (
                        <div className="grid gap-4">
                            {filteredServices.map(service => (
                                <Link
                                    key={service.id}
                                    to={`/services/${service.id}`}
                                    className={`bg-white p-6 rounded-xl shadow-md border-l-4 ${service.type === 'request' ? 'border-orange-400' : 'border-secondary-500'} hover:shadow-lg transition-shadow block group`}
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <span className={`px-3 py-1 rounded-full text-sm font-bold uppercase ${service.type === 'request' ? 'bg-orange-100 text-orange-800' : 'bg-secondary-100 text-secondary-800'}`}>
                                            {service.type === 'request' ? '🙋 Demande' : '🤲 Proposition'}
                                        </span>
                                        <div className="flex items-center gap-2">
                                            <span className="text-2xl" title={service.category}>{CATEGORY_EMOJIS[service.category]}</span>
                                            {currentUser?.id && service.authorId === currentUser.id && (
                                                <button
                                                    onClick={(e) => handleDelete(service.id, e)}
                                                    className="text-red-400 hover:text-red-600 hover:bg-red-50 p-1.5 rounded-lg transition-colors"
                                                    title="Supprimer mon annonce"
                                                >
                                                    🗑️
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-secondary-700 transition-colors">{service.title}</h3>
                                    {service.location && (
                                        <div className="flex items-center text-gray-500 mb-2">
                                            <span className="mr-1">📍</span>
                                            <span className="text-sm">{service.location}</span>
                                        </div>
                                    )}
                                    <p className="text-gray-600 mb-4 line-clamp-2">{service.description}</p>

                                    <div className="flex justify-between items-end border-t pt-4 mt-2">
                                        <div className="text-gray-500 text-sm">
                                            <span className="font-bold text-lg text-secondary-700 block mb-1">
                                                {service.price && service.price > 0 ? `${service.price} €` : 'Gratuit ✨'}
                                            </span>
                                            Par <span className="font-semibold">{service.authorName}</span> • {new Date(service.date).toLocaleDateString()}
                                        </div>
                                        <span className="text-secondary-600 text-sm font-semibold group-hover:translate-x-1 transition-transform">
                                            Voir l'annonce →
                                        </span>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </Layout>
    );
}
