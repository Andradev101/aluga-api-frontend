import { Button, ButtonText } from '@/components/ui/button';
import { FormControl } from '@/components/ui/form-control';
import { Select, SelectBackdrop, SelectContent, SelectIcon, SelectInput, SelectItem, SelectPortal, SelectTrigger } from '@/components/ui/select';
import { ChevronDown, Star, X } from 'lucide-react-native';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import {
    Actionsheet,
    ActionsheetBackdrop,
    ActionsheetContent,
    ActionsheetDragIndicator,
    ActionsheetDragIndicatorWrapper,
} from '@/components/ui/actionsheet';
import { Box } from '@/components/ui/box';
import { Heading } from '@/components/ui/heading';
import {
    Slider,
    SliderFilledTrack,
    SliderThumb,
    SliderTrack
} from '@/components/ui/slider';


export interface HotelFilterParams {
    q?: string | null | undefined;
    city?: string | null | undefined;
    neighborhood?: string | null | undefined;
    room_type?: string | null | undefined;
    price_min?: number | null | undefined;
    price_max?: number | null | undefined;
    stars_min?: number | null | undefined;
    stars_max?: number | null | undefined;
    sort?: string;
    user_lat?: number; 
    user_lng?: number;
    page?: number;
    size?: number;
}

interface FilterActionSheetProps {
    isOpen: boolean;
    onClose: () => void;
    onApplyFilters: (filters: HotelFilterParams) => void;
    initialFilters: HotelFilterParams;
}

const PrimaryColor = '#FF7F00';
const TextDark = '#222222';
const TextGray = '#737373';
const BorderLightGray = '#E5E5E5'; 


