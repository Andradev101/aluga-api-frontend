import { Button, ButtonText } from '@/components/ui/button';
import { HStack } from '@/components/ui/hstack';
import { VStack } from '@/components/ui/vstack';
import { listAmenities } from '@/services/amenities-api';
import { createFullHotel } from '@/services/hotels-api';
import { AmenityOut } from '@/types/amenities';
import { AmenityIn, HotelDetailOut, HotelIn, MediaIn, RoomIn } from '@/types/hotels';

import AmenitiesSelector from '@/components/AmenitiesSelector';

// --- ÍCONES LUCIDE ---
import {
    ArrowLeft,
    BedDouble,
    CheckCircle,
    Image,
    MapPin,
    PlusCircle,
    Sparkles,
    Trash2
} from 'lucide-react-native';

import { router } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// --- ESTADOS INICIAIS (LIMPOS) ---
const INITIAL_ROOM: RoomIn = {
    name: '',
    room_type: '',
    capacity: 0,
    base_price: 0.0,
    total_units: 0,
    amenities: [],
};

const INITIAL_MEDIA: MediaIn = {
    url: '',
    kind: 'MAIN',
};

const INITIAL_STATE: HotelIn = {
    name: '',
    description: null,
    city: '',
    neighborhood: null,
    address: null,
    latitude: 0,
    longitude: 0,
    policies: null,
    amenities: [],
    media: [{ url: '', kind: 'MAIN' }],
    rooms: [INITIAL_ROOM],
};

// --- PALETA DE CORES "Aluga Aí" ---
const AppColors = {
    PRIMARY: '#FF7F00',
    SECONDARY: '#FF9933',
    WHITE: '#FFFFFF',
    BLACK: '#111827',
    LIGHT_GRAY: '#F3F4F6',
    MEDIUM_GRAY: '#E5E7EB',
    TEXT_GRAY: '#4B5563',
    DANGER: '#EF4444',
    SUCCESS: '#10B981',
};


