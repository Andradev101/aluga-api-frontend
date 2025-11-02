// types/pagination.ts

// ----------------------------------------------------------------------
//                        TIPOS DE PAGINAÇÃO (Page / PageMeta)
// ----------------------------------------------------------------------

/** Meta-dados da paginação (corresponde a PageMeta do backend). */
export interface PageMeta {
    page: number; // Página atual (base 1 ou base 0)
    size: number; // Quantidade de itens por página
    total: number; // Total de itens em todas as páginas
}

/** Estrutura de resposta paginada (corresponde a Page[T] do backend). */
export interface PageOut<T> {
    meta: PageMeta;
    items: T[]; // Lista de itens do tipo T
}