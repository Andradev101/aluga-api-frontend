import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

// Importação condicional do DateTimePicker (só para mobile)
let DateTimePicker: any = null;
if (Platform.OS !== 'web') {
  DateTimePicker = require('@react-native-community/datetimepicker').default;
}

// ✅ FUNÇÃO AUXILIAR: Converte Date para string no formato YYYY-MM-DD sem problemas de timezone
const dateToLocalISOString = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// ✅ FUNÇÃO AUXILIAR: Converte string YYYY-MM-DD para Date (meio-dia local para evitar problemas de timezone)
const localISOStringToDate = (dateString: string): Date => {
  const [year, month, day] = dateString.split('-').map(Number);
  return new Date(year, month - 1, day, 12, 0, 0);
};

// ✅ Radio Button
interface RadioButtonProps {
  label: string;
  selected: boolean;
  onSelect: () => void;
}

const RadioButton: React.FC<RadioButtonProps> = ({ label, selected, onSelect }) => (
  <TouchableOpacity style={styles.radioContainer} onPress={onSelect}>
    <View style={styles.radioCircle}>
      {selected && <View style={styles.radioInnerCircle} />}
    </View>
    <Text style={styles.radioLabel}>{label}</Text>
  </TouchableOpacity>
);

// ✅ Tipo do usuário
interface User {
  id: string;
  userName: string;
  role: string;
  birthDate: string;
  emailAddress: string;
  phoneNumber?: string;
  firstName: string;
  lastName: string;
  address?: string;
}

// ✅ Interface para Quarto
interface Room {
  id: number;
  name: string;
  room_type: string;
  base_price: number;
  capacity: number;
  total_units: number;
  amenities: string[];
}

// ✅ Interface para Hotel Completo
interface HotelDetails {
  id: number;
  name: string;
  description: string | null;
  city: string;
  neighborhood: string | null;
  stars: number;
  rooms: Room[];
}

