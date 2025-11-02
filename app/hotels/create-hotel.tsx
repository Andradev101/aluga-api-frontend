// app/hotels/create-hotel.tsx

import { Button, ButtonText } from '@/components/ui/button';
import { HStack } from '@/components/ui/hstack';
import { VStack } from '@/components/ui/vstack';
import { createFullHotel } from '@/services/hotels-api';
import { AmenityIn, HotelDetailOut, HotelIn, MediaIn, RoomIn } from '@/types/hotels';
import { router } from 'expo-router';
import { MinusCircle, PlusCircle } from 'lucide-react-native';
import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity } from 'react-native';

// --- SUB-ESTADOS INICIAIS ---
const INITIAL_ROOM_AMENITY: AmenityIn[] = [{ id: 10 }, { id: 11 }]; 

const INITIAL_ROOM: RoomIn = {
    name: 'Quarto Standard',
    room_type: 'Standard',
    capacity: 2,
    base_price: 150.0,
    total_units: 1,
    amenities: INITIAL_ROOM_AMENITY, 
};

const INITIAL_MEDIA: MediaIn = {
    url: 'https://exemplo.com/foto_fachada.jpg',
    kind: 'MAIN',
};

// --- ESTADO INICIAL COMPLETO (HotelIn) ---
const INITIAL_STATE: HotelIn = {
    name: 'Novo Hotel Complexo',
    description: 'Este é um hotel completo criado em um único passo.',
    city: 'Rio de Janeiro',
    neighborhood: 'Ipanema',
    address: 'Rua Principal, 100',
    latitude: -22.9847,
    longitude: -43.1970,
    policies: 'Proibido fumar nas áreas internas. Horário de check-out: 11h.',
    
    // Listas complexas
    amenities: [1, 2, 3], 
    media: [INITIAL_MEDIA],
    rooms: [INITIAL_ROOM],
};