export default function CreateHotelScreen() {
    const [formData, setFormData] = useState<HotelIn>(INITIAL_STATE);
    const [loading, setLoading] = useState(false);
    
    const [allAmenities, setAllAmenities] = useState<AmenityOut[]>([]);
    const [amenitiesLoading, setAmenitiesLoading] = useState(true);

    useEffect(() => {
        const loadAmenities = async () => {
            try {
                const data = await listAmenities(0, 100);
                setAllAmenities(data);
            } catch (error) {
                console.error("Erro ao carregar amenidades:", error);
                Alert.alert("Erro de Conexão", "Não foi possível carregar a lista de comodidades do servidor. Tente novamente.");
            } finally {
                setAmenitiesLoading(false);
            }
        };
        loadAmenities();
    }, []);

    const handleChange = (key: keyof HotelIn, value: string | number | null) => {
        const finalValue = typeof value === 'string' && value.trim() === '' ? null : value;
        
        if (key === 'latitude' || key === 'longitude') {
            const numValue = parseFloat(value as string) || 0;
            setFormData(prev => ({ ...prev, [key]: numValue }));
        } else {
            setFormData(prev => ({ ...prev, [key]: finalValue }));
        }
    };
    
    const handleAmenitiesSelection = (selectedIds: number[]) => {
        setFormData(prev => ({ ...prev, amenities: selectedIds }));
    };
    
    const handleRoomChange = (index: number, key: keyof RoomIn, value: any) => {
        setFormData(prev => {
            const newRooms = [...prev.rooms];
            newRooms[index] = { ...newRooms[index], [key]: value };
            return { ...prev, rooms: newRooms };
        });
    };
    
    const handleAddRoom = () => {
        setFormData(prev => ({ 
            ...prev, 
            rooms: [...prev.rooms, { ...INITIAL_ROOM, name: '' }] 
        }));
    };
    
    const handleRemoveRoom = (index: number) => {
        if (formData.rooms.length <= 1) {
            Alert.alert("Atenção", "O hotel deve ter pelo menos um tipo de quarto cadastrado.");
            return;
        }
        setFormData(prev => ({ ...prev, rooms: prev.rooms.filter((_, i) => i !== index) }));
    };
    
    const handleMediaChange = (index: number, key: keyof MediaIn, value: string | null) => {
        setFormData(prev => {
            const newMedia = [...prev.media];
            const finalValue = typeof value === 'string' && value.trim() === '' ? null : value;
            newMedia[index] = { ...newMedia[index], [key]: finalValue };
            return { ...prev, media: newMedia };
        });
    };
    
    const handleAddMedia = () => {
        setFormData(prev => ({ ...prev, media: [...prev.media, { url: '', kind: 'GALLERY' }] }));
    };
    
    const handleRemoveMedia = (index: number) => {
        if (index === 0) {
            Alert.alert("Atenção", "A primeira mídia é a foto principal e não pode ser removida.");
            return;
        }
        setFormData(prev => ({ ...prev, media: prev.media.filter((_, i) => i !== index) }));
    };
    
    const handleCreate = async () => {
        const isRoomValid = formData.rooms.every(room => 
            room.name && room.name.trim() !== '' && 
            room.room_type && room.room_type.trim() !== '' && 
            room.base_price > 0 &&
            room.capacity > 0 &&
            room.total_units > 0
        );
        
        if (!formData.name || formData.name.trim() === '' || !formData.city || formData.city.trim() === '' || formData.rooms.length === 0 || !isRoomValid) {
            Alert.alert("Erro de Validação", "O Nome do Hotel, Cidade e todos os Tipos de Quarto (Nome, Tipo, Preço, Capacidade e Unidades) são campos obrigatórios.");
            return;
        }

        // Validação das coordenadas geográficas
        if (formData.latitude < -90 || formData.latitude > 90 || formData.longitude < -180 || formData.longitude > 180) {
            Alert.alert("Erro de Validação", "As coordenadas geográficas (Latitude: -90 a 90, Longitude: -180 a 180) estão fora do intervalo válido.");
            return;
        }

        setLoading(true);
        try {
            const newHotel: HotelDetailOut = await createFullHotel(formData);
            
            Alert.alert(
                "Hotel Cadastrado!", 
                `O Hotel '${newHotel.name}' (ID: ${newHotel.id}) foi incluído no catálogo com sucesso.`,
                [{ text: "Ver Hotéis", onPress: () => router.replace('/') }]
            );
            
        } catch (error) {
            console.error("Erro no cadastro completo:", error);
            const errorMessage = error instanceof Error ? error.message : "Erro desconhecido";
            Alert.alert("Erro ao Cadastrar", `Não foi possível incluir o hotel no catálogo. Detalhes: ${errorMessage}`);
        } finally {
            setLoading(false);
        }
    };
    
    const renderSelectedAmenities = (selectedIds: number[]) => {
        if (selectedIds.length === 0) {
            return <Text style={styles.noAmenitiesText}>Nenhuma comodidade selecionada.</Text>;
        }

        const selectedLabels = allAmenities
            .filter(a => selectedIds.includes(a.id))
            .map(a => a.label)
            .sort();

        return (
            <View style={styles.amenitiesDisplayContainer}>
                <Text style={styles.selectedAmenitiesTitle}>Comodidades Selecionadas ({selectedLabels.length}):</Text>
                <View style={{flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 5}}>
                    {selectedLabels.map(label => (
                        <View key={label} style={styles.selectedAmenityPill}>
                            <CheckCircle size={14} color={AppColors.SUCCESS} />
                            <Text style={styles.selectedAmenityItem}>{label}</Text>
                        </View>
                    ))}
                </View>
            </View>
        );
    };

    const RoomAmenitiesSelectorWrapper = ({ roomIndex }: { roomIndex: number }) => {
        const currentRoomAmenities = formData.rooms[roomIndex].amenities;
        const selectedIds = currentRoomAmenities.map(a => (a as { id: number }).id);

        const handleRoomAmenitiesSelection = useCallback((newIds: number[]) => {
            const newAmenitiesArray: AmenityIn[] = newIds.map(id => ({ id: id } as AmenityIn));
            
            handleRoomChange(roomIndex, 'amenities', newAmenitiesArray);
        }, [roomIndex]);

        return (
            <VStack space="sm">
                <AmenitiesSelector
                    allAmenities={allAmenities}
                    selectedAmenityIds={selectedIds}
                    onSelectionChange={handleRoomAmenitiesSelection}
                    title={`Comodidades Específicas do Quarto #${roomIndex + 1}`}
                    primaryColor={AppColors.PRIMARY}
                    secondaryColor={AppColors.SECONDARY}
                    isLoading={amenitiesLoading}
                />
                {renderSelectedAmenities(selectedIds)}
            </VStack>
        );
    }
    
    const RoomRepeater = ({ room, index }: { room: RoomIn, index: number }) => {

        const parseAndHandleNumber = (key: keyof RoomIn, text: string, parser: (s: string) => number) => {
            const value = parser(text) || 0;
            handleRoomChange(index, key, value);
        };
        
        const displayValue = (value: number) => value === 0 ? '' : value.toString();

        return (
            <VStack style={styles.repeaterItem}>
                <HStack style={styles.repeaterHeader}>
                    <Text style={styles.repeaterTitle}>Tipo de Quarto #{index + 1}: {room.name || 'Sem Nome'}</Text>
                    {formData.rooms.length > 1 && (
                        <TouchableOpacity onPress={() => handleRemoveRoom(index)} style={styles.removeButton}>
                            <Trash2 color={AppColors.DANGER} size={20} />
                        </TouchableOpacity>
                    )}
                </HStack>
                
                <TextInput style={styles.input} placeholder="Nome do Quarto *" value={room.name} onChangeText={(text) => handleRoomChange(index, 'name', text)} />
                <TextInput style={styles.input} placeholder="Tipo de Cama/Configuração *" value={room.room_type} onChangeText={(text) => handleRoomChange(index, 'room_type', text)} />
                
                {/* ALTERAÇÃO: Campos de Capacidade e Preço agora em V-Stack (um abaixo do outro) */}
                <VStack style={{ gap: 10 }}> 
                    <TextInput 
                        style={styles.input} 
                        placeholder="Capacidade Máxima (Pessoas) *" 
                        keyboardType="numeric" 
                        value={displayValue(room.capacity)} 
                        onChangeText={(text) => parseAndHandleNumber('capacity', text, parseInt)} 
                    />
                    <TextInput 
                        style={styles.input} 
                        placeholder="Preço Base por Noite (R$) *" 
                        keyboardType="numeric" 
                        value={displayValue(room.base_price)} 
                        onChangeText={(text) => parseAndHandleNumber('base_price', text.replace(',', '.'), parseFloat)}
                    />
                </VStack>
                
                <TextInput 
                    style={styles.input} 
                    placeholder="Unidades Disponíveis *" 
                    keyboardType="numeric" 
                    value={displayValue(room.total_units)} 
                    onChangeText={(text) => parseAndHandleNumber('total_units', text, parseInt)} 
                />

                <RoomAmenitiesSelectorWrapper roomIndex={index} />

            </VStack>
        );
    }

    const MediaRepeater = ({ mediaItem, index }: { mediaItem: MediaIn, index: number }) => (
        <VStack key={index} style={styles.repeaterItem}>
            <HStack style={styles.repeaterHeader}>
                <Text style={styles.repeaterTitle}>Mídia #{index + 1} ({mediaItem.kind || 'GALERIA'})</Text>
                {index > 0 && ( 
                    <TouchableOpacity onPress={() => handleRemoveMedia(index)} style={styles.removeButton}>
                        <Trash2 color={AppColors.DANGER} size={20} />
                    </TouchableOpacity>
                )}
            </HStack>
            <TextInput style={styles.input} placeholder={index === 0 ? "URL da Imagem de Capa *" : "URL da Imagem/Mídia *"} value={mediaItem.url} onChangeText={(text) => handleMediaChange(index, 'url', text)} />
            <TextInput style={styles.input} placeholder="Tipo (MAIN, GALLERY, VIDEO - Opcional)" value={mediaItem.kind || ''} onChangeText={(text) => handleMediaChange(index, 'kind', text || null)} />
        </VStack>
    );

    const displayCoordValue = (value: number) => value === 0 ? '' : value.toString();

    return (
        <SafeAreaView style={styles.safeArea}>
            {/* --- HEADER FIXO --- */}
            <View style={styles.headerContainer}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <ArrowLeft size={24} color={AppColors.BLACK} />
                </TouchableOpacity>
                <Text style={styles.title}>Cadastro de novo hotel</Text>
            </View>

            <ScrollView 
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent} 
                showsVerticalScrollIndicator={false}
            >
                
                <Text style={styles.subtitle}>Preencha os dados do hotel para inclusão no catálogo da plataforma. Campos com * são obrigatórios.</Text>
                
                <VStack style={styles.formContent}>
                    
                    {/* 1. Informações Básicas e Localização */}
                    <View style={styles.sectionCard}>
                        <View style={styles.sectionHeader}>
                            <MapPin size={24} color={AppColors.PRIMARY} />
                            <Text style={styles.sectionTitle}>1. Informações Básicas do Hotel</Text>
                        </View>
                        <TextInput style={styles.input} placeholder="Nome Oficial do Hotel *" value={formData.name} onChangeText={(text) => handleChange('name', text)} />
                        <TextInput style={styles.textArea} placeholder="Descrição detalhada (Opcional)" value={formData.description || ''} onChangeText={(text) => handleChange('description', text || null)} multiline />
                        <TextInput style={styles.textArea} placeholder="Regras e Políticas (Check-in, Cancelamento - Opcional)" value={formData.policies || ''} onChangeText={(text) => handleChange('policies', text || null)} multiline />
                        
                        <Text style={styles.subHeader}>Dados de Localização</Text>
                        <TextInput style={styles.input} placeholder="Cidade *" value={formData.city} onChangeText={(text) => handleChange('city', text)} />
                        <TextInput style={styles.input} placeholder="Bairro (Opcional)" value={formData.neighborhood || ''} onChangeText={(text) => handleChange('neighborhood', text || null)} />
                        <TextInput style={styles.input} placeholder="Endereço Completo (Opcional)" value={formData.address || ''} onChangeText={(text) => handleChange('address', text || null)} />
                        
                        <HStack style={{ gap: 10 }}>
                            <TextInput 
                                style={StyleSheet.flatten([styles.input, styles.coordinateInput])} 
                                placeholder="Latitude" 
                                keyboardType="numeric" 
                                value={displayCoordValue(formData.latitude)} 
                                onChangeText={(text) => handleChange('latitude', text)} 
                            />
                            <TextInput 
                                style={StyleSheet.flatten([styles.input, styles.coordinateInput])} 
                                placeholder="Longitude" 
                                keyboardType="numeric" 
                                value={displayCoordValue(formData.longitude)} 
                                onChangeText={(text) => handleChange('longitude', text)} 
                            />
                        </HStack>
                           <Text style={StyleSheet.flatten([styles.subHeader, {marginTop: -10, fontStyle: 'italic', fontWeight: '400'}])}>
                                Latitude e Longitude são opcionais, mas recomendados para localização precisa.
                           </Text>
                    </View>

                    {/* 2. Comodidades Gerais */}
                    <View style={styles.sectionCard}>
                        <View style={styles.sectionHeader}>
                            <Sparkles size={24} color={AppColors.PRIMARY} />
                            <Text style={styles.sectionTitle}>2. Comodidades e Serviços Gerais</Text>
                        </View>
                        
                        <VStack space="sm">
                            <AmenitiesSelector
                                allAmenities={allAmenities}
                                selectedAmenityIds={formData.amenities}
                                onSelectionChange={handleAmenitiesSelection} 
                                title="Quais comodidades e serviços o Hotel oferece em áreas comuns?"
                                primaryColor={AppColors.PRIMARY}
                                secondaryColor={AppColors.SECONDARY}
                                isLoading={amenitiesLoading}
                            />
                            {renderSelectedAmenities(formData.amenities)}
                        </VStack>
                        
                    </View>

                    {/* 3. Mídia (Fotos/Vídeos) */}
                    <View style={styles.sectionCard}>
                        <View style={styles.sectionHeader}>
                            <Image size={24} color={AppColors.PRIMARY} />
                            <Text style={styles.sectionTitle}>3. Mídias (Fotos e Vídeos) ({formData.media.length})</Text>
                        </View>
                        {formData.media.map((mediaItem, index) => (
                            <MediaRepeater key={index} mediaItem={mediaItem} index={index} />
                        ))}
                        <TouchableOpacity onPress={handleAddMedia} style={StyleSheet.flatten([styles.addButton, { borderColor: AppColors.SECONDARY, backgroundColor: AppColors.WHITE, marginTop: 15 }])}>
                            <PlusCircle color={AppColors.SECONDARY} size={20} />
                            <Text style={StyleSheet.flatten([styles.addButtonText, { color: AppColors.SECONDARY }])}>Adicionar URL de Mídia</Text>
                        </TouchableOpacity>
                    </View>

                    {/* 4. Quartos (Rooms) */}
                    <View style={styles.sectionCard}>
                        <View style={styles.sectionHeader}>
                            <BedDouble size={24} color={AppColors.PRIMARY} />
                            <Text style={styles.sectionTitle}>4. Gestão de Tipos de Quartos ({formData.rooms.length})</Text>
                        </View>
                        <Text style={styles.subHeader}>Defina a configuração, preço e disponibilidade de cada tipo de quarto no hotel.</Text>
                        {formData.rooms.map((room, index) => (
                            <RoomRepeater key={index} room={room} index={index} />
                        ))}
                        <TouchableOpacity onPress={handleAddRoom} style={StyleSheet.flatten([styles.addButton, { borderColor: AppColors.PRIMARY, backgroundColor: AppColors.WHITE, marginTop: 15 }])}>
                            <PlusCircle color={AppColors.PRIMARY} size={20} />
                            <Text style={StyleSheet.flatten([styles.addButtonText, { color: AppColors.PRIMARY }])}>Adicionar Novo Tipo de Quarto</Text>
                        </TouchableOpacity>
                    </View>
                    
                </VStack>

                <View style={{ height: 100 }} />

            </ScrollView>

            {/* Ação Principal - Botão Fixo/Final */}
            <View style={styles.footerContainer}>
                <Button
                    className="w-full"
                    style={StyleSheet.flatten([styles.mainButton, { backgroundColor: AppColors.PRIMARY }])}
                    onPress={handleCreate}
                    disabled={loading || amenitiesLoading}
                >
                    {loading ? (
                        <HStack className="items-center justify-center gap-2">
                            <ActivityIndicator color="#fff" size="small" />
                            <ButtonText style={styles.mainButtonText}>
                                CADASTRANDO HOTEL...
                            </ButtonText>
                        </HStack>
                    ) : (
                        <ButtonText style={styles.mainButtonText}>
                            CADASTRAR HOTEL NO CATÁLOGO
                        </ButtonText>
                    )}
                </Button>
            </View>
        </SafeAreaView>
    );
}

