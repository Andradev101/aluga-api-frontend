import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Dimensions,
    FlatList,
    Image,
    NativeScrollEvent,
    NativeSyntheticEvent,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button, ButtonText } from '@/components/ui/button';
import { getHotelDetails } from '@/services/hotels-api';
import { HotelDetailOut, MediaOut } from '@/types/hotels';

const { width: screenWidth } = Dimensions.get('window');
const CAROUSEL_WIDTH = screenWidth;
// Aumentei a altura para corresponder mais ao seu exemplo visual
const CAROUSEL_HEIGHT = screenWidth * 0.8; 
// O valor da sobreposição deve ser a diferença entre a altura do topo do card e a borda.
// Se o marginTop for -20, o card sobe 20px.
const OVERLAP_HEIGHT = 20;

const Pagination: React.FC<{ dataLength: number, activeIndex: number }> = ({ dataLength, activeIndex }) => {
    return (
        <View style={styles.paginationContainer}>
            {Array.from({ length: dataLength }).map((_, index) => (
                <View
                    key={index}
                    style={[
                        styles.dot,
                        index === activeIndex ? styles.activeDot : null,
                    ]}
                />
            ))}
        </View>
    );
};

const FixedFooter: React.FC<{ hotel: HotelDetailOut }> = ({ hotel }) => {
    return (
        <SafeAreaView style={styles.fixedFooterContainer} edges={['bottom']}>
            <View style={styles.footer}>
                <View>
                    <Text style={styles.priceLabel}>Preço por noite</Text>
                    <Text style={styles.price}>
                        {hotel.min_price_general ? `R$ ${hotel.min_price_general.toFixed(2)}` : 'Preço indisponível'}
                    </Text>
                </View>
                <Button
                    variant="solid" 
                    size="md"
                    action="primary" 
                    onPress={() => router.push({ pathname: '/criarReserva', params: { hotelId: hotel.id.toString(), hotelName: hotel.name } })}
                    style={styles.reserveButton}
                >
                    <ButtonText style={styles.reserveButtonText}>Reservar Agora</ButtonText>
                </Button>
            </View>
        </SafeAreaView>
    );
}

export default function HotelDetailsScreen() { 
    const { hotelId, hotelName } = useLocalSearchParams<{ hotelId: string, hotelName?: string }>();
    const insets = useSafeAreaInsets();

    const [hotel, setHotel] = useState<HotelDetailOut | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeIndex, setActiveIndex] = useState(0);

    useEffect(() => {
        const loadHotel = async () => {
            if (!hotelId) {
                setError("ID do hotel não fornecido na URL.");
                setLoading(false);
                return;
            }
            try {
                setLoading(true);
                setError(null);
                const details = await getHotelDetails(hotelId);
                setHotel(details);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Erro ao carregar detalhes do hotel.');
                setHotel(null);
            } finally {
                setLoading(false);
            }
        };
        loadHotel();
    }, [hotelId]);

    const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
        const contentOffsetX = event.nativeEvent.contentOffset.x;
        const index = Math.round(contentOffsetX / CAROUSEL_WIDTH);
        setActiveIndex(index);
    };

    const renderCarouselItem = ({ item }: { item: MediaOut }) => {
        return (
            <Image
                source={{ uri: item.url || 'https://placehold.co/600x400?text=Sem+Imagem' }}
                style={styles.carouselImage}
                resizeMode="cover"
            />
        );
    };

    if (loading) {
        return (
            <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color="#dc2626" />
                <Text style={styles.loadingText}>Carregando detalhes do {hotelName || 'hotel'}...</Text>
            </View>
        );
    }

    if (error || !hotel) {
        return (
            <View style={styles.centerContainer}>
                <Text style={styles.errorText}>❌ Ocorreu um erro: {error || 'Hotel não encontrado.'}</Text>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Text style={styles.backButtonText}>⬅️ Voltar</Text>
                </TouchableOpacity>
            </View>
        );
    }

    let imagesToDisplay: MediaOut[] = [];

    if (hotel.thumbnail) {
        imagesToDisplay.push({ id: 0, url: hotel.thumbnail, kind: 'image' } as MediaOut);
    }

    const mediaImages = hotel.media?.filter(m => m.kind === 'image') ?? [];

    for (const mediaItem of mediaImages) {
        if (mediaItem.url !== hotel.thumbnail) {
            imagesToDisplay.push(mediaItem);
        }
    }

    if (imagesToDisplay.length === 0) {
        imagesToDisplay.push({ id: -1, url: 'https://placehold.co/600x400?text=Sem+Imagens', kind: 'image' } as MediaOut);
    }

    return (
        <View style={styles.fullScreenContainer}>
            <ScrollView 
                style={styles.container}
                contentContainerStyle={{ 
                    // Garante que o conteúdo role até o fim, incluindo espaço para o footer fixo
                    paddingBottom: insets.bottom + 100 
                }}
            >
                <View style={styles.carouselWrapper}>
                    <FlatList
                        data={imagesToDisplay}
                        renderItem={renderCarouselItem}
                        keyExtractor={(item) => item.id ? item.id.toString() : item.url}
                        horizontal
                        pagingEnabled
                        showsHorizontalScrollIndicator={false}
                        onScroll={handleScroll}
                        scrollEventThrottle={16}
                    />
                    {imagesToDisplay.length > 1 && (
                        <Pagination dataLength={imagesToDisplay.length} activeIndex={activeIndex} />
                    )}
                </View>

                {/* Aplica o marginTop negativo para o card de detalhes sobrepor a imagem */}
                <View style={[styles.detailsContent, { marginTop: -OVERLAP_HEIGHT }]}> 
                    <Text style={styles.hotelName}>{hotel.name}</Text>
                    {(hotel.city || hotel.neighborhood) && (
                        <Text style={styles.location}>{hotel.city || ''}{hotel.neighborhood ? ` - ${hotel.neighborhood}` : ''}</Text>
                    )}
                    <Text style={styles.stars}>⭐ {hotel.stars?.toFixed(1) || '0.0'}</Text>

                    <View style={styles.divider} />

                    <Text style={styles.sectionTitle}>Descrição</Text>
                    <Text style={styles.descriptionText}>{hotel.description || 'Descrição não disponível.'}</Text>

                    <View style={styles.divider} />

                    <Text style={styles.sectionTitle}>Comodidades</Text>
                    <View style={styles.amenitiesContainer}>
                        {hotel.amenities?.map(amenity => (
                            <Text key={amenity.id} style={styles.amenityText}>
                                {amenity.label}
                            </Text>
                        ))}
                        {(!hotel.amenities || hotel.amenities.length === 0) && (
                            <Text style={styles.descriptionText}>Nenhuma comodidade listada.</Text>
                        )}
                    </View>
                </View>
            </ScrollView>

            <FixedFooter hotel={hotel} />
        </View>
    );
}

