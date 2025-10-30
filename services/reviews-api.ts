import { CreateReviewRequest, Review, UpdateReviewRequest } from '@/types/reviews';

const API_BASE_URL = 'https://z7wdrv.mmar.dev';

const fetchWithCors = async (url: string, options: RequestInit = {}) => {
  const defaultOptions: RequestInit = {
    mode: 'cors',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };
  
  return await fetch(url, defaultOptions);
};

export const createReview = async (hotelId: string, reviewData: CreateReviewRequest): Promise<Review> => {
  const response = await fetchWithCors(`${API_BASE_URL}/reviews/hotels/${hotelId}/reviews`, {
    method: 'POST',
    body: JSON.stringify(reviewData),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Erro ${response.status}: ${errorText}`);
  }

  return response.json();
};

export const getHotelReviews = async (hotelId: string): Promise<Review[]> => {
  const response = await fetchWithCors(`${API_BASE_URL}/reviews/hotels/${hotelId}/reviews`);
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Erro ${response.status}: ${errorText}`);
  }

  return response.json();
};

export const updateReview = async (reviewId: string, reviewData: UpdateReviewRequest): Promise<Review> => {
  const response = await fetchWithCors(`${API_BASE_URL}/reviews/${reviewId}`, {
    method: 'PUT',
    body: JSON.stringify(reviewData),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Erro ${response.status}: ${errorText}`);
  }

  return response.json();
};

export const deleteReview = async (reviewId: string): Promise<void> => {
  const response = await fetchWithCors(`${API_BASE_URL}/reviews/${reviewId}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Erro ${response.status}: ${errorText}`);
  }
};