const FilterActionSheet: React.FC<FilterActionSheetProps> = ({ isOpen, onClose, onApplyFilters, initialFilters }) => {
    // Preservando 'q' e 'city' nos filtros iniciais
    const { q, city, ...restFilters } = initialFilters;
    const [filters, setFilters] = useState<HotelFilterParams>(restFilters);

    React.useEffect(() => {
        const { q: initialQ, city: initialCity, ...initialRest } = initialFilters;
        setFilters(initialRest);
    }, [initialFilters, isOpen]);

    const handleApply = () => {
        const finalFilters = {
            // Inclui q e city da props inicial (mantidos da barra de pesquisa)
            q: initialFilters.q,
            city: initialFilters.city,
            ...filters,
            sort: filters.sort || 'id'
        };
        onApplyFilters(finalFilters);
        onClose();
    };

    const handleReset = () => {
        const defaultFilters: HotelFilterParams = { 
            // Mantém q e city do estado inicial, mas zera os filtros avançados
            q: initialFilters.q,
            city: initialFilters.city,
            price_min: undefined,
            price_max: undefined,
            stars_min: undefined,
            stars_max: undefined,
            sort: 'id' 
        };
        setFilters(defaultFilters);
    };

    const handlePriceChange = (value: number, type: 'min' | 'max') => {
        setFilters(prev => {
            let newVal: number | undefined | null = value;
            if ((type === 'min' && value === 0) || (type === 'max' && value === 1000)) {
                newVal = undefined;
            }
            return { ...prev, [`price_${type}`]: newVal };
        });
    };

    const handleStarsChange = (value: number, type: 'min' | 'max') => {
           setFilters(prev => {
               let newVal: number | undefined | null = value;
             if ((type === 'min' && value === 0) || (type === 'max' && value === 5)) {
                 newVal = undefined;
             }
             return { 
                 ...prev, 
                 [`stars_${type}`]: newVal 
             };
         });
    };
    
    // handleTextChange removido, pois não há mais campos de texto no ActionSheet

    return (
        <Actionsheet isOpen={isOpen} onClose={onClose} snapPoints={[95]}>
            <ActionsheetBackdrop />
            <ActionsheetContent style={styles.actionSheetContent}> 
                <ActionsheetDragIndicatorWrapper>
                    <ActionsheetDragIndicator />
                </ActionsheetDragIndicatorWrapper>

                <Box style={styles.headerContainer}> 
                    <View style={styles.header}>
                        <Heading size="lg" style={styles.titleStyle}>
                            Filtros Avançados
                        </Heading>
                        <Button variant="link" size="sm" onPress={onClose} style={styles.closeButton}>
                            <X size={24} color={PrimaryColor} /> 
                        </Button>
                    </View>
                </Box>

                <ScrollView contentContainerStyle={styles.scrollContent} style={styles.scrollViewStyle}>
                    
                    {/* BUSCAR POR NOME E CIDADE REMOVIDOS */}

                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Avaliação por Estrelas</Text>
                        
                        <Text style={styles.sliderLabel}>
                            Mínimo: {filters.stars_min?.toFixed(1) ?? '0.0'} <Star size={14} color={PrimaryColor} fill={PrimaryColor} />
                        </Text>
                        <Slider
                            minValue={0}
                            maxValue={5}
                            step={0.5}
                            value={filters.stars_min || 0}
                            onChange={(val: number) => handleStarsChange(val, 'min')}
                        >
                            <SliderTrack style={styles.sliderTrack}>
                                <SliderFilledTrack style={{ backgroundColor: PrimaryColor }} />
                            </SliderTrack>
                            <SliderThumb style={styles.sliderThumb} />
                        </Slider>
                        
                        <Text style={styles.sliderLabel}>
                            Máximo: {filters.stars_max?.toFixed(1) ?? '5.0'} <Star size={14} color={PrimaryColor} fill={PrimaryColor} />
                        </Text>
                        <Slider
                            minValue={0}
                            maxValue={5}
                            step={0.5}
                            value={filters.stars_max || 5}
                            onChange={(val: number) => handleStarsChange(val, 'max')}
                        >
                            <SliderTrack style={styles.sliderTrack}>
                                <SliderFilledTrack style={{ backgroundColor: PrimaryColor }} />
                            </SliderTrack>
                            <SliderThumb style={styles.sliderThumb} />
                        </Slider>
                    </View>

                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Faixa de Preço (R$)</Text>
                        
                        <Text style={styles.sliderLabel}>Mínimo: R$ {filters.price_min?.toFixed(0) ?? '0'}</Text>
                        <Slider
                            minValue={0}
                            maxValue={1000}
                            step={50}
                            value={filters.price_min || 0}
                            onChange={(val: number) => handlePriceChange(val, 'min')}
                        >
                            <SliderTrack style={styles.sliderTrack}>
                                <SliderFilledTrack style={{ backgroundColor: PrimaryColor }} />
                            </SliderTrack>
                            <SliderThumb style={styles.sliderThumb} />
                        </Slider>
                        
                        <Text style={styles.sliderLabel}>Máximo: R$ {filters.price_max?.toFixed(0) ?? '1000'}</Text>
                        <Slider
                            minValue={0}
                            maxValue={1000}
                            step={50}
                            value={filters.price_max || 1000}
                            onChange={(val: number) => handlePriceChange(val, 'max')}
                        >
                            <SliderTrack style={styles.sliderTrack}>
                                <SliderFilledTrack style={{ backgroundColor: PrimaryColor }} />
                            </SliderTrack>
                            <SliderThumb style={styles.sliderThumb} />
                        </Slider>
                    </View>

                    <View style={styles.section}>
                        <Text style={styles.sectionTitleSmall}>Ordenar por</Text>
                        
                        <View style={styles.sortControlContainer}>
                            <FormControl style={styles.formControl}>
                                <Select
                                    selectedValue={filters.sort || 'id'}
                                    onValueChange={(val: string) => setFilters(prev => ({ ...prev, sort: val }))}
                                >
                                    <SelectTrigger style={styles.selectTrigger}> 
                                        <SelectInput 
                                            placeholder="Critério de Ordenação" 
                                            placeholderTextColor={TextGray} 
                                            style={styles.inputFieldStyleSelect} 
                                        />
                                        <SelectIcon as={ChevronDown} color={TextDark} style={styles.selectIcon} />
                                    </SelectTrigger>
                                    <SelectPortal>
                                        <SelectBackdrop />
                                        <SelectContent>
                                            <SelectItem label="Mais Relevante (ID)" value="id" />
                                            <SelectItem label="Preço (Mais Baixo)" value="price" />
                                            <SelectItem label="Melhor Avaliação (Rating)" value="rating" />
                                            <SelectItem label="Mais Populares" value="popularity" />
                                            <SelectItem label="Distância (Mais Próximo)" value="distance" />
                                        </SelectContent>
                                    </SelectPortal>
                                </Select>
                            </FormControl>
                        </View>

                    </View>

                </ScrollView>

                <Box style={styles.footer}>
                    <Button variant="link" size="lg" style={styles.resetButton} onPress={handleReset}>
                        <ButtonText style={styles.resetButtonText}>Limpar</ButtonText>
                    </Button>
                    <Button size="lg" style={styles.applyButton} onPress={handleApply}>
                        <ButtonText style={styles.applyButtonText}>Aplicar Filtros</ButtonText>
                    </Button>
                </Box>

            </ActionsheetContent>
        </Actionsheet>
    );
};