export default function CreateHotelScreen() {
    const [formData, setFormData] = useState<HotelIn>(INITIAL_STATE);
    const [loading, setLoading] = useState(false);

    // Manipulador genérico para campos de nível superior (name, city, lat, etc.)
    const handleChange = (key: keyof HotelIn, value: string | number | null) => {
        const finalValue = typeof value === 'string' && value.trim() === '' ? null : value;
        
        if (key === 'latitude' || key === 'longitude') {
            const numValue = parseFloat(value as string) || 0;
            setFormData(prev => ({ ...prev, [key]: numValue }));
        } else {
            setFormData(prev => ({ ...prev, [key]: finalValue }));
        }
    };

    // --- FUNÇÕES DE MANIPULAÇÃO DINÂMICA (COMPLEXIDADE) ---

    // 1. Amenidades Gerais (Lista de IDs)
    const handleAmenityIdsChange = (amenityId: number, isAdding: boolean) => {
        setFormData(prev => {
            const currentAmenities = prev.amenities || [];
            if (isAdding) {
                if (!currentAmenities.includes(amenityId)) {
                    return { ...prev, amenities: [...currentAmenities, amenityId] };
                }
            } else {
                return { ...prev, amenities: currentAmenities.filter(id => id !== amenityId) };
            }
            return prev;
        });
    };

    // 2. Quartos (Rooms)
    const handleRoomChange = (index: number, key: keyof RoomIn, value: any) => {
        setFormData(prev => {
            const newRooms = [...prev.rooms];
            newRooms[index] = { ...newRooms[index], [key]: value };
            return { ...prev, rooms: newRooms };
        });
    };
    
    const handleAddRoom = () => {
        setFormData(prev => ({ ...prev, rooms: [...prev.rooms, { ...INITIAL_ROOM, name: `Quarto ${prev.rooms.length + 1}` }] }));
    };

    const handleRemoveRoom = (index: number) => {
        setFormData(prev => ({ ...prev, rooms: prev.rooms.filter((_, i) => i !== index) }));
    };

    // 3. Mídia (Media)
    const handleMediaChange = (index: number, key: keyof MediaIn, value: string | null) => {
        setFormData(prev => {
            const newMedia = [...prev.media];
            newMedia[index] = { ...newMedia[index], [key]: value || null };
            return { ...prev, media: newMedia };
        });
    };
    
    const handleAddMedia = () => {
        setFormData(prev => ({ ...prev, media: [...prev.media, { url: '', kind: 'GALLERY' }] }));
    };

    const handleRemoveMedia = (index: number) => {
        setFormData(prev => ({ ...prev, media: prev.media.filter((_, i) => i !== index) }));
    };

    // --- FUNÇÃO DE SUBMISSÃO ---
    const handleCreate = async () => {
        // Validação Mínima
        if (!formData.name || !formData.city || formData.rooms.length === 0) {
            Alert.alert("Erro de Validação", "Nome, Cidade e pelo menos um Quarto são obrigatórios.");
            return;
        }

        setLoading(true);
        try {
            const newHotel: HotelDetailOut = await createFullHotel(formData);
            
            Alert.alert("Sucesso!", `Hotel '${newHotel.name}' (ID: ${newHotel.id}) criado com sucesso junto com ${newHotel.rooms.length} quartos e ${newHotel.media.length} mídias!`);
            
            router.replace('/hotels'); 

        } catch (error) {
            console.error("Erro no cadastro completo:", error);
            const errorMessage = error instanceof Error ? error.message : "Erro desconhecido";
            Alert.alert("Erro de API", `Não foi possível cadastrar o hotel. Detalhes: ${errorMessage}`);
        } finally {
            setLoading(false);
        }
    };

    // --- RENDERIZAÇÃO ---
    return (
        <ScrollView className="flex-1 bg-gray-50 p-6">
            <VStack className="gap-8">
                <Text style={styles.title}>Cadastro COMPLETO de Hotel</Text>
                
                {/* 1. Informações Básicas e Localização */}
                <VStack style={styles.sectionContainer}>
                    <Text style={styles.sectionTitle}>1. Dados Principais & Localização</Text>
                    <TextInput style={styles.input} placeholder="Nome do Hotel *" value={formData.name} onChangeText={(text) => handleChange('name', text)} />
                    <TextInput style={styles.input} placeholder="Cidade *" value={formData.city} onChangeText={(text) => handleChange('city', text)} />
                    <TextInput style={styles.textArea} placeholder="Descrição" value={formData.description || ''} onChangeText={(text) => handleChange('description', text || null)} multiline />
                    <TextInput style={styles.input} placeholder="Endereço Completo" value={formData.address || ''} onChangeText={(text) => handleChange('address', text || null)} />
                    <TextInput style={styles.textArea} placeholder="Políticas" value={formData.policies || ''} onChangeText={(text) => handleChange('policies', text || null)} multiline />
                    <TextInput style={styles.input} placeholder="Latitude" keyboardType="numeric" value={formData.latitude.toString()} onChangeText={(text) => handleChange('latitude', text)} />
                    <TextInput style={styles.input} placeholder="Longitude" keyboardType="numeric" value={formData.longitude.toString()} onChangeText={(text) => handleChange('longitude', text)} />
                </VStack>

                {/* 2. Comodidades Gerais do Hotel (Lista de IDs) */}
                <VStack style={StyleSheet.flatten([styles.sectionContainer, styles.amenitiesSection])}>
                    <Text style={styles.sectionTitle}>2. Comodidades Gerais (IDs)</Text>
                    <Text className="text-sm text-gray-600">Selecione os IDs das comodidades do hotel (Ex: 1=Wifi, 2=Piscina).</Text>
                    <HStack className="flex-wrap gap-2 pt-1">
                        {[1, 2, 3, 4, 5, 10, 11, 15].map(id => (
                            <TouchableOpacity
                                key={id}
                                // CORREÇÃO APLICADA AQUI
                                style={StyleSheet.flatten([styles.pill, formData.amenities.includes(id) && styles.pillSelected])}
                                onPress={() => handleAmenityIdsChange(id, !formData.amenities.includes(id))}
                            >
                                <Text style={styles.pillText}>ID {id}</Text>
                            </TouchableOpacity>
                        ))}
                    </HStack>
                    <Text className="text-sm text-gray-700 mt-3">IDs Ativos: {formData.amenities.join(', ')}</Text>
                </VStack>

                {/* 3. Mídia (Fotos/Vídeos) */}
                <VStack style={StyleSheet.flatten([styles.sectionContainer, styles.mediaSection])}>
                    <Text style={styles.sectionTitle}>3. Mídia ({formData.media.length})</Text>
                    {formData.media.map((mediaItem, index) => (
                        <VStack key={index} className="gap-2 border p-3 rounded bg-white">
                            <Text className="font-semibold text-xs text-gray-600">Mídia #{index + 1}</Text>
                            <TextInput style={styles.input} placeholder="URL da Mídia *" value={mediaItem.url} onChangeText={(text) => handleMediaChange(index, 'url', text)} />
                            <TextInput style={styles.input} placeholder="Tipo (Ex: MAIN, GALLERY)" value={mediaItem.kind || ''} onChangeText={(text) => handleMediaChange(index, 'kind', text || null)} />
                            <TouchableOpacity onPress={() => handleRemoveMedia(index)} className="self-end p-1">
                                <MinusCircle color="#f97316" size={22} />
                            </TouchableOpacity>
                        </VStack>
                    ))}
                    <TouchableOpacity onPress={handleAddMedia} style={styles.addButton}>
                        <PlusCircle color="#f97316" size={20} />
                        <Text className="text-orange-600 ml-2 font-semibold">Adicionar Mídia</Text>
                    </TouchableOpacity>
                </VStack>

                {/* 4. Quartos (Rooms) */}
                <VStack style={StyleSheet.flatten([styles.sectionContainer, styles.roomsSection])}>
                    <Text style={styles.sectionTitle}>4. Quartos ({formData.rooms.length})</Text>
                    {formData.rooms.map((room, index) => (
                        <VStack key={index} className="gap-3 border p-4 rounded bg-white shadow-sm">
                            <HStack className="justify-between items-center pb-2 border-b border-gray-200">
                                <Text className="font-bold text-base text-red-700">Quarto #{index + 1}</Text>
                                <TouchableOpacity onPress={() => handleRemoveRoom(index)} className="p-1">
                                    <MinusCircle color="#dc2626" size={22} />
                                </TouchableOpacity>
                            </HStack>
                            <TextInput style={styles.input} placeholder="Nome do Quarto *" value={room.name} onChangeText={(text) => handleRoomChange(index, 'name', text)} />
                            <TextInput style={styles.input} placeholder="Tipo (Standard, Deluxe) *" value={room.room_type} onChangeText={(text) => handleRoomChange(index, 'room_type', text)} />
                            <TextInput style={styles.input} placeholder="Capacidade *" keyboardType="numeric" value={room.capacity.toString()} onChangeText={(text) => handleRoomChange(index, 'capacity', parseInt(text) || 0)} />
                            <TextInput style={styles.input} placeholder="Preço Base *" keyboardType="numeric" value={room.base_price.toString()} onChangeText={(text) => handleRoomChange(index, 'base_price', parseFloat(text) || 0)} />
                            <TextInput style={styles.input} placeholder="Total de Unidades *" keyboardType="numeric" value={room.total_units.toString()} onChangeText={(text) => handleRoomChange(index, 'total_units', parseInt(text) || 0)} />

                            <Text className="font-semibold text-sm mt-2 text-gray-700">Comodidades do Quarto (IDs)</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="IDs (Ex: 10,11,12) - Separados por vírgula"
                                value={room.amenities.map(a => a.id).join(', ')}
                                onChangeText={(text) => {
                                    const ids = text.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id) && id > 0).map(id => ({ id }));
                                    handleRoomChange(index, 'amenities', ids as AmenityIn[]);
                                }}
                            />
                        </VStack>
                    ))}
                    <TouchableOpacity onPress={handleAddRoom} style={StyleSheet.flatten([styles.addButton, { borderColor: '#f87171' }])}>
                        <PlusCircle color="#dc2626" size={20} />
                        <Text className="text-red-600 ml-2 font-semibold">Adicionar Novo Quarto</Text>
                    </TouchableOpacity>
                </VStack>

                {/* Ação Principal */}
                <VStack className="gap-4 mt-4 mb-10">
                    <Button
                        className="bg-red-600 active:bg-red-700"
                        onPress={handleCreate}
                        disabled={loading}
                    >
                        <ButtonText className="text-white font-semibold text-lg">
                            {loading ? 'Cadastrando TUDO...' : 'CRIAR HOTEL (COMPLETO) '}
                        </ButtonText>
                    </Button>
                </VStack>
            </VStack>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    title: { fontSize: 24, fontWeight: 'bold', color: '#1f2937', textAlign: 'center' },
    sectionContainer: { padding: 15, borderRadius: 10, borderWidth: 1, borderColor: '#e5e7eb', backgroundColor: 'white', gap: 10 },
    sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#374151', marginBottom: 5 },
    input: { height: 44, borderColor: '#d1d5db', borderWidth: 1, borderRadius: 6, paddingHorizontal: 12, backgroundColor: '#f9fafb', fontSize: 15 },
    textArea: { height: 80, borderColor: '#d1d5db', borderWidth: 1, borderRadius: 6, paddingHorizontal: 12, paddingVertical: 10, backgroundColor: '#f9fafb', fontSize: 15 },

    // Estilos Específicos de Seção
    amenitiesSection: { borderColor: '#bbf7d0', backgroundColor: '#f0fdf4' },
    mediaSection: { borderColor: '#fed7aa', backgroundColor: '#fff7ed' },
    roomsSection: { borderColor: '#fecaca', backgroundColor: '#fef2f2' },

    // Estilos de Pill/Botão
    pill: { paddingVertical: 5, paddingHorizontal: 10, borderRadius: 15, backgroundColor: '#d1d5db', borderWidth: 1, borderColor: '#a1a1aa' },
    pillSelected: { backgroundColor: '#34d399', borderColor: '#059669' },
    pillText: { fontSize: 14, color: '#1f2937' },
    
    // CORREÇÃO APLICADA AQUI
    addButton: StyleSheet.flatten([ 
        { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 10, borderRadius: 8, borderWidth: 2, borderStyle: 'dashed', borderColor: '#fdb44b' }
    ]) as any // O `as any` é para satisfazer a tipagem do TypeScript no React Native Web
});