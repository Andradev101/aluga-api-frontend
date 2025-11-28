// HomeHeader.tsx

import { Search, SlidersHorizontal } from 'lucide-react-native';
import React from 'react';
import { StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';

const PRIMARY_ORANGE = '#FF7F00';
const WHITE = '#FFFFFF';
const ICON_LIGHT_GRAY = 'rgba(255, 255, 255, 0.8)'; // Cinza claro para o placeholder
const TEXT_DARK = '#222222'; // Mantemos para o texto dentro do input

// Importações do projeto
import { HStack } from './ui/hstack';

interface HomeHeaderProps {
    userRole: string;
    onFilterPress: () => void;
}

const HomeHeader: React.FC<HomeHeaderProps> = ({ userRole, onFilterPress }) => {
    return (
        // 🚨 Fundo do Header Laranja Primário
        <HStack style={styles.headerContainer}>
            {/* O container de busca agora é branco para contraste */}
            <View style={styles.searchContainer}>
                {/* Ícone de Busca em cor escura para contraste contra o fundo branco do Input */}
                <Search size={20} color={TEXT_DARK} style={styles.searchIcon} />
                <TextInput
                    style={styles.searchInput}
                    placeholder="Para onde você quer ir?"
                    placeholderTextColor={ICON_LIGHT_GRAY} // O placeholder no Input é claro
                />
            </View>

            <TouchableOpacity
                style={styles.filterButton}
                onPress={onFilterPress}
            >
                {/* Ícone de Filtro em Branco puro */}
                <SlidersHorizontal size={22} color={WHITE} />
            </TouchableOpacity>
        </HStack>
    );
};

const styles = StyleSheet.create({
    headerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingTop: 10,
        paddingBottom: 10,
        gap: 12,
        // 🚨 MUDA O FUNDO PARA A COR PRIMÁRIA
        backgroundColor: PRIMARY_ORANGE,
    },
    // Estilo de busca: fundo branco para se destacar no header laranja
    searchContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: WHITE, 
        borderRadius: 10,
        height: 50,
        paddingHorizontal: 16,
        borderWidth: 0, // Remove a borda, pois o contraste já é feito pela cor de fundo
        
        // Mantém uma sombra sutil para dar elevação
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 1,
    },
    searchIcon: {
        marginRight: 10,
        color: '#666666', // Cor cinza escura para o ícone
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
        color: TEXT_DARK,
        height: '100%',
        padding: 0,
    },
    filterButton: {
        // O botão de filtro agora fica transparente, assumindo o fundo laranja
        backgroundColor: 'transparent', 
        borderRadius: 10,
        padding: 12,
        alignItems: 'center',
        justifyContent: 'center',
        width: 50,
        height: 50,
        // Adiciona uma borda branca para demarcar o botão no fundo laranja
        borderWidth: 1.5, 
        borderColor: WHITE, 
        
        // Remove a sombra do botão, pois ele já tem destaque
        shadowColor: 'transparent',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0,
        shadowRadius: 0,
        elevation: 0,
    },
});

export default HomeHeader;