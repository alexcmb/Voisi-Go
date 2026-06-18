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
       