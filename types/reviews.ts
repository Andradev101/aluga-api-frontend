export interface Review {
  id: number;
  rating: number;
  comment: string | null;
  hotel_id: number;
  user: {
    user_name: string;
  };
  createdAt?: string;
}

export interface CreateReviewRequest {
  rating: number;
  comment: string;
}

export interface UpdateReviewRequest {
  rating?: number;
  comment?: string;
}

export interface Hotel {
  id: string;
  name: string;
  location: string;
  price: number;
  averageRating?: number;
  totalReviews?: number;
}

export interface StarRatingProps {
  rating: number;
  size?: number;
  showNumber?: boolean;
  maxStars?: number;
  interactive?: boolean;
  onRatingChange?: (rating: number) => void;
}