// app/hotel-success-modal.tsx
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

// --- CONSTANTES ---
const AppColors = { 
    PRIMARY: '#FF7F00', // Cor primária (laranja)
    GRAY_LIGHT: '#F5F5F5', // Fundo claro
    TEXT_DARK: '#333333', // Cor do texto principal
    TEXT_MUTED: '#555555', // Cor do texto secundário
};
const DESTINATION_ROUTE = '/explorer'; 
const REDIRECT_DELAY_MS = 2000; // 2 segundos

export default function HotelSuccessModal() {
    const params = useLocalSearchParams();
    // Obtém o nome do hotel da URL
    const hotelName = params.name as string || 'Hotel Cadastrado'; 
    
    useEffect(() => {
        // 1. Define o timer para 2 segundos
        const timer = setTimeout(() => {
            
            // 2. Redireciona para o destino e substitui a pilha de navegação
            router.replace(DESTINATION_ROUTE);

        }, REDIRECT_DELAY_MS); 

        // 3. Função de limpeza: cancela o timer se a tela for desmontada
        return () => clearTimeout(timer);
    }, []); // Executa apenas na montagem do componente

    return (
        <View style={styles.container}>
            <Text style={styles.title}>
                🎉 Sucesso!
            </Text>
            
            <Text style={styles.message}>
                O hotel {hotelName} foi cadastrado.
            </Text>
            
            <ActivityIndicator 
                size="large" 
                color={AppColors.PRIMARY} 
                style={styles.spinner} 
            />

            <Text style={styles.redirectingText}>
                Redirecionando para o catálogo em 2 segundos...
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 30,
        backgroundColor: AppColors.GRAY_LIGHT, 
    },
    title: {
        fontSize: 30,
        fontWeight: 'bold',
        marginBottom: 10,
        color: AppColors.TEXT_DARK,
    },
    message: {
        fontSize: 18,
        textAlign: 'center',
        marginBottom: 20,
        color: AppColors.TEXT_MUTED,
        lineHeight: 28,
    },
    spinner: {
        marginTop: 20,
        marginBottom: 20,
    },
    redirectingText: {
        fontSize: 16,
        color: AppColors.TEXT_MUTED,
        fontStyle: 'italic',
    }
});