import Ionicons from '@expo/vector-icons/Ionicons'; // Ícones nativos
import React, { useCallback, useState } from 'react';
import { ActivityIndicator, View as RNView, StyleSheet } from 'react-native';

// 🚨 IMPORTAÇÕES AJUSTADAS PARA A ESTRUTURA LOCAL DA CLI 🚨
import {
    Actionsheet,
    ActionsheetBackdrop,
    ActionsheetContent,
    ActionsheetDragIndicator,
    ActionsheetDragIndicatorWrapper,
    ActionsheetItem
} from '@/components/ui/actionsheet';
// Não importaremos Icon, InputIcon, etc.
import { Box } from '@/components/ui/box';
import { Button, ButtonText } from '@/components/ui/button';
import { Heading } from '@/components/ui/heading';
import { HStack } from '@/components/ui/hstack';
import { Input, InputField, InputSlot } from '@/components/ui/input';
import { Pressable } from '@/components/ui/pressable';
import { ScrollView } from '@/components/ui/scroll-view';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';

import { AmenityOut } from '@/types/amenities';

// --- TIPOS DE PROPS ---
interface AmenitiesSelectorProps {
    allAmenities: AmenityOut[];
    selectedAmenityIds: number[];
    onSelectionChange: (newIds: number[]) => void;
    title: string;
    primaryColor: string; 
    secondaryColor: string; 
    isLoading: boolean;
}

