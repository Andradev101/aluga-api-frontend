import { CreateReviewRequest, Review, UpdateReviewRequest } from '@/types/reviews';

const getApiUrl = (endpoint: string) => `${process.env.EXPO_PUBLIC_API_URL}${endpoint}`;

const getDefaultOptions = (method: string = 'GET', body?: any): RequestInit => ({
  method,
  credentials: 'include' as RequestCredentials,
  headers: { 'content-type': 'application/json' },
  ...(body && { body: JSON.stringify(body) })
});

export const createReview = async (hotelId: string, reviewData: CreateReviewRequest): Promise<Review> => {
  try {
    const response = await fetch(
      getApiUrl(`/reviews/hotels/${hotelId}/reviews`),
      getDefaultOptions('POST', reviewData)
    );
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.detail || 'Erro ao criar review');
    }
    
    return data;
  } catch (error) {
    console.error('Erro ao criar review:', error);
    throw error;
  }
};

export const getHotelReviews = async (hotelId: string): Promise<Review[]> => {
  try {
    const response = await fetch(
      getApiUrl(`/reviews/hotels/${hotelId}/reviews`),
      getDefaultOptions('GET')
    );
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.detail || 'Erro ao buscar reviews');
    }
    
    return data;
  } catch (error) {
    console.error('Erro ao buscar reviews:', error);
    throw error;
  }
};

export const updateReview = async (reviewId: string, reviewData: UpdateReviewRequest): Promise<Review> => {
  try {
    const response = await fetch(
      getApiUrl(`/reviews/${reviewId}`),
      getDefaultOptions('PUT', reviewData)
    );
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.detail || 'Erro ao atualizar review');
    }
    
    return data;
  } catch (error) {
    console.error('Erro ao atualizar review:', error);
    throw error;
  }
};

export const deleteReview = async (reviewId: string): Promise<void> => {
  try {
    const response = await fetch(
      getApiUrl(`/reviews/${reviewId}`),
      getDefaultOptions('DELETE')
    );
    
    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.detail || 'Erro ao deletar review');
    }
  } catch (error) {
    console.error('Erro ao deletar review:', error);
    throw error;
  }
};

export const getAllReviews = async (): Promise<Review[]> => {
  try {
    const response = await fetch(
      getApiUrl('/reviews'),
      getDefaultOptions('GET')
    );
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.detail || 'Erro ao buscar todas as reviews');
    }
    
    return data;
  } catch (error) {
    console.error('Erro ao buscar todas as reviews:', error);
    throw error;
  }
};