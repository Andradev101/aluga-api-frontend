// types/amenities.ts

// ----------------------------------------------------------------------
//                 TIPOS DE AMENIDADE (COMODIDADES)
// ----------------------------------------------------------------------

/** * Corresponde ao DTO AmenityOut do backend.
 * Usado nos responses detalhados do hotel e nas listagens de amenities.
 */
export interface AmenityOut {
    id: number;
    code: string;
    label: string;
}

/** * Corresponde ao DTO AmenityIn do backend.
 * Usado para associar uma comodidade a um quarto ou hotel (apenas o ID).
 */
export interface AmenityIn {
    id: number; // Apenas o ID é enviado para o servidor associar
}