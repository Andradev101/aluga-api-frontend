// app/(tabs)/index.tsx

import HomeHeader from '@/components/home-header';
// 🚨 CORREÇÃO: Mude a forma como o HotelsScreen é importado.
// Se ele é exportado com 'export default', a importação está correta,
// mas se ele está sendo renomeado ou se o bundler está se confundindo,
// podemos forçar o import do React.
import HotelsScreen from '@/components/hotel-listing';
import * as Storage from '@/components/secureStorage';
import { useFocusEffect } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useCallback, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import FilterActionSheet, { HotelFilterParams } from '@/components/FilterActionSheet';

export default function HotelsTabScreen() {
    const [userRole, setUserRole] = useState('');
    const [isFilterVisible, setIsFilterVisible] = useState(false);
    const [appliedFilters, setAppliedFilters] = useState<HotelFilterParams>({ sort: 'id' });

    async function getCredentials() {
        let result = await Storage.getValueFor("user_role");
        setUserRole(result != null ? result : '');
    }

    useFocusEffect(
        useCallback(() => {
            getCredentials()
        }, [])
    );

    const handleApplyFilters = (newFilters: HotelFilterParams) => {
        setAppliedFilters(newFilters);
        setIsFilterVisible(false);
    };

    const MemoizedHomeHeader = useMemo(() => {
        return (
            <HomeHeader 
                userRole={userRole} 
                onFilterPress={() => setIsFilterVisible(true)} 
            />
        );
    }, [userRole]);

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <StatusBar style="auto" />
            
            <View style={styles.fixedHeader}>
                {MemoizedHomeHeader}
            </View>
            
            {/* O componente agora deve ser reconhecido corretamente */}
            <HotelsScreen filters={appliedFilters} /> 

            <FilterActionSheet
                isOpen={isFilterVisible}
                onClose={() => setIsFilterVisible(false)}
                onApplyFilters={handleApplyFilters}
                initialFilters={appliedFilters}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f8f8',
    },
    fixedHeader: {
        zIndex: 10,
        backgroundColor: '#f8f8f8',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 5,
    },
});