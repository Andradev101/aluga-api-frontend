// services/hotels-api.ts

import {
  HotelCardOut,
  HotelDetailOut,
  HotelIn,
  HotelSearchParams,
  MediaIn,
  RoomIn
} from "@/types/hotels";
import { PageOut } from "@/types/pagination";

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

/**
 * ----------------------------------------------------------------------
 * READ LISTA (GET /hotels)
 * ----------------------------------------------------------------------
 * Busca a lista de hotéis, aplicando filtros e paginação.
 * * @param params Todos os filtros e parâmetros de paginação (HotelSearchParams).
 * @returns Promise<HotelCardOut[]> (ou um objeto de resposta paginada, dependendo do backend).
 */
export const getAllHotels = async (
  params: HotelSearchParams = {} // Recebe todos os filtros
): Promise<HotelCardOut[]> => {
  
  // Lógica de processamento e serialização dos Parâmetros (reutilizando a lógica de getHotel)
  const queryParams = Object.entries(params)
    .filter(([, value]) => value !== undefined && value !== null)
    .flatMap(([key, value]) => {
      
      if (key === 'amenities' && Array.isArray(value)) {
        return value.map(item => [key, String(item)]); 
      }
      if (value instanceof Date) {
        return [[key, value.toISOString().split('T')[0]]]; 
      }
      return [[key, String(value)]];
    });

  const query = new URLSearchParams(queryParams as [string, string][]).toString();
  
  try {
    const url = getApiUrl(`/hotels${query ? `?${query}` : ''}`);
    const response = await fetch(url, getDefaultOptions('GET'));
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.detail || `Erro ${response.status} ao buscar lista de hotéis`);
    }

    // Assumimos que o backend retorna diretamente o array de HotelCardOut (ou o PaginatedResponse).
    return data;
  } catch (error) {
    console.error('Erro de API ao buscar lista de hotéis:', error);
    
    // --- LÓGICA DE FALLBACK PARA TESTES ---
    if (process.env.EXPO_PUBLIC_USE_MOCK_API === 'true') {
      console.warn(`[MOCK] Falha de API ignorada. Retornando lista de hotéis de teste.`);
      
      // MOCK data com a estrutura HotelCardOut
      return [
        { id: 100, name: 'MOCK Rio Beach Club', city: 'Rio de Janeiro', neighborhood: 'Leblon', stars: 5, popularity: 0.95, min_price_general: 450, min_price_available: 400, distance_km: 0.5, thumbnail: 'https://placehold.co/100x100?text=Mock+1' },
        { id: 101, name: 'MOCK SP Business Tower', city: 'São Paulo', neighborhood: 'Faria Lima', stars: 4, popularity: 0.88, min_price_general: 250, min_price_available: 230, distance_km: 3.2, thumbnail: 'https://placehold.co/100x100?text=Mock+2' },
        { id: 102, name: 'MOCK Villa Amazônica', city: 'Manaus', neighborhood: 'Centro', stars: 3, popularity: 0.70, min_price_general: 150, min_price_available: null, distance_km: 15.0, thumbnail: 'https://placehold.co/100x100?text=Mock+3' },
      ] as HotelCardOut[]; // Força a tipagem do mock
    }
    
    throw error;
  }
};


// ----------------------------------------------------------------------
//                        SEARCH / FILTRO (GET /search)
// ----------------------------------------------------------------------

/**
 * Busca e filtra hotéis de forma paginada (GET /hotels/search).
 * @param params Os parâmetros de busca e paginação.
 * @returns Um objeto paginado (PageOut) contendo uma lista de HotelCardOut.
 */
export const searchHotels = async (
  params: HotelSearchParams = {}
): Promise<PageOut<HotelCardOut>> => {
  // Constrói a URL de busca com base nos parâmetros
  const query = new URLSearchParams(
    Object.entries(params).filter(([, value]) => value !== undefined) as [string, string][]
  ).toString();

  try {
    const url = getApiUrl(`/hotels/search?${query}`);
    const response = await fetch(url, getDefaultOptions('GET'));
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.detail || 'Erro ao buscar hotéis paginados');
    }

    return data;
  } catch (error) {
    console.error('Erro ao buscar hotéis:', error);
    throw error;
  }
};

// ----------------------------------------------------------------------
//                          CREATE (POST /)
// ----------------------------------------------------------------------

/**
 * Cria um hotel de forma básica (POST /hotels).
 * Nota: O backend retorna {id: number}, diferente de /full.
 * @param hotelData O payload de criação (HotelIn).
 * @returns O ID do hotel criado.
 */