const styles = StyleSheet.create({
    fullScreenContainer: {
        flex: 1,
        backgroundColor: '#f8f8f8',
    },
    container: {
        flex: 1,
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
    },
    loadingText: {
        marginTop: 10,
        fontSize: 16,
        color: '#6b7280',
    },
    errorText: {
        textAlign: 'center',
        color: '#dc2626',
        fontSize: 18,
    },
    backButton: {
        marginTop: 15,
        padding: 10,
        backgroundColor: '#eee',
        borderRadius: 5,
    },
    backButtonText: {
        color: '#333',
        fontWeight: 'bold',
    },
    carouselWrapper: {
        position: 'relative',
        width: CAROUSEL_WIDTH,
        height: CAROUSEL_HEIGHT,
        // *** MUDANÇA CHAVE: REMOVEMOS O 'overflow: hidden' ***
        // overflow: 'hidden', // REMOVIDO para permitir a sobreposição
        backgroundColor: '#fff', // Cor de fallback
    },
    carouselImage: {
        width: CAROUSEL_WIDTH, 
        height: CAROUSEL_HEIGHT,
    },
    paginationContainer: {
        position: 'absolute',
        // Ajuste a posição: CAROUSEL_HEIGHT - OVERLAP_HEIGHT - 30 (cerca de 30px acima da borda do card)
        bottom: OVERLAP_HEIGHT + 10, 
        alignSelf: 'center',
        flexDirection: 'row',
        zIndex: 10,
        backgroundColor: 'rgba(0,0,0,0.4)',
        borderRadius: 15,
        paddingHorizontal: 8,
        paddingVertical: 4,
    },
    dot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: 'rgba(255, 255, 255, 0.5)',
        marginHorizontal: 3,
    },
    activeDot: {
        backgroundColor: '#fff',
    },
    detailsContent: {
        padding: 16,
        paddingTop: 20, 
        backgroundColor: '#fff',
        // O valor do borderRadius deve ser igual ou maior que a sobreposição para suavizar
        borderTopLeftRadius: 20, 
        borderTopRightRadius: 20,
    },
    hotelName: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#1f2937',
        marginBottom: 4,
    },
    location: {
        fontSize: 18,
        color: '#6b7280',
        marginBottom: 8,
    },
    stars: {
        fontSize: 18,
        fontWeight: '600',
        color: '#1f2937',
        marginBottom: 10,
    },
    divider: {
        height: 1,
        backgroundColor: '#e5e7eb',
        marginVertical: 15,
    },
    sectionTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#1f2937',
        marginTop: 10,
        marginBottom: 8,
    },
    descriptionText: {
        fontSize: 16,
        color: '#374151',
        lineHeight: 24,
        marginBottom: 15,
    },
    amenitiesContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginBottom: 20,
    },
    amenityText: {
        fontSize: 14,
        backgroundColor: '#f3f4f6',
        color: '#374151',
        paddingVertical: 5,
        paddingHorizontal: 10,
        borderRadius: 15,
        marginRight: 8,
        marginBottom: 8,
        fontWeight: '500',
    },
    fixedFooterContainer: {
        position: 'absolute',
        bottom: 0,
        width: '100%',
        backgroundColor: '#fff', 
        borderTopWidth: 1,
        borderTopColor: '#e5e7eb',
        paddingHorizontal: 16,
        paddingTop: 10,
        zIndex: 5,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingBottom: 10,
    },
    priceLabel: {
        fontSize: 14,
        color: '#6b7280',
        fontWeight: '500',
    },
    price: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1f2937',
    },
    reserveButton: {
        minWidth: 150,
        backgroundColor: '#dc2626',
        height: 48,
        justifyContent: 'center',
        borderRadius: 12,
    },
    reserveButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    }
});