export default function TelaReserva() {
  const params = useLocalSearchParams();
  const router = useRouter();

  // Parâmetros recebidos da navegação
  const hotelName = (params.hotelName as string) || 'Hotel não informado';
  const hotelId = (params.hotelId as string) || '1';

  // Estados
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [numCartao, setNumCartao] = useState('');
  const [nomeCartao, setNomeCartao] = useState('');
  const [validade, setValidade] = useState('');
  const [cvv, setCvv] = useState('');
  const [metodoPagamento, setMetodoPagamento] = useState<'cartao' | 'pix'>('cartao');
  const [aceitaTermos, setAceitaTermos] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isLoadingUser, setIsLoadingUser] = useState(true);

  // 🔹 Estados para quartos
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loadingRooms, setLoadingRooms] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);

  // 🔹 Estados para datas e cálculo
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [numNoites, setNumNoites] = useState(0);
  const [valorTotal, setValorTotal] = useState(0);
  
  // Estados para controlar exibição dos pickers
  const [showCheckInPicker, setShowCheckInPicker] = useState(false);
  const [showCheckOutPicker, setShowCheckOutPicker] = useState(false);

  const API_BASE = process.env.EXPO_PUBLIC_API_URL;

  // ✅ Função para carregar dados do usuário logado
  const loadUserData = async () => {
    try {
      setIsLoadingUser(true);

      const res = await fetch(`${API_BASE}/users/me`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!res.ok) {
        throw new Error(`Erro ao buscar dados do usuário: ${res.status}`);
      }

      const user: User = await res.json();
      setNome(`${user.firstName} ${user.lastName}`);
      setEmail(user.emailAddress);
    } catch (err) {
      console.error(err);
      Alert.alert('Erro', 'Não foi possível carregar os dados do usuário.');
    } finally {
      setIsLoadingUser(false);
    }
  };

  // ✅ Função para carregar dados do hotel e seus quartos
  const loadHotelAndRooms = async () => {
    try {
      setLoadingRooms(true);

      const res = await fetch(`${API_BASE}/hotels/${hotelId}`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!res.ok) {
        throw new Error(`Erro ao buscar dados do hotel: ${res.status}`);
      }

      const hotelData: HotelDetails = await res.json();
      setRooms(hotelData.rooms || []);
      
      // Seleciona automaticamente o primeiro quarto se houver apenas um
      if (hotelData.rooms && hotelData.rooms.length === 1) {
        setSelectedRoom(hotelData.rooms[0]);
      }
    } catch (err) {
      console.error(err);
      Alert.alert('Erro', 'Não foi possível carregar os quartos disponíveis.');
    } finally {
      setLoadingRooms(false);
    }
  };

  useEffect(() => {
    loadUserData();
    loadHotelAndRooms();
  }, []);

  // 🔹 Calcular número de noites e valor total
  useEffect(() => {
    if (checkIn && checkOut && selectedRoom) {
      const dataInicio = localISOStringToDate(checkIn);
      const dataFim = localISOStringToDate(checkOut);
      
      if (dataFim > dataInicio) {
        const diffTime = Math.abs(dataFim.getTime() - dataInicio.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        setNumNoites(diffDays);
        setValorTotal(diffDays * selectedRoom.base_price);
      } else {
        setNumNoites(0);
        setValorTotal(0);
      }
    } else {
      setNumNoites(0);
      setValorTotal(0);
    }
  }, [checkIn, checkOut, selectedRoom]);

  // 🔹 Validar data mínima (hoje)
  const getDataMinima = () => {
    const hoje = new Date();
    return dateToLocalISOString(hoje);
  };

  // 🔹 Validar check-out mínimo (1 dia após check-in)
  const getCheckOutMinimo = () => {
    if (!checkIn) return getDataMinima();
    
    const dataCheckIn = localISOStringToDate(checkIn);
    dataCheckIn.setDate(dataCheckIn.getDate() + 1);
    return dateToLocalISOString(dataCheckIn);
  };

  // 🔹 Formatar data para exibição
  const formatarData = (dataISO: string) => {
    if (!dataISO) return '';
    const data = localISOStringToDate(dataISO);
    return data.toLocaleDateString('pt-BR');
  };

  // 🔹 Handlers para os date pickers
  const handleCheckInChange = (event: any, selectedDate?: Date) => {
    setShowCheckInPicker(Platform.OS === 'ios');
    if (selectedDate) {
      const dateString = dateToLocalISOString(selectedDate);
      setCheckIn(dateString);
      // Reset check-out se for anterior à nova data de check-in
      if (checkOut && localISOStringToDate(checkOut) <= selectedDate) {
        setCheckOut('');
      }
    }
  };

  const handleCheckOutChange = (event: any, selectedDate?: Date) => {
    setShowCheckOutPicker(Platform.OS === 'ios');
    if (selectedDate) {
      const dateString = dateToLocalISOString(selectedDate);
      setCheckOut(dateString);
    }
  };

  // Confirmar reserva
  const handleConfirmarReserva = async () => {
    if (!nome || !email) {
      Alert.alert('Erro', 'Dados do usuário não carregados.');
      return;
    }

    if (!selectedRoom) {
      Alert.alert('Erro', 'Por favor, selecione um quarto.');
      return;
    }

    if (!checkIn || !checkOut) {
      Alert.alert('Erro', 'Por favor, selecione as datas de check-in e check-out.');
      return;
    }

    if (numNoites <= 0) {
      Alert.alert('Erro', 'A data de check-out deve ser posterior ao check-in.');
      return;
    }

    if (!aceitaTermos) {
      Alert.alert('Erro', 'Você precisa aceitar os Termos e Condições.');
      return;
    }

    if (metodoPagamento === 'cartao' && (!numCartao || !nomeCartao || !cvv)) {
      Alert.alert('Erro', 'Preencha os dados do cartão.');
      return;
    }

    try {
      setLoading(true);

      const reservaData = {
        hotel_id: Number(hotelId),
        room_id: selectedRoom.id,
        check_in: checkIn,
        check_out: checkOut,
        rooms_booked: 1,
      };

      const response = await fetch(`${API_BASE}/bookings/`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(reservaData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Erro na resposta:', response.status, errorText);
        throw new Error(`Erro ${response.status}: Falha ao criar reserva`);
      }

      const result = await response.json();
      console.log('Reserva criada com sucesso:', result);

      Alert.alert('Sucesso', 'Reserva confirmada com sucesso!');

      router.push({
        pathname: '/confirmacaoReserva',
        params: {
          hotelName,
          roomName: selectedRoom.name,
          checkin: checkIn,
          checkout: checkOut,
          total: valorTotal.toFixed(2),
          metodo: metodoPagamento,
          nomeHospede: nome,
          reservaId: result.id || 'N/A',
        },
      });
    } catch (err: any) {
      console.error('Erro ao confirmar reserva:', err);
      Alert.alert('Erro', err.message || 'Não foi possível confirmar a reserva.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <Text style={styles.headerTitle}>Finalizar Reserva</Text>

      {/* 0. Seleção de Quarto */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>
          <Ionicons name="bed-outline" size={18} color="#1E3A8A" /> Escolha seu Quarto
        </Text>
        
        <Text style={styles.hotelInfo}>
          <Ionicons name="business-outline" size={16} color="#6B7280" /> {hotelName}
        </Text>

        {loadingRooms ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color="#1E3A8A" />
            <Text style={styles.loadingText}>Carregando quartos disponíveis...</Text>
          </View>
        ) : rooms.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Nenhum quarto disponível no momento.</Text>
          </View>
        ) : (
          <View style={styles.roomsContainer}>
            {rooms.map((room) => (
              <TouchableOpacity
                key={room.id}
                style={[
                  styles.roomCard,
                  selectedRoom?.id === room.id && styles.roomCardSelected
                ]}
                onPress={() => setSelectedRoom(room)}
              >
                <View style={styles.roomHeader}>
                  <View style={styles.radioCircle}>
                    {selectedRoom?.id === room.id && <View style={styles.radioInnerCircle} />}
                  </View>
                  <View style={styles.roomInfo}>
                    <Text style={styles.roomName}>{room.name}</Text>
                    <Text style={styles.roomType}>{room.room_type}</Text>
                  </View>
                </View>
                
                <View style={styles.roomFooter}>
                  <Text style={styles.roomOccupancy}>
                    <Ionicons name="people-outline" size={14} color="#6B7280" /> 
                    {' '}Até {room.capacity} {room.capacity === 1 ? 'pessoa' : 'pessoas'}
                  </Text>
                  <Text style={styles.roomPrice}>
                    R$ {room.base_price.toFixed(2).replace('.', ',')}/noite
                  </Text>
                </View>
                
                {room.total_units > 0 && (
                  <Text style={styles.roomUnits}>
                    ✓ {room.total_units} {room.total_units === 1 ? 'unidade disponível' : 'unidades disponíveis'}
                  </Text>
                )}
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

      {/* 1. Seleção de Datas e Resumo da Reserva */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>
          <Ionicons name="calendar-outline" size={18} color="#1E3A8A" /> Datas da Estadia
        </Text>

        {/* Check-in */}
        <View style={styles.dateInputContainer}>
          <Text style={styles.dateLabel}>Check-in</Text>
          {Platform.OS === 'web' ? (
            <input
              type="date"
              value={checkIn}
              onChange={(e: any) => setCheckIn(e.target.value)}
              min={getDataMinima()}
              style={{
                height: 50,
                borderColor: '#D1D5DB',
                borderWidth: 1,
                borderRadius: 8,
                paddingLeft: 12,
                paddingRight: 12,
                fontSize: 15,
                fontFamily: 'system-ui',
                width: '100%',
                backgroundColor: '#FFF',
                cursor: 'pointer',
              }}
            />
          ) : (
            <TouchableOpacity onPress={() => setShowCheckInPicker(true)}>
              <View style={styles.dateInput}>
                <Text style={checkIn ? styles.dateText : styles.datePlaceholder}>
                  {checkIn ? formatarData(checkIn) : 'Selecione a data de entrada'}
                </Text>
                <Ionicons name="calendar-outline" size={20} color="#1E3A8A" style={styles.calendarIcon} />
              </View>
            </TouchableOpacity>
          )}
        </View>

        {Platform.OS !== 'web' && showCheckInPicker && DateTimePicker && (
          <DateTimePicker
            value={checkIn ? localISOStringToDate(checkIn) : new Date()}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={handleCheckInChange}
            minimumDate={new Date()}
          />
        )}

        {/* Check-out */}
        <View style={styles.dateInputContainer}>
          <Text style={styles.dateLabel}>Check-out</Text>
          {Platform.OS === 'web' ? (
            <input
              type="date"
              value={checkOut}
              onChange={(e: any) => setCheckOut(e.target.value)}
              min={getCheckOutMinimo()}
              disabled={!checkIn}
              style={{
                height: 50,
                borderColor: !checkIn ? '#E5E7EB' : '#D1D5DB',
                borderWidth: 1,
                borderRadius: 8,
                paddingLeft: 12,
                paddingRight: 12,
                fontSize: 15,
                fontFamily: 'system-ui',
                width: '100%',
                backgroundColor: !checkIn ? '#F3F4F6' : '#FFF',
                cursor: checkIn ? 'pointer' : 'not-allowed',
              }}
            />
          ) : (
            <TouchableOpacity 
              onPress={() => checkIn && setShowCheckOutPicker(true)}
              disabled={!checkIn}
            >
              <View style={[styles.dateInput, !checkIn && styles.dateInputDisabled]}>
                <Text style={checkOut ? styles.dateText : styles.datePlaceholder}>
                  {checkOut ? formatarData(checkOut) : 'Selecione a data de saída'}
                </Text>
                <Ionicons 
                  name="calendar-outline" 
                  size={20} 
                  color={checkIn ? "#1E3A8A" : "#9CA3AF"} 
                  style={styles.calendarIcon} 
                />
              </View>
            </TouchableOpacity>
          )}
          {!checkIn && Platform.OS !== 'web' && (
            <Text style={styles.helperText}>Primeiro selecione o check-in</Text>
          )}
        </View>

        {Platform.OS !== 'web' && showCheckOutPicker && checkIn && DateTimePicker && (
          <DateTimePicker
            value={checkOut ? localISOStringToDate(checkOut) : (() => {
              const minDate = localISOStringToDate(checkIn);
              minDate.setDate(minDate.getDate() + 1);
              return minDate;
            })()}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={handleCheckOutChange}
            minimumDate={(() => {
              const minDate = localISOStringToDate(checkIn);
              minDate.setDate(minDate.getDate() + 1);
              return minDate;
            })()}
          />
        )}

        <View style={styles.divider} />

        {/* Resumo */}
        <Text style={styles.sectionSubtitle}>Resumo da Reserva</Text>
        <Text style={styles.textResumo}>
          <Text style={styles.textBold}>Hotel:</Text> {hotelName}
        </Text>
        {selectedRoom && (
          <Text style={styles.textResumo}>
            <Text style={styles.textBold}>Quarto:</Text> {selectedRoom.name}
          </Text>
        )}
        
        {numNoites > 0 && selectedRoom && (
          <>
            <Text style={styles.textResumo}>
              <Text style={styles.textBold}>Período:</Text> {formatarData(checkIn)} até {formatarData(checkOut)}
            </Text>
            <Text style={styles.textResumo}>
              <Text style={styles.textBold}>Noites:</Text> {numNoites} {numNoites === 1 ? 'noite' : 'noites'}
            </Text>
            <Text style={styles.textResumo}>
              <Text style={styles.textBold}>Valor por noite:</Text> R$ {selectedRoom.base_price.toFixed(2).replace('.', ',')}
            </Text>
          </>
        )}

        <View style={styles.divider} />
        
        <Text style={[styles.textResumo, styles.textTotal]}>
          <Text style={styles.textBold}>Total:</Text> R$ {valorTotal > 0 ? valorTotal.toFixed(2).replace('.', ',') : '0,00'}
        </Text>
        
        {numNoites === 0 && checkIn && checkOut && (
          <Text style={styles.errorText}>⚠️ Selecione datas válidas</Text>
        )}
        
        {!selectedRoom && (
          <Text style={styles.warningText}>⚠️ Selecione um quarto para continuar</Text>
        )}
      </View>

      {/* 2. Dados do Hóspede */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>
          <Ionicons name="person-circle-outline" size={20} color="#1E3A8A" /> Confirme seus dados
        </Text>

        <View style={styles.readOnlyField}>
          <Text style={styles.readOnlyLabel}>Nome completo</Text>
          <Text style={styles.readOnlyValue}>{isLoadingUser ? 'Carregando...' : nome}</Text>
        </View>

        <View style={styles.readOnlyField}>
          <Text style={styles.readOnlyLabel}>E-mail</Text>
          <Text style={styles.readOnlyValue}>{isLoadingUser ? 'Carregando...' : email}</Text>
        </View>
      </View>

      {/* 3. Método de Pagamento */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>
          <Ionicons name="card-outline" size={18} color="#1E3A8A" /> Método de Pagamento
        </Text>
        <RadioButton 
          label="Cartão de Crédito/Débito" 
          selected={metodoPagamento === 'cartao'} 
          onSelect={() => setMetodoPagamento('cartao')} 
        />
        <RadioButton 
          label="Pix" 
          selected={metodoPagamento === 'pix'} 
          onSelect={() => setMetodoPagamento('pix')} 
        />

        {metodoPagamento === 'cartao' && (
          <View style={styles.paymentFields}>
            <TextInput 
              style={styles.input} 
              placeholder="Número do Cartão" 
              keyboardType="numeric" 
              value={numCartao} 
              onChangeText={setNumCartao} 
            />
            <TextInput 
              style={styles.input} 
              placeholder="Nome no Cartão" 
              value={nomeCartao} 
              onChangeText={setNomeCartao} 
            />
            <View style={styles.row}>
              <TextInput 
                style={[styles.input, styles.halfInput]} 
                placeholder="Validade (MM/AA)" 
                value={validade} 
                onChangeText={setValidade} 
              />
              <TextInput 
                style={[styles.input, styles.halfInput]} 
                placeholder="CVV" 
                keyboardType="numeric" 
                value={cvv} 
                onChangeText={setCvv} 
              />
            </View>
          </View>
        )}
      </View>

      {/* 4. Termos e Confirmação */}
      <View style={styles.switchContainer}>
        <Switch 
          value={aceitaTermos} 
          onValueChange={setAceitaTermos} 
          trackColor={{ false: '#767577', true: '#1E3A8A' }} 
          thumbColor={aceitaTermos ? '#FBBF24' : '#f4f3f4'} 
        />
        <Text style={styles.labelSwitch}>
          Declaro que li e aceito os <Text style={styles.linkText}>Termos e Condições</Text>.
        </Text>
      </View>

      <TouchableOpacity
        style={[styles.button, (aceitaTermos && numNoites > 0 && selectedRoom) ? styles.buttonEnabled : styles.buttonDisabled]}
        onPress={handleConfirmarReserva}
        disabled={!aceitaTermos || loading || numNoites <= 0 || !selectedRoom}
      >
        <Text style={styles.buttonText}>
          {loading ? 'Processando...' : 'Confirmar Reserva'}
        </Text>
      </TouchableOpacity>

      {/* NOVO BOTÃO CANCELAR - VOLTA PARA TELA ANTERIOR */}
      <TouchableOpacity
        style={[styles.button, styles.buttonCancelar]}
        onPress={() => router.back()}
      >
        <Text style={styles.buttonTextCancelar}>
          Cancelar
        </Text>
      </TouchableOpacity>

      <Text style={styles.secureText}>
        <Ionicons name="lock-closed-outline" size={14} color="#374151" /> Pagamento 100% Seguro
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#E5E7EB' },
  contentContainer: {
    padding: 35,
    paddingBottom: 80,
    maxWidth: 700,
    alignSelf: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#1E3A8A',
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#FFFFFF',
    padding: 25,
    borderRadius: 12,
    marginBottom: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#374151',
  },
  sectionSubtitle: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 10,
    marginBottom: 10,
    color: '#374151',
  },
  hotelInfo: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 15,
    fontStyle: 'italic',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  loadingText: {
    marginLeft: 10,
    color: '#6B7280',
    fontSize: 14,
  },
  emptyContainer: {
    padding: 20,
    alignItems: 'center',
  },
  emptyText: {
    color: '#6B7280',
    fontSize: 14,
    textAlign: 'center',
  },
  roomsContainer: {
    gap: 12,
  },
  roomCard: {
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    padding: 15,
    backgroundColor: '#FAFAFA',
  },
  roomCardSelected: {
    borderColor: '#1E3A8A',
    backgroundColor: '#EFF6FF',
  },
  roomHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  roomInfo: {
    flex: 1,
    marginLeft: 10,
  },
  roomName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  roomType: {
    fontSize: 13,
    color: '#6B7280',
  },
  roomFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  roomOccupancy: {
    fontSize: 12,
    color: '#6B7280',
  },
  roomPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1E3A8A',
  },
  roomUnits: {
    fontSize: 12,
    color: '#059669',
    marginTop: 6,
    fontWeight: '500',
  },
  dateInputContainer: {
    marginBottom: 15,
  },
  dateLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  dateInput: {
    height: 50,
    borderColor: '#D1D5DB',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateInputDisabled: {
    backgroundColor: '#F3F4F6',
    borderColor: '#E5E7EB',
  },
  dateText: {
    flex: 1,
    fontSize: 15,
    color: '#111827',
  },
  datePlaceholder: {
    flex: 1,
    fontSize: 15,
    color: '#9CA3AF',
  },
  calendarIcon: {
    marginLeft: 8,
  },
  helperText: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
    fontStyle: 'italic',
  },
  input: {
    height: 45,
    borderColor: '#D1D5DB',
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 10,
    marginBottom: 10,
    backgroundColor: '#FFF',
  },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  halfInput: { width: '48%' },
  divider: { height: 1, backgroundColor: '#F3F4F6', marginVertical: 15 },
  textResumo: { fontSize: 15, color: '#4B5563', marginBottom: 8 },
  textBold: { fontWeight: '600' },
  textTotal: { fontSize: 18, fontWeight: '700', color: '#1E3A8A', marginTop: 5 },
  errorText: { 
    fontSize: 13, 
    color: '#DC2626', 
    marginTop: 5,
    fontWeight: '500' 
  },
  warningText: { 
    fontSize: 13, 
    color: '#F59E0B', 
    marginTop: 5,
    fontWeight: '500' 
  },
  radioContainer: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginBottom: 8, 
    paddingVertical: 5 
  },
  radioCircle: {
    height: 20,
    width: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#1E3A8A',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  radioInnerCircle: { 
    width: 10, 
    height: 10, 
    borderRadius: 5, 
    backgroundColor: '#1E3A8A' 
  },
  radioLabel: { fontSize: 16, color: '#374151' },
  paymentFields: { 
    marginTop: 5, 
    borderLeftWidth: 3, 
    borderLeftColor: '#FBBF24', 
    paddingLeft: 10, 
    paddingTop: 5 
  },
  switchContainer: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginBottom: 20, 
    paddingHorizontal: 5 
  },
  labelSwitch: { 
    marginLeft: 10, 
    flexShrink: 1, 
    color: '#374151' 
  },
  linkText: { 
    color: '#1E3A8A', 
    fontWeight: 'bold' 
  },
  button: { 
    padding: 15, 
    borderRadius: 8, 
    alignItems: 'center', 
    marginBottom: 10 
  },
  buttonEnabled: {
    backgroundColor: '#1E3A8A',
    shadowColor: '#1E3A8A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  buttonDisabled: { 
    backgroundColor: '#9CA3AF' 
  },
  buttonText: { 
    color: 'white', 
    fontSize: 17, 
    fontWeight: '700', 
    letterSpacing: 0.5 
  },
  secureText: { 
    textAlign: 'center', 
    fontSize: 12, 
    color: '#374151', 
    marginTop: 5 
  },
  readOnlyField: { 
    backgroundColor: '#F3F4F6', 
    borderRadius: 6, 
    padding: 10, 
    marginBottom: 10 
  },
  readOnlyLabel: { 
    fontSize: 12, 
    fontWeight: '600', 
    color: '#6B7280', 
    marginBottom: 3 
  },
  readOnlyValue: { 
    fontSize: 15, 
    color: '#111827' 
  },
  buttonCancelar: {
    backgroundColor: '#DC2626',
    marginTop: 12,
    shadowColor: '#DC2626',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  buttonTextCancelar: {
    color: 'white',
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});