// --- ESTILOS CORRIGIDOS ---
const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: AppColors.LIGHT_GRAY, },
    
    headerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 15,
        paddingVertical: 15,
        backgroundColor: AppColors.WHITE,
        borderBottomWidth: 1,
        borderBottomColor: AppColors.MEDIUM_GRAY,
    },
    backButton: {
        marginRight: 10,
        padding: 5,
    },
    title: { 
        fontSize: 20, 
        fontWeight: '700', 
        color: AppColors.BLACK, 
    },
    
    scrollView: {
        flex: 1,
    },
    scrollContent: { 
        paddingHorizontal: 15,
        paddingTop: 15, 
        paddingBottom: 20, 
    },
    subtitle: { 
        fontSize: 15, 
        color: AppColors.TEXT_GRAY, 
        marginBottom: 25, 
        fontWeight: '400', 
    },
    formContent: { gap: 30, }, 

    sectionCard: { 
        backgroundColor: AppColors.WHITE, 
        borderRadius: 15, 
        paddingHorizontal: 20, 
        paddingVertical: 20,
        gap: 15, 
        ...Platform.select({
            ios: {
                shadowColor: AppColors.BLACK,
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.05, 
                shadowRadius: 10,
            },
            android: {
                elevation: 5,
            },
        }),
    },
    sectionHeader: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        paddingBottom: 10, 
        marginBottom: 5, 
        borderBottomWidth: 1, 
        borderBottomColor: AppColors.MEDIUM_GRAY, 
    },
    sectionTitle: { 
        flex: 1,
        fontSize: 20, 
        fontWeight: '700', 
        color: AppColors.BLACK, 
        marginLeft: 10, 
    },
    subHeader: { 
        fontSize: 14, 
        fontWeight: '600', 
        color: AppColors.TEXT_GRAY, 
        marginTop: 5, 
    },
    
    input: { 
        height: 48, 
        borderColor: AppColors.MEDIUM_GRAY, 
        borderWidth: 1, 
        borderRadius: 10, 
        paddingHorizontal: 15, 
        backgroundColor: AppColors.WHITE, 
        fontSize: 16, 
        color: AppColors.BLACK, 
        fontWeight: '500', 
    },
    coordinateInput: {
        flex: 1,
        minWidth: '48%', 
        textAlign: 'center',
    },
    textArea: { 
        minHeight: 100, 
        borderColor: AppColors.MEDIUM_GRAY, 
        borderWidth: 1, 
        borderRadius: 10, 
        paddingHorizontal: 15, 
        paddingVertical: 12, 
        backgroundColor: AppColors.WHITE, 
        fontSize: 16, 
        color: AppColors.BLACK, 
        textAlignVertical: 'top', 
        fontWeight: '500', 
    },
    
    repeaterItem: { 
        gap: 10, 
        padding: 15, 
        borderRadius: 10, 
        borderWidth: 1, 
        borderColor: AppColors.MEDIUM_GRAY, 
        backgroundColor: AppColors.LIGHT_GRAY, 
        marginTop: 10,
    },
    repeaterHeader: { 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        borderBottomWidth: 1, 
        borderBottomColor: AppColors.MEDIUM_GRAY, 
        paddingBottom: 8, 
        marginBottom: 5,
    },
    repeaterTitle: { 
        fontSize: 17, 
        fontWeight: '600', 
        color: AppColors.BLACK, 
        flexShrink: 1,
    },
    removeButton: {
        padding: 5,
    },

    addButton: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        justifyContent: 'center',
        padding: 12, 
        borderRadius: 10, 
        borderWidth: 2, 
        borderStyle: 'dashed', 
    },
    addButtonText: { 
        fontSize: 16, 
        fontWeight: '600', 
        marginLeft: 8, 
    },

    noAmenitiesText: {
        fontSize: 14,
        color: AppColors.TEXT_GRAY,
        fontStyle: 'italic',
        marginTop: 5,
    },
    amenitiesDisplayContainer: {
        borderTopWidth: 1,
        borderTopColor: AppColors.MEDIUM_GRAY,
        paddingTop: 10,
        marginTop: 5,
    },
    selectedAmenitiesTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: AppColors.TEXT_GRAY,
        marginBottom: 8,
    },
    selectedAmenityPill: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#E6FFE6',
        borderRadius: 15,
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderWidth: 1,
        borderColor: AppColors.SUCCESS,
    },
    selectedAmenityItem: {
        fontSize: 15,
        color: AppColors.TEXT_GRAY, 
        marginLeft: 5,
        fontWeight: '500', 
    },
    
    footerContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        paddingHorizontal: 20,
        paddingVertical: 15,
        backgroundColor: AppColors.WHITE,
        borderTopWidth: 1,
        borderTopColor: AppColors.MEDIUM_GRAY,
        ...Platform.select({
            ios: {
                shadowColor: AppColors.BLACK,
                shadowOffset: { width: 0, height: -2 },
                shadowOpacity: 0.08,
                shadowRadius: 8,
            },
            android: {
                elevation: 10,
            },
        }),
    },
    mainButton: { height: 55, borderRadius: 12, justifyContent: 'center', },
    mainButtonText: { 
        color: AppColors.WHITE, 
        fontWeight: '800', 
        fontSize: 18, 
    }
});