// components/hotel-listing.tsx

import { getAllHotels } from '@/services/hotels-api'; // Assumindo o caminho correto
import { HotelCardOut } from '@/types/hotels'; // Interface de card
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Button, ButtonText } from './ui/button';

// --- Componente de Card (Item da Lista) ---
const HotelCard: React.FC<{ hotel: HotelCardOut }> = ({ hotel }) => {

    // Obtém o preço a ser exibido (disponível > geral)
    const displayPrice = hotel.min_price_available || hotel.min_price_general;

    // Renderiza estrelas com base no valor
    const renderStars = () => {
        const starsCount = Math.round(hotel.stars || 0);
        const starIcons = '⭐️'.repeat(starsCount);
        return <Text style={styles.stars}>{starIcons} ({hotel.stars?.toFixed(1)})</Text>;
    };


    // Função para lidar com o clique de reserva e enviar os parâmetros
  const handleReserve = (e: any) => {
    // Importante: impede que o TouchableOpacity pai (que navega para os detalhes do hotel) seja acionado
    e.stopPropagation(); 
    
    // Configura um preço e dados de quarto MOCKADOS para que a tela de Reserva tenha o que exibir.
    // Em um fluxo real, esses dados viriam de uma API ou de um formulário de filtro.
    const MOCK_ROOM_ID = 222; 
    const MOCK_ROOM_NAME = 'Quarto Duplo Econômico';
    const MOCK_CHECKIN = '2025-12-20'; // Formato ISO para facilitar o POST
    const MOCK_CHECKOUT = '2025-12-30';
    // const MOCK_TOTAL_PRICE = displayPrice ? `R$ ${displayPrice.toFixed(2)}` : 'Preço a Confirmar';
    const MOCK_TOTAL_PRICE = 'R$ 1.200,00';

    router.push({
        pathname: '/criarReserva',
        params: {
            // ✅ DADOS DO HOTEL
            hotelName: hotel.name,
            hotelId: hotel.id.toString(), // Converter para string é uma boa prática em params
            
            // ✅ DADOS DO QUARTO/PREÇO (Mockados por enquanto)
            roomName: MOCK_ROOM_NAME,
            roomId: MOCK_ROOM_ID.toString(),
            total: MOCK_TOTAL_PRICE,
            
            // ✅ DADOS DE DATA (Mockados por enquanto)
            checkin: MOCK_CHECKIN,
            checkout: MOCK_CHECKOUT,
        },
    });
  };

    return (
        <TouchableOpacity
            style={styles.cardContainer}
            // TODO: implementar tela de detalhes do hotel.
            // onPress={() => router.push(`/hotels/${hotel.id}`)}
        >
            <Image
                source={{ uri: hotel.thumbnail || 'https://placehold.co/100x100?text=Sem+Foto' }}
                style={styles.thumbnail}
            />
            <View style={styles.cardDetails}>
                <Text style={styles.hotelName}>{hotel.name}</Text>
                <Text style={styles.location}>{hotel.city} - {hotel.neighborhood}</Text>
                <View style={styles.infoRow}>
                    {renderStars()}
                    {hotel.distance_km !== null && (
                        <Text style={styles.distance}>| {hotel.distance_km.toFixed(1)} km</Text>
                    )}
                </View>
                <Text style={styles.price}>
                    {displayPrice ? `A partir de R$ ${displayPrice.toFixed(2)}` : 'Preço indisponível'}
                </Text>
                {/* 🔹 Novo botão para reservas */}
                <Button
                    className="bg-blue-600 hover:bg-blue-700"
                    onPress={handleReserve}
        >
                <ButtonText className="text-white font-semibold">📅 Fazer Reserva</ButtonText>
            </Button>
        </View>
    </TouchableOpacity >
  );
};


// --- Tela Principal de Hotéis ---
export default function HotelsScreen() {
    const [hotels, setHotels] = useState<HotelCardOut[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadHotels = async () => {
            try {
                setLoading(true);
                setError(null);

                // Chamada à API com filtros padrão (ou sem filtros)
                const hotelList = await getAllHotels({
                    sort: 'popularity',
                    size: 20
                });

                setHotels(hotelList);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Erro ao carregar hotéis.');
                setHotels([]);
            } finally {
                setLoading(false);
            }
        };

        loadHotels();
    }, []);

    if (loading) {
        return (
            <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color="#f97316" />
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
                <TouchableOpacity onPress={() => {/* Lógica para resetar filtros */ }}>
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
            ListHeaderComponent={<Text style={styles.headerTitle}>Resultados da Busca</Text>}
        />
    );
}



// --- Estilos ---
const styles = StyleSheet.create({
    listContent: {
        paddingHorizontal: 16,
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
        flexDirection: 'row',
        backgroundColor: 'white',
        borderRadius: 8,
        marginBottom: 10,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 2,
    },
    thumbnail: {
        width: 100,
        height: 100,
        marginRight: 10,
    },
    cardDetails: {
        flex: 1,
        padding: 10,
        justifyContent: 'center',
    },
    hotelName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1f2937',
        marginBottom: 2,
    },
    location: {
        fontSize: 12,
        color: '#6b7280',
        marginBottom: 5,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 3,
    },
    stars: {
        fontSize: 14,
        color: '#f59e0b',
    },
    distance: {
        fontSize: 12,
        color: '#6b7280',
        marginLeft: 5,
    },
    price: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#dc2626', // Vermelho para destacar o preço
        marginTop: 5,
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