import {
    HotelCardOut,
    HotelDetailOut,
    HotelIn,
    HotelSearchParams,
    MediaIn,
    RoomIn
} from "@/types/hotels";
import { PageOut } from "@/types/pagination";

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

async function handleResponse<T>(response: Response): Promise<T> {
    if (response.ok) {
        try {
            return await response.json();
        } catch (e) {
            if (response.status === 204) return {} as T;
            throw new Error(`Erro de parse JSON em resposta 2xx: ${e}`);
        }
    } else {
        let errorData: any;
        let errorMessage: string;

        try {
            errorData = await response.json();
            errorMessage = errorData.detail || `Erro ${response.status} - ${response.statusText}`;
        } catch (e) {
            const text = await response.text();
            errorMessage = `Erro ${response.status} - ${response.statusText}. Resposta não JSON: ${text.substring(0, 50)}...`;
        }
        
        throw new Error(errorMessage);
    }
}

export const getHotelDetails = async (hotelId: number | string): Promise<HotelDetailOut> => {
    try {
        const response = await fetch(
            getApiUrl(`/hotels/${hotelId}`),
            getDefaultOptions('GET')
        );
        return await handleResponse<HotelDetailOut>(response);
    } catch (error) {
        console.error('Erro ao buscar detalhes do hotel:', error);
        throw error;
    }
};

export const getAllHotels = async (
    params: HotelSearchParams = {}
): Promise<HotelCardOut[]> => {
    
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
        
        return await handleResponse<HotelCardOut[]>(response);

    } catch (error) {
        console.error('Erro de API ao buscar lista de hotéis:', error);
        
        if (process.env.EXPO_PUBLIC_USE_MOCK_API === 'true') {
            console.warn(`[MOCK] Falha de API ignorada. Retornando lista de hotéis de teste.`);
            return [
                { id: 100, name: 'MOCK Rio Beach Club', city: 'Rio de Janeiro', neighborhood: 'Leblon', stars: 5, popularity: 0.95, min_price_general: 450, min_price_available: 400, distance_km: 0.5, thumbnail: 'https://placehold.co/100x100?text=Mock+1' },
                { id: 101, name: 'MOCK SP Business Tower', city: 'São Paulo', neighborhood: 'Faria Lima', stars: 4, popularity: 0.88, min_price_general: 250, min_price_available: 230, distance_km: 3.2, thumbnail: 'https://placehold.co/100x100?text=Mock+2' },
                { id: 102, name: 'MOCK Villa Amazônica', city: 'Manaus', neighborhood: 'Centro', stars: 3, popularity: 0.70, min_price_general: 150, min_price_available: null, distance_km: 15.0, thumbnail: 'https://placehold.co/100x100?text=Mock+3' },
            ] as HotelCardOut[]; 
        }
        
        throw error;
    }
};

export const searchHotels = async (
    params: HotelSearchParams = {}
): Promise<PageOut<HotelCardOut>> => {
    const query = new URLSearchParams(
        Object.entries(params).filter(([, value]) => value !== undefined) as [string, string][]
    ).toString();

    try {
        const url = getApiUrl(`/hotels/search?${query}`);
        const response = await fetch(url, getDefaultOptions('GET'));
        
        return await handleResponse<PageOut<HotelCardOut>>(response);

    } catch (error) {
        console.error('Erro ao buscar hotéis:', error);
        throw error;
    }
};

export const createHotel = async (hotelData: HotelIn): Promise<{ id: number }> => {
    try {
        const response = await fetch(
            getApiUrl('/hotels'),
            {
                ...getDefaultOptions('POST'),
                body: JSON.stringify(hotelData),
            }
        );
        
        return await handleResponse<{ id: number }>(response);
        
    } catch (error) {
        console.error('Erro ao criar hotel:', error);
        throw error;
    }
};

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
        
        return await handleResponse<HotelDetailOut>(response);

    } catch (error) {
        console.error(`Erro ao atualizar hotel ${hotelId}:`, error);
        throw error;
    }
};

export const deleteHotel = async (hotelId: number | string): Promise<void> => {
    try {
        const response = await fetch(
            getApiUrl(`/hotels/${hotelId}`),
            getDefaultOptions('DELETE')
        );

        if (response.status === 204) return;
        
        await handleResponse<void>(response); 
        
    } catch (error) {
        console.error(`Erro ao remover hotel ${hotelId}:`, error);
        throw error;
    }
};

export const addRooms = async (
    hotelId: number | string,
    roomsData: RoomIn[]
): Promise<HotelDetailOut> => {
    try {
        const response = await fetch(
            getApiUrl(`/hotels/${hotelId}/rooms`),
            { ...getDefaultOptions('POST'), body: JSON.stringify(roomsData) }
        );
        
        return await handleResponse<HotelDetailOut>(response);
        
    } catch (error) {
        console.error(`Erro ao adicionar quartos ao hotel ${hotelId}:`, error);
        throw error;
    }
};

export const addMedia = async (
    hotelId: number | string,
    mediaData: MediaIn[]
): Promise<HotelDetailOut> => {
    try {
        const response = await fetch(
            getApiUrl(`/hotels/${hotelId}/media`),
            { ...getDefaultOptions('POST'), body: JSON.stringify(mediaData) }
        );
        
        return await handleResponse<HotelDetailOut>(response);
        
    } catch (error) {
        console.error(`Erro ao adicionar mídias ao hotel ${hotelId}:`, error);
        throw error;
    }
};

export const addAmenities = async (
    hotelId: number | string,
    amenityIds: number[]
): Promise<HotelDetailOut> => {
    try {
        const response = await fetch(
            getApiUrl(`/hotels/${hotelId}/amenities`),
            {
                ...getDefaultOptions('POST'),
                body: JSON.stringify(amenityIds)
            }
        );
        
        return await handleResponse<HotelDetailOut>(response);
        
    } catch (error) {
        console.error(`Erro ao adicionar amenities ao hotel ${hotelId}:`, error);
        throw error;
    }
};

export const createFullHotel = async (hotelData: HotelIn): Promise<HotelDetailOut> => {
    try {
        const response = await fetch(
            getApiUrl('/hotels/full'),
            {
                ...getDefaultOptions('POST'),
                body: JSON.stringify(hotelData),
            }
        );
        
        return await handleResponse<HotelDetailOut>(response);

    } catch (error) {
        console.error('Erro ao criar hotel completo:', error);
        throw error;
    }
};