// types/hotels.ts

import { AmenityIn, AmenityOut } from "./amenities";


// ----------------------------------------------------------------------
//                   TIPOS DE MÍDIA (Estruturas Aninhadas)
// ----------------------------------------------------------------------

// Estrutura de Mídia para Saída (MediaOut no backend)
export interface MediaOut {
  id: number;
  url: string;
  kind: string;
}

// Estrutura de Mídia para Entrada (MediaIn no backend)
export interface MediaIn {
  url: string;
  kind?: string;
}


// ----------------------------------------------------------------------
//                   TIPOS DE QUARTO (Estruturas Aninhadas)
// ----------------------------------------------------------------------

// Estrutura de Quarto para Saída (RoomOut no backend)
export interface RoomOut {
  id: number;
  name: string;
  room_type: string;
  capacity: number;
  base_price: number;
  total_units: number;
  amenities: AmenityOut[]; // Usa a estrutura AmenityOut
}

// Estrutura de Quarto para Entrada (RoomIn no backend)
export interface RoomIn {
  name: string;
  room_type: string;
  capacity: number;
  base_price: number;
  total_units: number;
  amenities: AmenityIn[]; // Usa a estrutura AmenityIn ({ id: number }[])
}


// ----------------------------------------------------------------------
//                        ENTRADA (INPUT - Body da Requisição)
// ----------------------------------------------------------------------

/** * Corresponde ao DTO HotelIn (usado para criar ou atualizar um hotel).
 */
export interface HotelIn {
  name: string;
  description: string | null;
  city: string;
  neighborhood: string | null;
  address: string | null;
  latitude: number;
  longitude: number;
  policies: string | null;

  // Amenities gerais do hotel são enviadas como List[int] no backend
  amenities: number[];
  media: MediaIn[];
  rooms: RoomIn[];
}

/**
 * Tipo utilitário usado no 'createHotel'. Omite campos que são gerados no backend.
 * Baseado nos campos ausentes em HotelIn comparado a HotelDetailOut.
 */
export type CreateHotelPayloadIn = Omit<
  HotelDetailOut,
  'id' | 'stars' | 'popularity' | 'min_price_general' | 'min_price_available' | 'distance_km' | 'thumbnail'
>;


// ----------------------------------------------------------------------
//                        SAÍDA (OUTPUT - Responses do Servidor)
// ----------------------------------------------------------------------

/** * Corresponde ao DTO HotelCard (usado para listas, ex: getAllHotels).
 */
export interface HotelCardOut {
  id: number;
  name: string;
  city: string;
  neighborhood: string | null;
  stars: number;
  popularity: number;
  min_price_general: number | null;
  min_price_available: number | null;
  distance_km: number | null;
  thumbnail: string | null;
}

/** * Corresponde ao DTO HotelDetail (usado para detalhes, ex: getHotel, retorno de POST/PUT).
 */
export interface HotelDetailOut {
  // CAMPOS PRINCIPAIS
  id: number;
  name: string;
  description: string | null;
  city: string;
  neighborhood: string | null;
  address: string | null;
  latitude: number;
  longitude: number;
  policies: string | null;

  // CAMPOS GERADOS PELO SERVIDOR
  stars: number;
  popularity: number;
  min_price_general: number | null;
  min_price_available: number | null;
  distance_km: number | null;
  thumbnail: string | null;

  // RELACIONAMENTOS (LISTAS DE SAÍDA)
  amenities: AmenityOut[];
  media: MediaOut[];
  rooms: RoomOut[];
}

export { AmenityIn };

/**
 * ----------------------------------------------------------------------
 * FILTROS
 * ----------------------------------------------------------------------
 * * Corresponde ao DTO HotelFilter do backend (usado para query parameters).
 * Os campos opcionais devem ser 'string | number | undefined' no JS, 
 * mas são tipados aqui para refletir o tipo final esperado pelo backend.
 */
export interface HotelSearchParams {
    // Filtros básicos
    q?: string; // Busca textual pelo nome do hotel
    city?: string;
    neighborhood?: string;
    amenities?: number[]; // List[int] no backend (precisa ser serializado corretamente)
    room_type?: string;

    // Filtros de preço
    price_min?: number;
    price_max?: number;

    // Filtros de período
    // Usamos 'string' para o formato YYYY-MM-DD ou 'Date' se for passar o objeto Date
    // A função getHotel se encarregará de formatar o Date para string.
    check_in?: string | Date;
    check_out?: string | Date;

    // Ordenação
    sort?: 'id' | 'price' | 'rating' | 'popularity' | 'distance';

    // Filtros relacionados a distância
    user_lat?: string;
    user_lng?: string;

    // Filtros de estrelas
    stars_min?: number;
    stars_max?: number;

    // Paginação
    page?: number;
    size?: number;
}