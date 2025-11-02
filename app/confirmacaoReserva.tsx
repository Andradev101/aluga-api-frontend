import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function Confirmacao() {
  const router = useRouter();

    const params = useLocalSearchParams();
    const { hotelName, hotelId, roomName, roomId, total, checkin, checkout } = params;

  return (
    <View style={styles.container}>
      <Ionicons name="checkmark-circle" size={90} color="#16A34A" />
      <Text style={styles.title}>Reserva Confirmada!</Text>
      <Text style={styles.subtitle}>
        Sua reserva foi processada com sucesso.
      </Text>

      <View style={styles.card}>
        <Text style={styles.infoTitle}>Detalhes da Reserva</Text>
        <Text style={styles.infoText}>Hotel: {hotelName}</Text>
        <Text style={styles.infoText}>Quarto: {roomName}</Text>
        <Text style={styles.infoText}>Check-in: {checkin}</Text>
        <Text style={styles.infoText}>Check-out: {checkout}</Text>
        <Text style={styles.infoText}>Total: {total}</Text>
      </View>

      <TouchableOpacity style={styles.button} onPress={() => router.push('/homepage')}>
        <Text style={styles.buttonText}>Voltar para Início</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#1E3A8A',
    marginTop: 15,
  },
  subtitle: {
    fontSize: 16,
    color: '#374151',
    textAlign: 'center',
    marginVertical: 10,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 20,
    marginTop: 20,
    width: '100%',
    elevation: 4,
  },
  infoTitle: {
    fontWeight: 'bold',
    fontSize: 18,
    color: '#1E3A8A',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 15,
    color: '#374151',
    marginBottom: 4,
  },
  button: {
    marginTop: 25,
    backgroundColor: '#1E3A8A',
    paddingVertical: 14,
    paddingHorizontal: 30,
    borderRadius: 8,
  },
  buttonText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
