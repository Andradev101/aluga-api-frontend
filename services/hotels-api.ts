// API para buscar informações de hotéis
const getApiUrl = (endpoint: string) => `${process.env.EXPO_PUBLIC_API_URL}${endpoint}`;

const getDefaultOptions = (method: string = 'GET'): RequestInit => ({
  method,
  credentials: 'include' as RequestCredentials,
  headers: { 'content-type': 'application/json' }
});

export interface Hotel {
  id: number;
  name: string;
  description?: string;
  location?: string;
}

export const getHotel = async (hotelId: string): Promise<Hotel> => {
  try {
    const response = await fetch(
      getApiUrl(`/hotels/${hotelId}`),
      getDefaultOptions('GET')
    );
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.detail || 'Erro ao buscar hotel');
    }
    
    return data;
  } catch (error) {
    console.error('Erro ao buscar hotel:', error);
    // Fallback para mock local
    const hotels: { [key: string]: Hotel } = {
      '1': { id: 1, name: 'Hotel Copacabana Palace' },
      '2': { id: 2, name: 'Hotel Fasano Rio' },
      '3': { id: 3, name: 'Hotel Santa Teresa' },
    };
    return hotels[hotelId] || { id: parseInt(hotelId), name: `Hotel ID ${hotelId}` };
  }
};

export const getAllHotels = async (): Promise<Hotel[]> => {
  try {
    const response = await fetch(
      getApiUrl('/hotels'),
      getDefaultOptions('GET')
    );
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.detail || 'Erro ao buscar hotéis');
    }
    
    return data;
  } catch (error) {
    console.error('Erro ao buscar hotéis:', error);
    throw error;
  }
};