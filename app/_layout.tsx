// app/_layout.tsx

import { GluestackUIProvider } from '@/components/ui/gluestack-ui-provider';
import '@/global.css';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';

import { Stack, router } from 'expo-router';

import { StatusBar } from 'expo-status-bar';

import { StyleSheet, TouchableOpacity } from 'react-native';

import { Feather } from '@expo/vector-icons';

import React from 'react';
import 'react-native-reanimated';
export const unstable_settings = {

    anchor: '(tabs)',

};

const BackIcon = () => <Feather name="arrow-left" size={24} color="black" />;


export default function RootLayout() {

    const colorScheme = useColorScheme();



    return (

        <GluestackUIProvider>

            <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>

                <Stack screenOptions={{headerShown:false}}>

                    <Stack.Screen name="(tabs)/index" options={{ headerShown: false }} />
                    <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
                    <Stack.Screen name="(protected)" options={{ headerShown: false }} />

                    <Stack.Screen

                        name="hotels/[hotelId]"

                        options={{

                            headerTitle: '',

                            headerTransparent: true,

                            headerTintColor: '#000',

                            headerBackTitle: '',



                            // O headerLeft agora usa o estilo atualizado

                            headerLeft: () => (

                                <TouchableOpacity

                                    onPress={() => router.back()}

                                    style={styles.headerButtonContainer}

                                >

                                    <BackIcon />

                                </TouchableOpacity>

                            ),

                            headerRight: () => null,

                        }}

                    />

                </Stack>

                <StatusBar style="auto" />

            </ThemeProvider>

        </GluestackUIProvider>

    );

}



const styles = StyleSheet.create({

    headerButtonContainer: {

        backgroundColor: 'rgba(255, 255, 255, 0.7)',

        borderRadius: 20,

        width: 40,

        height: 40,

        justifyContent: 'center',

        alignItems: 'center',

        // Ajuste de posicionamento

        marginLeft: -6, // Aumenta o afastamento da borda lateral

        marginTop: 15,  // Empurra o botão para baixo, alinhando-o melhor

    },

});