const styles = StyleSheet.create({
    actionSheetContent: {
        maxHeight: '95%',
        paddingBottom: 0,
        backgroundColor: '#FFFFFF',
    },
    headerContainer: {
        width: '100%',
        paddingHorizontal: 20,
        paddingTop: 10,
        paddingBottom: 15,
        borderBottomWidth: 1, 
        borderBottomColor: BorderLightGray,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
    },
    titleStyle: {
        fontSize: 20, 
        fontWeight: '700', 
        color: TextDark,
    },
    closeButton: {
        height: 40,
        width: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    scrollViewStyle: {
        width: '100%',
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingVertical: 10,
    },
    section: {
        marginBottom: 25, 
    },
    sectionTitle: {
        fontSize: 18, 
        fontWeight: '700',
        color: TextDark,
        marginBottom: 10,
    },
    sectionTitleSmall: {
        fontSize: 16, 
        fontWeight: '600',
        color: TextDark,
        marginBottom: 8,
    },
    formControl: {
        marginBottom: 0, 
    },
    sortControlContainer: {
        width: 'auto', 
        alignSelf: 'flex-start',
    },
    inputStyle: {
        height: 48,
        borderRadius: 10, 
        borderWidth: 1,
        borderColor: BorderLightGray,
        backgroundColor: '#FFFFFF',
    },
    inputFieldStyle: {
        color: TextDark,
        fontSize: 16,
        paddingLeft: 15, 
    },
    selectTrigger: {
        height: 40,
        borderRadius: 10, 
        borderWidth: 1,
        borderColor: BorderLightGray,
        backgroundColor: '#FFFFFF',
        alignItems: 'center', 
        width: 160, 
    },
    inputFieldStyleSelect: {
        color: TextDark,
        fontSize: 16,
        paddingLeft: 15, 
    },
    selectIcon: {
        paddingRight: 15, 
    },
    sliderLabel: {
        fontSize: 14,
        color: TextDark,
        fontWeight: '500',
        marginTop: 10, 
        marginBottom: 5,
        flexDirection: 'row',
        alignItems: 'center',
    },
    sliderTrack: {
        height: 6,
        backgroundColor: '#E0E0E0',
        borderRadius: 3,
    },
    sliderThumb: {
        height: 18,
        width: 18,
        backgroundColor: PrimaryColor,
        borderWidth: 0, 
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 1,
        elevation: 2,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 15,
        borderTopWidth: 1,
        borderTopColor: BorderLightGray,
        width: '100%',
        backgroundColor: '#FFFFFF',
        gap: 10,
    },
    resetButton: {
        flex: 1,
        marginRight: 0, 
        height: 48,
        borderRadius: 8,
        borderColor: 'transparent',
    },
    resetButtonText: {
        color: PrimaryColor, 
        fontWeight: '600',
        fontSize: 16,
    },
    applyButton: {
        flex: 2,
        height: 48,
        backgroundColor: PrimaryColor,
        borderColor: PrimaryColor,
        borderRadius: 8,
    },
    applyButtonText: {
        color: '#FFFFFF',
        fontWeight: '700',
        fontSize: 16,
    }
});

export default FilterActionSheet;