export const createHotel = async (hotelData: HotelIn): Promise<{ id: number }> => {
  try {
    const response = await fetch(
      getApiUrl('/hotels'),
      {
        ...getDefaultOptions('POST'),
        body: JSON.stringify(hotelData),
      }
    );
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.detail || 'Erro ao criar o hotel.');
    }

    // O backend retorna apenas o ID neste endpoint
    return data;
  } catch (error) {
    console.error('Erro ao criar hotel:', error);
    throw error;
  }
};

// ----------------------------------------------------------------------
//                          UPDATE (PUT /{hotel_id})
// ----------------------------------------------------------------------

/**
 * Atualiza completamente um hotel existente (PUT /hotels/{hotel_id}).
 * @param hotelId O ID do hotel.
 * @param hotelData O objeto HotelIn completo com as modificações.
 * @returns O HotelDetailOut completo retornado pelo backend.
 */
export const updateHotel = async (
  hotelId: number | string,
  hotelData: HotelIn
): Promise<HotelDetailOut> => {
  try {
    const response = await fetch(
      getApiUrl(`/hotels/${hotelId}`),
      {
        ...getDefaultOptions('PUT'),
        body: JSON.stringify(hotelData),
      }
    );
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.detail || 'Erro ao atualizar o hotel.');
    }

    return data;
  } catch (error) {
    console.error(`Erro ao atualizar hotel ${hotelId}:`, error);
    throw error;
  }
};

// ----------------------------------------------------------------------
//                        DELETE (DELETE /{hotel_id})
// ----------------------------------------------------------------------

/**
 * Remove um hotel (DELETE /hotels/{hotel_id}).
 * @param hotelId O ID do hotel a ser removido.
 */
export const deleteHotel = async (hotelId: number | string): Promise<void> => {
  try {
    const response = await fetch(
      getApiUrl(`/hotels/${hotelId}`),
      getDefaultOptions('DELETE')
    );

    if (response.status !== 204) {
      const data = await response.json();
      throw new Error(data.detail || 'Erro ao remover o hotel.');
    }

  } catch (error) {
    console.error(`Erro ao remover hotel ${hotelId}:`, error);
    throw error;
  }
};

// ----------------------------------------------------------------------
//                    ORCHESTRATED ENDPOINTS (POST /{hotel_id}/...)
// ----------------------------------------------------------------------

/**
 * Adiciona uma lista de quartos (POST /hotels/{hotel_id}/rooms).
 */
export const addRooms = async (
  hotelId: number | string,
  roomsData: RoomIn[]
): Promise<HotelDetailOut> => {
  try {
    const response = await fetch(
      getApiUrl(`/hotels/${hotelId}/rooms`),
      { ...getDefaultOptions('POST'), body: JSON.stringify(roomsData) }
    );
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.detail || 'Erro ao adicionar quartos ao hotel.');
    }

    return data;
  } catch (error) {
    console.error(`Erro ao adicionar quartos ao hotel ${hotelId}:`, error);
    throw error;
  }
};

/**
 * Adiciona uma lista de mídias (POST /hotels/{hotel_id}/media).
 */
export const addMedia = async (
  hotelId: number | string,
  mediaData: MediaIn[]
): Promise<HotelDetailOut> => {
  try {
    const response = await fetch(
      getApiUrl(`/hotels/${hotelId}/media`),
      { ...getDefaultOptions('POST'), body: JSON.stringify(mediaData) }
    );
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.detail || 'Erro ao adicionar mídias ao hotel.');
    }

    return data;
  } catch (error) {
    console.error(`Erro ao adicionar mídias ao hotel ${hotelId}:`, error);
    throw error;
  }
};

/**
 * Associa amenities existentes (POST /hotels/{hotel_id}/amenities).
 */
export const addAmenities = async (
  hotelId: number | string,
  amenityIds: number[]
): Promise<HotelDetailOut> => {
  try {
    const response = await fetch(
      getApiUrl(`/hotels/${hotelId}/amenities`),
      {
        ...getDefaultOptions('POST'),
        body: JSON.stringify(amenityIds) // Envia a lista de IDs
      }
    );
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.detail || 'Erro ao adicionar amenities ao hotel.');
    }

    return data;
  } catch (error) {
    console.error(`Erro ao adicionar amenities ao hotel ${hotelId}:`, error);
    throw error;
  }
};

/**
 * Cria o hotel junto com rooms, media e amenities em um único payload (POST /hotels/full).
 * @param hotelData O payload de criação (HotelIn).
 * @returns O HotelDetailOut completo retornado pelo servidor.
 */
export const createFullHotel = async (hotelData: HotelIn): Promise<HotelDetailOut> => {
  try {
    const response = await fetch(
      getApiUrl('/hotels/full'),
      {
        ...getDefaultOptions('POST'),
        body: JSON.stringify(hotelData),
      }
    );
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.detail || 'Erro ao criar o hotel completo.');
    }
    return data;
  } catch (error) {
    console.error('Erro ao criar hotel completo:', error);
    throw error;
  }
};