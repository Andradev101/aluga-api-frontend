import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

// ✅ Dados da reserva (mock)
interface DadosReserva {
  hotel: string;
  quarto: string;
  checkin: string;
  checkout: string;
  total: string;
}

const dadosReservaMock: DadosReserva = {
  hotel: 'Nome do Hotel Ltda.',
  quarto: 'Quarto Duplo Econômico',
  checkin: '20/12/2025',
  checkout: '30/12/2025',
  total: 'R$ 1.200,00',
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

export default function TelaReserva() {
  const router = useRouter();

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

  // 🔹 URL base do backend via variável de ambiente
  const API_BASE = process.env.EXPO_PUBLIC_API_URL;

 /* // ✅ Função para obter token do Storage
  const getToken = async (): Promise<string | null> => {
    const token = await Storage.getValueFor('access_token');
    if (!token) {
      Alert.alert('Atenção', 'Você não está logado. Redirecionando para login.');
      router.push('/login');
      return null;
    }
    return token;
  };*/



 // ✅ Função para carregar dados do usuário logado via cookie de sessão
const loadUserData = async () => {
  try {
    setIsLoadingUser(true); // opcional: garante que começa carregando

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
    setIsLoadingUser(false); //
  }
};

  useEffect(() => {
    loadUserData();
  }, []);

  // Confirmar reserva (ENVIO REAL PARA O BACKEND)
  const handleConfirmarReserva = async () => {
    // Validação mínima (só o que é obrigatório)
    if (!nome || !email) {
      Alert.alert('Erro', 'Dados do usuário não carregados.');
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
        room_id: 999, // ID do quarto
        date_checkin: "2025-12-20T14:00:00",
        date_checkout: "2025-12-30T12:00:00",
      };

      const response = await fetch(`${API_BASE}/reservas`, {
        method: 'POST',
        credentials: 'include', // Envia cookie de sessão
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

      // Redireciona com os dados da reserva
      router.push({
        pathname: '/confirmacaoReserva',
        params: {
          hotel: dadosReservaMock.hotel,
          quarto: dadosReservaMock.quarto,
          checkin: dadosReservaMock.checkin,
          checkout: dadosReservaMock.checkout,
          total: dadosReservaMock.total,
          metodo: metodoPagamento,
          nomeHospede: nome,
          reservaId: result.id || 'N/A', // se o backend retornar ID
        },
      });

    } catch (err: any) {
      console.error('Erro ao confirmar reserva:', err);
      Alert.alert('Erro', err.message || 'Não foi possível confirmar a reserva. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <Text style={styles.headerTitle}>Finalizar Reserva</Text>

      {/* 1. Resumo da Reserva */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>
          <Ionicons name="receipt-outline" size={18} color="#1E3A8A" /> Resumo da Reserva
        </Text>
        <Text style={styles.textResumo}><Text style={styles.textBold}>Hotel:</Text> {dadosReservaMock.hotel}</Text>
        <Text style={styles.textResumo}><Text style={styles.textBold}>Quarto:</Text> {dadosReservaMock.quarto}</Text>
        <Text style={styles.textResumo}><Text style={styles.textBold}>Datas:</Text> {dadosReservaMock.checkin} - {dadosReservaMock.checkout}</Text>
        <View style={styles.divider} />
        <Text style={[styles.textResumo, styles.textTotal]}><Text style={styles.textBold}>Total:</Text> {dadosReservaMock.total}</Text>
      </View>

      {/* 2. Dados do Hóspede */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>
          <Ionicons name="person-circle-outline" size={20} color="#1E3A8A" /> Confirme seus dados
        </Text>

        {/* Nome completo */}
        <View style={styles.readOnlyField}>
          <Text style={styles.readOnlyLabel}>Nome completo</Text>
          <Text style={styles.readOnlyValue}>{isLoadingUser ? 'Carregando...' : nome}</Text>
        </View>

        {/* E-mail */}
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
        <RadioButton label="Cartão de Crédito/Débito" selected={metodoPagamento==='cartao'} onSelect={()=>setMetodoPagamento('cartao')} />
        <RadioButton label="Pix" selected={metodoPagamento==='pix'} onSelect={()=>setMetodoPagamento('pix')} />

        {metodoPagamento==='cartao' && (
          <View style={styles.paymentFields}>
            <TextInput style={styles.input} placeholder="Número do Cartão" keyboardType="numeric" value={numCartao} onChangeText={setNumCartao} />
            <TextInput style={styles.input} placeholder="Nome no Cartão" value={nomeCartao} onChangeText={setNomeCartao} />
            <View style={styles.row}>
              <TextInput style={[styles.input, styles.halfInput]} placeholder="Validade (MM/AA)" value={validade} onChangeText={setValidade} />
              <TextInput style={[styles.input, styles.halfInput]} placeholder="CVV" keyboardType="numeric" value={cvv} onChangeText={setCvv} />
            </View>
          </View>
        )}
      </View>

      {/* 4. Termos e Confirmação */}
      <View style={styles.switchContainer}>
        <Switch value={aceitaTermos} onValueChange={setAceitaTermos} trackColor={{ false: '#767577', true: '#1E3A8A' }} thumbColor={aceitaTermos?'#FBBF24':'#f4f3f4'} />
        <Text style={styles.labelSwitch}>Declaro que li e aceito os <Text style={styles.linkText}>Termos e Condições</Text>.</Text>
      </View>

      <TouchableOpacity
        style={[styles.button, aceitaTermos ? styles.buttonEnabled : styles.buttonDisabled]}
        onPress={handleConfirmarReserva}
        disabled={!aceitaTermos || loading}
      >
        <Text style={styles.buttonText}>{loading ? 'Processando...' : 'Confirmar Reserva'}</Text>
      </TouchableOpacity>

      <Text style={styles.secureText}>
        <Ionicons name="lock-closed-outline" size={14} color="#374151" /> Pagamento 100% Seguro
      </Text>
    </ScrollView>
  );
}

// ✅ Estilização (corrigida)
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
    marginBottom: 10,
    color: '#374151',
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
  divider: { height: 1, backgroundColor: '#F3F4F6', marginVertical: 10 },
  textResumo: { fontSize: 15, color: '#4B5563' },
  textBold: { fontWeight: '600' },
  textTotal: { fontSize: 16, fontWeight: '700', color: '#1E3A8A' },
  radioContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 8, paddingVertical: 5 },
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
  radioInnerCircle: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#1E3A8A' },
  radioLabel: { fontSize: 16, color: '#374151' },
  paymentFields: { marginTop: 5, borderLeftWidth: 3, borderLeftColor: '#FBBF24', paddingLeft: 10, paddingTop: 5 },
  switchContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 20, paddingHorizontal: 5 },
  labelSwitch: { marginLeft: 10, flexShrink: 1, color: '#374151' },
  linkText: { color: '#1E3A8A', fontWeight: 'bold' },
  button: { padding: 15, borderRadius: 8, alignItems: 'center', marginBottom: 10 },
  buttonEnabled: {
    backgroundColor: '#1E3A8A',
    shadowColor: '#1E3A8A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  buttonDisabled: { backgroundColor: '#9CA3AF' },
  buttonText: { color: 'white', fontSize: 17, fontWeight: '700', letterSpacing: 0.5 },
  secureText: { textAlign: 'center', fontSize: 12, color: '#374151', marginTop: 5 },

  // ✅ Campos somente leitura
  readOnlyField: { backgroundColor: '#F3F4F6', borderRadius: 6, padding: 10, marginBottom: 10 },
  readOnlyLabel: { fontSize: 12, fontWeight: '600', color: '#6B7280', marginBottom: 3 },
  readOnlyValue: { fontSize: 15, color: '#111827' },
});

