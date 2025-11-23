import { useGetSelfInfoAction } from '@/components/getselfinfo';
import { useRefreshTokenAction } from '@/components/refreshtoken';
import * as Storage from '@/components/secureStorage';
import { Button, ButtonText } from '@/components/ui/button';
import Ionicons from '@expo/vector-icons/Ionicons';
import { router, useFocusEffect } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const MenuItem = ({ 
    title, 
    onPress, 
    isDestructive = false, 
    iconName,
    isLast = false 
}: { 
    title: string, 
    onPress: () => void, 
    isDestructive?: boolean, 
    iconName?: keyof typeof Ionicons.glyphMap,
    isLast?: boolean
}) => (
    <TouchableOpacity onPress={onPress} style={[styles.menuItemTouch, isLast && styles.noBorder]}>
        {iconName && (
            <Ionicons 
                name={iconName} 
                size={24} 
                color={isDestructive ? '#dc2626' : '#6b7280'} 
                style={styles.menuItemIcon}
            />
        )}
        <Text style={[styles.menuItemText, isDestructive && styles.destructiveText]}>{title}</Text>
        {!isDestructive && (
            <Ionicons name="chevron-forward-outline" size={20} color="#9ca3af" style={styles.menuItemChevron} />
        )}
    </TouchableOpacity>
);

export default function ProfileScreen() {
    const [userRole, setUserRole] = useState('');

    const handleGetSelfInfo = useGetSelfInfoAction();
    const handleRefreshToken = useRefreshTokenAction();

    async function getCredentials() {
        let result = await Storage.getValueFor("user_role");
        setUserRole(result != null ? result : '');
    }

    useFocusEffect(
        useCallback(() => {
            getCredentials()
        }, [])
    );

    const handleLogout = async () => {
        try {
            await Storage.deleteValueFor('accessToken');
            await Storage.deleteValueFor('refreshToken');
            await Storage.deleteValueFor('user_role');
        } catch (error) {
            console.error("Erro durante o logout local:", error);
        }
        
        router.replace('/login'); 
    };

    return (
        <ScrollView 
            style={styles.container} 
            contentContainerStyle={styles.contentContainer}
            showsVerticalScrollIndicator={false}
        >
            <Text style={styles.headerTitle}>Minha Conta</Text>
            
            <View style={styles.infoCard}>
                <Ionicons name="person-circle-outline" size={50} color="#dc2626" />
                <View style={{ marginLeft: 15 }}>
                    <Text style={styles.userName}>Usuário Logado</Text>
                    <Text style={styles.userRoleText}>Cargo: {userRole || 'Carregando...'}</Text>
                </View>
            </View>

            {userRole === "sysAdmin" && (
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>Ações Administrativas</Text>
                    <MenuItem 
                        title="Cadastrar Novo Hotel" 
                        onPress={() => router.push('/hotels/create-hotel')} 
                        iconName="business-outline"
                    />
                    <MenuItem 
                        title="Gerenciar Usuários" 
                        onPress={() => router.push('/users')} 
                        iconName="people-outline"
                        isLast={true}
                    />
                </View>
            )}

            <View style={styles.card}>
                <Text style={styles.cardTitle}>Geral</Text>
                
                <MenuItem 
                    title="Editar Perfil" 
                    onPress={() => { }} 
                    iconName="person-outline"
                />
                <MenuItem 
                    title="Minhas Reservas" 
                    onPress={() => { }} 
                    iconName="calendar-outline"
                    isLast={true}
                />
            </View>

            <View style={styles.card}>
                <Text style={styles.cardTitle}>Suporte</Text>
                
                <MenuItem 
                    title="Central de Ajuda" 
                    onPress={() => { }} 
                    iconName="help-circle-outline"
                />
                <MenuItem 
                    title="Termos de Serviço" 
                    onPress={() => { }} 
                    iconName="document-text-outline"
                    isLast={true}
                />
            </View>

            {userRole === "sysAdmin" && (
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>Autenticação (Debug)</Text>
                    
                    <MenuItem
                        title="Consultar Minhas Info (API)" 
                        onPress={handleGetSelfInfo}
                        iconName="person-circle-outline"
                    />
                    
                    <MenuItem
                        title="Forçar Refresh Token (API)" 
                        onPress={handleRefreshToken}
                        iconName="sync-circle-outline"
                        isLast={true}
                    />
                </View>
            )}

            <View style={styles.logoutContainer}>
                <Button
                    className="bg-red-600 hover:bg-red-700 w-full"
                    onPress={handleLogout}
                >
                    <Ionicons name="log-out-outline" size={20} color="white" style={{ marginRight: 8 }} />
                    <ButtonText className="text-white font-semibold">Sair (Logout)</ButtonText>
                </Button>
            </View>
            
            <View style={{ height: 40 }} /> 
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f8f8',
    },
    contentContainer: {
        paddingHorizontal: 16,
        paddingBottom: 40,
    },
    headerTitle: {
        fontSize: 30,
        fontWeight: '700',
        marginTop: 50, 
        marginBottom: 20,
        paddingHorizontal: 8,
    },
    infoCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 16,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
        elevation: 2,
    },
    userName: {
        fontSize: 18,
        fontWeight: '600',
        color: '#1f2937',
    },
    userRoleText: {
        fontSize: 14,
        color: '#6b7280',
    },
    card: {
        backgroundColor: 'white',
        borderRadius: 12,
        paddingVertical: 4, 
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
        elevation: 2, 
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1f2937',
        marginTop: 8,
        marginBottom: 8,
        paddingHorizontal: 16, 
    },
    menuItemTouch: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 14,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#f3f4f6',
    },
    menuItemIcon: {
        marginRight: 12,
    },
    menuItemText: {
        fontSize: 16,
        color: '#1f2937',
        flex: 1, 
    },
    menuItemChevron: {
        marginLeft: 'auto', 
    },
    destructiveText: {
        color: '#dc2626',
    },
    logoutContainer: {
        marginTop: 24,
    },
    noBorder: {
        borderBottomWidth: 0,
    }
});