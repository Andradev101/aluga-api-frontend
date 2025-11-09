import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

// ✅ FUNÇÃO AUXILIAR: Converte string YYYY-MM-DD para Date (meio-dia local para evitar problemas de timezone)
const localISOStringToDate = (dateString: string): Date => {
  const [year, month, day] = dateString.split('-').map(Number);
  return new Date(year, month - 1, day, 12, 0, 0);
};

export default function ReservationDetails() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const {
    reservaId,
    hotelName,
    hotelCity,
    hotelStars,
    roomName,
    roomType,
    roomPrice,
    date_checkin,
    date_checkout,
    rooms_booked,
  } = params;

  const formatarData = (iso: string | undefined) => {
    if (!iso) return 'N/A';
    const date = localISOStringToDate(iso);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#1E3A8A" />
        </TouchableOpacity>
        <Text style={styles.title}>Detalhes da Reserva</Text>
      </View>

      <View style={styles.card}>
        <View style={styles.section}>
          <Text style={styles.label}>ID da Reserva</Text>
          <Text style={styles.value}>{reservaId}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Hotel</Text>
          <Text style={styles.value}>{hotelName} ({hotelCity})</Text>
          <Text style={styles.subValue}>⭐ {hotelStars} estrelas</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Quarto</Text>
          <Text style={styles.value}>{roomName}</Text>
          <Text style={styles.subValue}>{roomType} - R$ {roomPrice}/noite</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Período</Text>
          <Text style={styles.value}>Check-in: {formatarData(date_checkin as string)}</Text>
          <Text style={styles.value}>Check-out: {formatarData(date_checkout as string)}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Quartos reservados</Text>
          <Text style={styles.value}>{rooms_booked}</Text>
        </View>

        <View style={styles.statusContainer}>
          <View style={styles.statusBadge}>
            <Text style={styles.statusText}>Confirmada</Text>
          </View>
        </View>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity style={styles.button} onPress={() => router.push('/myReservations')}>
          <Text style={styles.buttonText}>Voltar às Reservas</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3F4F6' },
  content: { padding: 20 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  backButton: { marginRight: 16 },
  title: { fontSize: 22, fontWeight: 'bold', color: '#1E3A8A' },
  card: { backgroundColor: '#fff', padding: 20, borderRadius: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 4 },
  section: { marginBottom: 16 },
  label: { fontSize: 14, color: '#6B7280', marginBottom: 4 },
  value: { fontSize: 16, color: '#1F2937', fontWeight: '600' },
  subValue: { fontSize: 14, color: '#6B7280', marginTop: 2 },
  statusContainer: { alignItems: 'center', marginTop: 10 },
  statusBadge: { backgroundColor: '#DCFCE7', paddingHorizontal: 16, paddingVertical: 6, borderRadius: 20 },
  statusText: { color: '#166534', fontWeight: '600', fontSize: 14 },
  actions: { marginTop: 30 },
  button: { backgroundColor: '#1E3A8A', padding: 16, borderRadius: 8, alignItems: 'center' },
  buttonText: { color: '#fff', fontWeight: '600', fontSize: 16 },
});