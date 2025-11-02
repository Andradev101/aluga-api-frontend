// services/amenities-api.ts

import { AmenityOut } from "@/types/amenities";

// Supondo que AmenityOut seja exportada de um arquivo de tipos


// Funções utilitárias (reutilizadas do hotels-api.ts)
const getApiUrl = (endpoint: string) => `${process.env.EXPO_PUBLIC_API_URL}${endpoint}`;

const getDefaultOptions = (method: string = 'GET'): RequestInit => ({
    method,
    credentials: 'include' as RequestCredentials,
    headers: { 'content-type': 'application/json' }
});

// ----------------------------------------------------------------------
//                        CREATE (POST /amenities/)
// ----------------------------------------------------------------------

/**
 * Cria uma nova comodidade (POST /amenities/).
 * Nota: Os parâmetros 'code' e 'label' são passados no corpo da requisição.
 * @param code O código único da comodidade (ex: 'WIFI').
 * @param label O nome da comodidade (ex: 'Wi-Fi Gratuito').
 * @returns O AmenityOut criado.
 */
export const createAmenity = async (code: string, label: string): Promise<AmenityOut> => {
    try {
        const response = await fetch(
            getApiUrl('/amenities/'),
            {
                ...getDefaultOptions('POST'),
                body: JSON.stringify({ code, label }), // Parâmetros no corpo
            }
        );
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.detail || 'Erro ao criar a comodidade.');
        }
        return data;
    } catch (error) {
        console.error('Erro ao criar comodidade:', error);
        throw error;
    }
};

// ----------------------------------------------------------------------
//                        READ LIST (GET /amenities/)
// ----------------------------------------------------------------------

/**
 * Lista comodidades com paginação básica (GET /amenities/).
 * @param skip O número de itens a pular.
 * @param limit O número máximo de itens a retornar.
 * @returns Uma lista de AmenityOut.
 */
export const listAmenities = async (skip: number = 0, limit: number = 100): Promise<AmenityOut[]> => {
    try {
        const query = `?skip=${skip}&limit=${limit}`;
        const response = await fetch(
            getApiUrl(`/amenities/${query}`),
            getDefaultOptions('GET')
        );
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.detail || 'Erro ao listar comodidades.');
        }
        return data;
    } catch (error) {
        console.error('Erro ao listar comodidades:', error);
        throw error;
    }
};

// ----------------------------------------------------------------------
//                        READ DETAIL (GET /amenities/{id})
// ----------------------------------------------------------------------

/**
 * Busca uma comodidade pelo ID (GET /amenities/{amenity_id}).
 * @param amenityId O ID da comodidade.
 * @returns O AmenityOut encontrado.
 */
export const readAmenity = async (amenityId: number): Promise<AmenityOut> => {
    try {
        const response = await fetch(
            getApiUrl(`/amenities/${amenityId}`),
            getDefaultOptions('GET')
        );
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.detail || 'Comodidade não encontrada.');
        }
        return data;
    } catch (error) {
        console.error(`Erro ao buscar comodidade ${amenityId}:`, error);
        throw error;
    }
};

// ----------------------------------------------------------------------
//                        UPDATE (PUT /amenities/{id})
// ----------------------------------------------------------------------

/**
 * Atualiza uma comodidade (PUT /amenities/{amenity_id}).
 * @param amenityId O ID da comodidade a ser atualizada.
 * @param code Novo código (opcional).
 * @param label Nova label (opcional).
 * @returns O AmenityOut atualizado.
 */
export const updateAmenity = async (
    amenityId: number,
    code?: string,
    label?: string
): Promise<AmenityOut> => {
    // Cria o payload apenas com os campos fornecidos
    const payload: { code?: string, label?: string } = {};
    if (code !== undefined) payload.code = code;
    if (label !== undefined) payload.label = label;

    // Verifica se há algo para enviar (evita PUT com corpo vazio)
    if (Object.keys(payload).length === 0) {
        throw new Error("Pelo menos 'code' ou 'label' deve ser fornecido para a atualização.");
    }

    try {
        const response = await fetch(
            getApiUrl(`/amenities/${amenityId}`),
            {
                ...getDefaultOptions('PUT'),
                body: JSON.stringify(payload),
            }
        );
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.detail || 'Erro ao atualizar comodidade.');
        }
        return data;
    } catch (error) {
        console.error(`Erro ao atualizar comodidade ${amenityId}:`, error);
        throw error;
    }
};

// ----------------------------------------------------------------------
//                        DELETE (DELETE /amenities/{id})
// ----------------------------------------------------------------------

/**
 * Remove uma comodidade (DELETE /amenities/{amenity_id}).
 * @param amenityId O ID da comodidade a ser removida.
 * @returns O AmenityOut removido (útil para confirmação).
 */
export const deleteAmenity = async (amenityId: number): Promise<AmenityOut> => {
    try {
        const response = await fetch(
            getApiUrl(`/amenities/${amenityId}`),
            getDefaultOptions('DELETE')
        );
        // O backend retorna o objeto deletado, então lemos o corpo
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.detail || 'Erro ao deletar comodidade.');
        }
        return data;
    } catch (error) {
        console.error(`Erro ao deletar comodidade ${amenityId}:`, error);
        throw error;
    }
};