// --- COMPONENTE PRINCIPAL ---
export default function AmenitiesSelector({
    allAmenities,
    selectedAmenityIds,
    onSelectionChange,
    title,
    primaryColor, 
    secondaryColor, 
    isLoading,
}: AmenitiesSelectorProps) {
    
    // ... lógica permanece a mesma ...
    const [isActionSheetVisible, setActionSheetVisible] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    const primaryToken = primaryColor;
    const secondaryToken = secondaryColor;

    const filteredAmenities = allAmenities.filter(amenity =>
        amenity.label.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleToggleAmenity = useCallback((id: number) => {
        let newIds;
        if (selectedAmenityIds.includes(id)) {
            newIds = selectedAmenityIds.filter(amenityId => amenityId !== id);
        } else {
            newIds = [...selectedAmenityIds, id];
        }
        onSelectionChange(newIds);
    }, [selectedAmenityIds, onSelectionChange]);

    const selectedLabels = allAmenities
        .filter(a => selectedAmenityIds.includes(a.id))
        .map(a => a.label);
        
    const summaryText = selectedLabels.length > 0 
        ? selectedLabels.slice(0, 3).join(', ') + (selectedLabels.length > 3 ? ` e mais ${selectedLabels.length - 3}...` : '')
        : `Nenhuma ${title.toLowerCase()} selecionada.`;

    const handleClose = () => {
        setActionSheetVisible(false);
        setSearchTerm(''); 
    };

    return (
        <VStack space="sm" style={{ marginBottom: 16 }}> 
            <Text style={StyleSheet.flatten([styles.subHeader, { color: primaryToken }])}>{title}</Text>
            
            {isLoading ? (
                <Pressable
                    style={StyleSheet.flatten([styles.button, { borderColor: primaryToken }])}
                    disabled
                >
                    <ActivityIndicator size="small" color={primaryToken} />
                    <Text style={StyleSheet.flatten([styles.buttonText, { color: primaryToken }])}>Carregando Comodidades...</Text>
                </Pressable>
            ) : (
                <Pressable 
                    style={StyleSheet.flatten([styles.button, { borderColor: primaryToken }])} 
                    onPress={() => setActionSheetVisible(true)}
                >
                    <Ionicons name="search-outline" size={20} color={primaryToken} />
                    <Text style={StyleSheet.flatten([styles.buttonText, { color: primaryToken, flex: 1 }])} numberOfLines={1}>
                        {summaryText}
                    </Text>
                    <Ionicons name="chevron-forward" size={20} color={primaryToken} />
                </Pressable>
            )}

            <Actionsheet isOpen={isActionSheetVisible} onClose={handleClose} snapPoints={[80]}>
                <ActionsheetBackdrop />
                <ActionsheetContent>
                    <ActionsheetDragIndicatorWrapper>
                        <ActionsheetDragIndicator />
                    </ActionsheetDragIndicatorWrapper>

                    <Box style={styles.headerContainer}>
                        <HStack style={styles.headerHStack}>
                            <Heading size="lg" style={{ color: primaryToken }}> 
                                Selecione as {title.toLowerCase()}
                            </Heading>
                            <Pressable onPress={handleClose}>
                                {/* 🚨 Usando Ionicons nativo (fora do Gluestack Icon) */}
                                <Ionicons name="close-circle" size={30} color={primaryToken} />
                            </Pressable>
                        </HStack>
                    </Box>

                    <Input variant="outline" size="md" style={styles.inputContainer}>
                        <InputSlot style={styles.inputSlot}>
                            {/* 🚨 Usando Ionicons nativo (fora do Gluestack InputIcon) */}
                            <RNView style={{ alignItems: 'center', justifyContent: 'center' }}>
                                <Ionicons name="search-outline" size={16} color="#737373" />
                            </RNView>
                        </InputSlot>
                        <InputField
                            placeholder="Buscar por nome da comodidade..."
                            placeholderTextColor="$gray500"
                            value={searchTerm}
                            onChangeText={setSearchTerm}
                        />
                    </Input>

                    <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
                        {filteredAmenities.length === 0 ? (
                            <Text style={styles.emptyText}>
                                Nenhuma comodidade encontrada para "{searchTerm}".
                            </Text>
                        ) : (
                            filteredAmenities.map(amenity => {
                                const isSelected = selectedAmenityIds.includes(amenity.id);
                                return ( 
                                    <ActionsheetItem
                                        key={amenity.id}
                                        onPress={() => handleToggleAmenity(amenity.id)}
                                        style={StyleSheet.flatten([styles.actionsheetItem, { 
                                            backgroundColor: isSelected ? 'rgba(0, 0, 0, 0.05)' : '#FFFFFF',
                                            borderBottomColor: primaryToken 
                                        }])}
                                    >
                                        <HStack style={styles.itemHStack}>
                                            <Text 
                                                size="md" 
                                                style={StyleSheet.flatten([styles.itemText, { 
                                                    fontWeight: isSelected ? '600' : '400',
                                                    color: isSelected ? '#171717' : '#525252' 
                                                }])}
                                            >
                                                {amenity.label}
                                            </Text>
                                            {/* 🚀 CORREÇÃO DO ERRO 2322/NAME AQUI: Usando Ionicons nativo */}
                                            <Ionicons
                                                name={isSelected ? "checkmark-circle" : "add-circle-outline"}
                                                size={24} // Equivalente a 'xl'
                                                color={isSelected ? secondaryToken : "#737373"} // $gray500
                                            />
                                        </HStack>
                                    </ActionsheetItem>
                                ); 
                            })
                        )}
                    </ScrollView>
                    
                    <Box style={styles.buttonWrapper}> 
                        <Button 
                            style={StyleSheet.flatten([styles.buttonConfirm, { backgroundColor: secondaryToken }])} 
                            onPress={handleClose}
                            size="md"
                        >
                            <ButtonText style={styles.buttonTextConfirm}>
                                CONCLUÍDO ({selectedAmenityIds.length})
                            </ButtonText>
                        </Button>
                    </Box>
                </ActionsheetContent>
            </Actionsheet>
        </VStack>
    );
}

// --- ESTILOS NATIVOS ---
const styles = StyleSheet.create({
    // ... estilos existentes ...
    subHeader: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 8,
    },
    button: {
        flexDirection: 'row',
        alignItems: 'center',
        height: 50,
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 15,
        backgroundColor: '#FFFFFF',
        gap: 10,
    },
    buttonText: {
        fontSize: 16,
        fontWeight: '500',
    },
    headerContainer: {
        width: '100%',
        paddingHorizontal: 16, 
        paddingTop: 8, 
        paddingBottom: 16, 
        borderBottomWidth: 1, 
        borderBottomColor: '#E5E5E5', 
    },
    headerHStack: {
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    inputContainer: {
        width: '95%',
        alignSelf: 'center',
        marginVertical: 12, 
    },
    inputSlot: {
        padding: 12, 
    },
    scrollView: {
        width: '100%',
        paddingHorizontal: 16, 
    },
    scrollContent: {
        paddingBottom: 20,
    },
    emptyText: {
        textAlign: 'center',
        marginTop: 20, 
        color: '#737373', 
    },
    actionsheetItem: {
        paddingHorizontal: 0, 
        paddingVertical: 12, 
        borderBottomWidth: 1, 
        borderColor: '#E5E5E5', 
    },
    itemHStack: {
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
    },
    itemText: {
        flex: 1,
        marginRight: 8, 
    },
    buttonWrapper: {
        width: '100%',
        paddingHorizontal: 16, 
        marginTop: 16, 
        marginBottom: 8, 
    },
    buttonConfirm: {
        borderRadius: 6, 
    },
    buttonTextConfirm: {
        color: '#FFFFFF',
        fontWeight: 'bold',
    }
});