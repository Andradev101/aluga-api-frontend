// components/hotel-listing.tsx

import { getAllHotels } from '@/services/hotels-api';
import { HotelCardOut, HotelSearchParams } from '@/types/hotels'; // 🚨 NOVO: Importando HotelSearchParams
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

// Importação da tipagem de filtros (do ActionSheet)
import { HotelFilterParams } from './FilterActionSheet';

// Interface agora requer a prop 'filters'
interface HotelsScreenProps {
    filters: HotelFilterParams;
}

const HotelCard: React.FC<{ hotel: HotelCardOut }> = ({ hotel }) => {

    const displayPrice = hotel.min_price_available || hotel.min_price_general;

    const renderStars = () => {
        const rating = hotel.stars || 0;

        return (
            <Text style={styles.starsContainer}>
                <Text style={styles.starIcon}>★</Text>
                <Text style={styles.starRating}>{rating.toFixed(1)}</Text>
            </Text>
        );
    };

    const handleCardPress = () => {
        router.push({
            pathname: '/hotels/[hotelId]',
            params: {
                hotelId: hotel.id.toString()
            },
        });
    }

    return (
        <TouchableOpacity
            style={styles.cardContainer}
            onPress={handleCardPress}
        >
            <Image
                source={{ uri: hotel.thumbnail || 'https://placehold.co/600x400?text=Sem+Foto' }}
                style={styles.cardImage}
                resizeMode="cover"
            />

            <View style={styles.cardDetails}>

                <View style={styles.infoRow}>
                    <Text style={styles.locationAirbnb}>
                        {hotel.city} - {hotel.neighborhood}
                    </Text>
                </View>

                <Text style={styles.hotelNameAirbnb}>
                    {hotel.name}
                </Text>

                <View style={styles.priceRowAirbnb}>
                    <Text style={styles.priceAirbnb}>
                        {displayPrice ? `R$ ${displayPrice.toFixed(2)} / noite` : 'Preço indisponível'}
                    </Text>
                    {hotel.distance_km !== null && (
                        <Text style={styles.distance}>· {hotel.distance_km.toFixed(1)} km</Text>
                    )}
                </View>

                {renderStars()}
            </View>
        </TouchableOpacity>
    );
};

// O componente agora recebe 'filters'
export default function HotelsScreen({ filters }: HotelsScreenProps) {
    const [hotels, setHotels] = useState<HotelCardOut[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadHotels = async () => {
            try {
                setLoading(true);
                setError(null);

                // 🚨 CORREÇÃO FINAL: Filtra o objeto e faz o CAST para HotelSearchParams.
                // Isso resolve a incompatibilidade de tipo na chamada da API.
                const apiFilters = Object.fromEntries(
                    Object.entries(filters).filter(([, value]) => 
                        value !== null && value !== undefined && value !== ''
                    )
                ) as HotelSearchParams; // <--- Tipagem alterada para o tipo esperado pela API
                
                // Chamada à API com os filtros limpos
                const hotelList = await getAllHotels(apiFilters);

                setHotels(hotelList);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Erro ao carregar hotéis.');
                setHotels([]);
            } finally {
                setLoading(false);
            }
        };

        // O useEffect roda sempre que 'filters' (o objeto de estado) muda
        loadHotels();
    }, [filters]); 

    if (loading) {
        return (
            <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color="#1E3A8A" />
                <Text style={styles.loadingText}>Buscando os melhores hotéis...</Text>
            </View>
        );
    }

    if (error) {
        return (
            <View style={styles.centerContainer}>
                <Text style={styles.errorText}>❌ Ocorreu um erro: {error}</Text>
                <Text style={styles.errorText}>Tente verificar a conexão ou o status do backend.</Text>
            </View>
        );
    }

    if (hotels.length === 0) {
        return (
            <View style={styles.centerContainer}>
                <Text style={styles.errorText}>Nenhum hotel encontrado com os filtros atuais.</Text>
                <TouchableOpacity onPress={() => {}}>
                    <Text style={styles.resetButtonText}>Limpar Filtros</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <FlatList
            data={hotels}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => <HotelCard hotel={item} />}
            contentContainerStyle={styles.listContent}
            ListHeaderComponent={
                <Text style={styles.headerTitle}>Resultados da Busca</Text>
            }
        />
    );
}

const styles = StyleSheet.create({
    listContent: {
        paddingHorizontal: 16,
        paddingTop: 10,
        paddingVertical: 10,
        backgroundColor: '#f8f8f8',
    },
    headerTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#333',
        marginVertical: 10,
    },
    cardContainer: {
        backgroundColor: 'white',
        borderRadius: 15,
        marginBottom: 20,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
    },
    cardImage: {
        width: '100%',
        height: 250,
        borderTopLeftRadius: 15,
        borderTopRightRadius: 15,
        marginBottom: 8,
    },
    cardDetails: {
        flex: 1,
        paddingHorizontal: 12,
        paddingBottom: 12,
        position: 'relative',
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'center',
        marginBottom: 2,
    },
    priceRowAirbnb: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 5,
    },
    locationAirbnb: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1f2937',
        flexShrink: 1,
        marginRight: 80,
    },
    hotelNameAirbnb: {
        fontSize: 14,
        color: '#6b7280',
        marginBottom: 2,
        fontWeight: '400',
    },
    priceAirbnb: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1f2937',
        marginRight: 4,
    },
    starsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'transparent',
        position: 'absolute',
        top: 8,
        right: 12,
    },
    starIcon: {
        fontSize: 14,
        color: '#1f2937',
        marginRight: 4,
    },
    starRating: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1f2937',
    },
    distance: {
        fontSize: 14,
        color: '#6b7280',
        marginLeft: 4,
        fontWeight: '400',
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
        padding: 20,
    },
    loadingText: {
        marginTop: 10,
        fontSize: 16,
        color: '#6b7280',
    },
    errorText: {
        textAlign: 'center',
        color: '#dc2626',
        fontSize: 16,
        marginBottom: 10,
    },
    resetButtonText: {
        color: '#2563eb',
        marginTop: 10,
        fontWeight: 'bold',
    }
});