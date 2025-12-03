import { useGetSelfInfoAction } from '@/components/getselfinfo';
import ModalComponent from '@/components/modal';
import { useRefreshTokenAction } from '@/components/refreshtoken';
import { Avatar, AvatarFallbackText } from '@/components/ui/avatar';
import { Button, ButtonIcon, ButtonText } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Center } from '@/components/ui/center';
import { Divider } from '@/components/ui/divider';
import { Heading } from '@/components/ui/heading';
import { VStack } from '@/components/ui/vstack';
import { useAuth } from '@/hooks/useAuth';
import Ionicons from '@expo/vector-icons/Ionicons';
import { router, useFocusEffect } from 'expo-router';
import * as IconProvider from 'lucide-react-native';
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

interface UserInfo {
    id: string;
    userName: string;
    role: string;
    birthDate: string;
    emailAddress: string;
    phoneNumber: string;
    firstName: string;
    lastName: string;
    address: string;
}

export default function ProfileScreen() {
    useFocusEffect(
        useCallback(() => {
            const fetchAndCall = async () => {
            setLoaded(false)
            try {
                await fetchUserData();
                let res = await performUserSelfInfoCallout()
                let resBody = await res.json()
                console.log(resBody);
                setUserInfo(resBody)
            } catch (error) {
                console.error("Error fetching user data:", error);
            } finally {
                setLoaded(true)
            }
        };
        fetchAndCall();
        }, [])
    )
    const { fetchUserData, userData, isAuthenticated, logout } = useAuth();


    const [loaded, setLoaded] = useState(false);
    const [userInfo, setUserInfo] = useState<UserInfo | null>(null);

    async function fetchAndCall() {
        setLoaded(false)
        try {
            await fetchUserData();
            let res = await performUserSelfInfoCallout()
            let resBody = await res.json()
            console.log(resBody);
            setUserInfo(resBody)
        } catch (error) {
            console.error("Error fetching user data:", error);
        } finally {
            setLoaded(true)
        }
    }
    const handleGetSelfInfo = useGetSelfInfoAction();
    const handleRefreshToken = useRefreshTokenAction();

    const handleLogout = async () => {
        setLoaded(false)
        logout()
    };

    return (
        <ScrollView
            style={styles.container}
            contentContainerStyle={styles.contentContainer}
            showsVerticalScrollIndicator={false}
        >
            {loaded && <>
                <Card className='rounded-xl'>
                    <Heading size='3xl' className='text-center'>Olá, {userInfo?.firstName} {userInfo?.lastName}!</Heading>
                    <VStack>
                        <VStack>
                            <Center>
                                <Avatar size="md">
                                    <AvatarFallbackText>{userData?.token_content?.userName}</AvatarFallbackText>
                                </Avatar>
                                <Text style={styles.userName}>{userData?.token_content?.userName}</Text>
                            </Center>
                        </VStack>
                </VStack>
                
                </Card>
                <Card size="sm" className='my-4 rounded-xl px-0 bg-white'>
                    <Heading size='sm' className='mb-3 pl-3'>Gerenciamento de dados</Heading>
                        {userInfo && (
                            <ModalComponent content={userInfo} buttonName="Informações pessoais" variant="self" onCloseCallback={() => fetchAndCall()}>
                                {(openAlert) => (
                                    <Button size="lg" className="my-1 rounded-xl w-full justify-start px-3 bg-white data-[hover=true]:bg-transparent" onPress={openAlert}>
                                        <ButtonIcon as={IconProvider.UserPen} color='#9e9e9eff' size="md" />
                                        <ButtonText className='px-1 font-light text-gray-800 data-[hover=true]:text-gray-800'>Minhas informações</ButtonText>
                                        <View className="flex-1" />
                                        <ButtonIcon as={IconProvider.ChevronRight} className='ml-auto' color='#9e9e9eff' size="lg" />
                                    </Button>

                                )}
                            </ModalComponent>
                        )}
                        <Divider className="w-full"></Divider>
                        <Button size="lg" className="my-1 rounded-xl w-full justify-start px-3 bg-white data-[hover=true]:bg-transparent">
                            <ButtonIcon as={IconProvider.BookMarked} color='#9e9e9eff' size="md" />
                            <ButtonText className='px-1 font-light text-gray-800 data-[hover=true]:text-gray-800'>Minhas Reservas</ButtonText>
                            <View className="flex-1" />
                            <ButtonIcon as={IconProvider.ChevronRight} className='ml-auto' color='#9e9e9eff' size="lg" />
                        </Button>
                        <Divider className="w-full" ></Divider>
                        <Button size="lg" className="my-1 rounded-xl w-full justify-start px-3 bg-white data-[hover=true]:bg-transparent" onPress={() => router.replace('/my-reviews')}>
                            <ButtonIcon as={IconProvider.Star} color='#9e9e9eff' size="md" />
                            <ButtonText className='px-1 font-light text-gray-800 data-[hover=true]:text-gray-800'>Minhas Reviews</ButtonText>
                            <View className="flex-1" />
                            <ButtonIcon as={IconProvider.ChevronRight} className='ml-auto' color='#9e9e9eff' size="lg" />
                        </Button>
                </Card>
                {userData?.token_content?.role === "sysAdmin" && (
                    <View style={styles.card}>
                        <Text style={styles.cardTitle}>Ações Administrativas</Text>
                        <MenuItem
                            title="Cadastrar Novo Hotel"
                            onPress={() => router.push('/hotels/create-hotel')}
                            iconName="business-outline"
                        />
                        <MenuItem
                            title="Gerenciar Usuários"
                            onPress={() => router.push('/admin')}
                            iconName="people-outline"
                            isLast={true}
                        />
                    </View>
                )}

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

                {userData?.token_content?.role === "sysAdmin" && (
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

                <View style={{ height: 40 }} /> </>}
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

async function performUserSelfInfoCallout() {
    const url = `${process.env.EXPO_PUBLIC_API_URL}/users/me`;

    const options = {
        method: 'GET',
        credentials: 'include' as RequestCredentials,
        headers: { 'content-type': 'application/json' },
    };
    let response = await fetch(url, options);
    console.log("games");

    return response
}