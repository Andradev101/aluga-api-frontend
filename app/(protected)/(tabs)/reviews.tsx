import StarRating from '@/components/star-rating';
import { Button, ButtonSpinner, ButtonText } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Divider } from '@/components/ui/divider';
import { Heading } from '@/components/ui/heading';
import { ChevronDownIcon } from '@/components/ui/icon';

import { Select, SelectBackdrop, SelectContent, SelectDragIndicator, SelectDragIndicatorWrapper, SelectIcon, SelectInput, SelectItem, SelectPortal, SelectTrigger } from '@/components/ui/select';
import { Text } from '@/components/ui/text';
import { Textarea, TextareaInput } from '@/components/ui/textarea';
import { VStack } from '@/components/ui/vstack';
import { getAllHotels, Hotel } from '@/services/hotels-api';
import { createReview, deleteReview, updateReview } from '@/services/reviews-api';
import { Review } from '@/types/reviews';
import { useAuth } from '@/hooks/useAuth';
import React, { useState, useRef } from 'react';
import { router, useLocalSearchParams, useFocusEffect } from 'expo-router';
import { ScrollView } from 'react-native';




export default function ReviewsScreen() {
  const params = useLocalSearchParams();
  const [loading, setLoading] = useState(false);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [allReviews, setAllReviews] = useState<Review[]>([]);
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [selectedHotel, setSelectedHotel] = useState('');
  const [filterHotel, setFilterHotel] = useState('all');
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [editingReview, setEditingReview] = useState<Review | null>(null);

  const [showForm, setShowForm] = useState(params.create === 'true');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState('');
  const [currentUser, setCurrentUser] = useState('');
  const scrollRef = useRef<ScrollView>(null);

  const handleCreateReview = async () => {
    if (!comment.trim() || !selectedHotel) return;
    setLoading(true);
    try {
      // Só cria novas reviews nesta página
      if (false) {
        // Código de edição removido
      } else {
        await createReview(selectedHotel, { rating, comment });
        // Redireciona para my-reviews após criar
        router.push('/my-reviews');
        return;
      }
      setComment('');
      setSelectedHotel('');
      setRating(5);
      setShowForm(false);
      await loadAllReviews();
    } catch (error: any) {
      console.error('Erro ao criar/atualizar review:', error);
    }
    setLoading(false);
  };

  const handleEditReview = (review: Review) => {
    // Redireciona para my-reviews com o ID da review para editar
    router.push(`/my-reviews?edit=${review.id}`);
  };

  const handleDeleteReview = async (reviewId: number) => {
    setLoading(true);
    try {
      await deleteReview(reviewId.toString());
      await loadAllReviews();
    } catch (error: any) {
      console.error('Erro ao deletar review:', error);
    }
    setLoading(false);
  };

  const cancelEdit = () => {
    setComment('');
    setSelectedHotel('');
    setRating(5);
    setShowForm(false);
  };

  const loadAllReviews = async () => {
    if (loading) return;
    
    setLoading(true);
    try {
      const { getAllReviews } = await import('@/services/reviews-api');
      const allReviewsData = await getAllReviews();
      
      const sortedReviews = allReviewsData.sort((a: any, b: any) => {
        const dateA = new Date(a.createdAt || a.created_at || a.id).getTime();
        const dateB = new Date(b.createdAt || b.created_at || b.id).getTime();
        return dateB - dateA;
      });
      setAllReviews(sortedReviews);
      filterReviews(sortedReviews, filterHotel);
    } catch (error: any) {
      console.error('Erro ao carregar reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterReviews = (reviewsData: Review[], hotelFilter: string) => {
    let filtered;
    if (hotelFilter === 'all') {
      filtered = reviewsData;
    } else if (hotelFilter === 'my-reviews') {
      filtered = reviewsData.filter(review => 
        review && review.user?.user_name === currentUser
      );
    } else {
      filtered = reviewsData.filter(review => 
        review && review.hotel_id && review.hotel_id.toString() === hotelFilter
      );
    }
    // Ordena por data (mais recente primeiro)
    const sorted = filtered.sort((a: any, b: any) => {
      const dateA = new Date(a.createdAt || a.created_at || a.id).getTime();
      const dateB = new Date(b.createdAt || b.created_at || b.id).getTime();
      return dateB - dateA;
    });
    setReviews(sorted);
  };

  const handleFilterChange = (value: string) => {
    setFilterHotel(value);
    filterReviews(allReviews, value);
  };





  const checkAuthStatus = async () => {
    try {
      const [credResponse, meResponse] = await Promise.all([
        fetch(`${process.env.EXPO_PUBLIC_API_URL}/credentials`, {
          method: 'GET',
          credentials: 'include' as RequestCredentials,
          headers: {'content-type': 'application/json'},
        }),
        fetch(`${process.env.EXPO_PUBLIC_API_URL}/users/me`, {
          method: 'GET',
          credentials: 'include' as RequestCredentials,
          headers: {'content-type': 'application/json'},
        })
      ]);
      
      if (credResponse.ok && meResponse.ok) {
        const [credData, meData] = await Promise.all([
          credResponse.json(),
          meResponse.json()
        ]);
        
        setIsLoggedIn(true);
        setUserRole(credData.token_content?.role || '');
        setCurrentUser(meData.userName || meData.username || meData.user_name || '');
      } else {
        setIsLoggedIn(false);
        setCurrentUser('');
      }
    } catch (error) {
      console.error('Erro na verificação de autenticação:', error);
      setIsLoggedIn(false);
      setCurrentUser('');
    }
  };

  React.useEffect(() => {
    const loadInitialData = async () => {
      try {
        const hotelsData = await getAllHotels();
        setHotels(hotelsData);
      } catch (error) {
        setHotels([]);
      }
    };
    
    loadInitialData();
    checkAuthStatus();
  }, []);

  React.useEffect(() => {
    if (hotels.length > 0) {
      loadAllReviews();
    }
  }, [hotels]);



  React.useEffect(() => {
    if (params.create === 'true') {
      setShowForm(true);
    }
  }, [params.create]);

  // Recarrega dados sempre que voltar para a tela
  useFocusEffect(
    React.useCallback(() => {
      loadAllReviews();
    }, [])
  );



  const ReviewCard = ({ review }: { review: Review }) => {
    const hotel = hotels.find(h => h.id === review.hotel_id);
    const hotelName = hotel?.name || `Hotel ID ${review.hotel_id}`;
    const isOwner = review.user?.user_name === currentUser && currentUser !== '';
    const isAdmin = userRole === 'sysAdmin' || userRole === 'admin';
    const canEdit = isOwner && isLoggedIn;
    const canDelete = isAdmin && isLoggedIn;
    
    return (
      <Card size="md" variant="outline" className="m-1">
        <VStack className="gap-2">
          <Text size="md">@{review.user?.user_name || 'User'}</Text>
          <Text size="sm">Hotel: {hotelName}</Text>
          <Text size="sm">Rating: {review.rating || 0}/5 ⭐</Text>
          <Text size="sm">{review.comment || 'No comment'}</Text>
          
          {canEdit && (
            <VStack className="gap-1">
              <Button variant="outline" size="sm" action="primary" onPress={() => handleEditReview(review)}>
                <ButtonText>Edit</ButtonText>
              </Button>
            </VStack>
          )}
          
          {canDelete && (
            <VStack className="gap-1">
              <Button variant="outline" size="sm" action="negative" onPress={() => handleDeleteReview(review.id)}>
                <ButtonText>Delete</ButtonText>
              </Button>
            </VStack>
          )}
        </VStack>
      </Card>
    );
  };

  return (
    <>
      {loading && <ButtonSpinner color="gray" />}
      <ScrollView ref={scrollRef} className="flex-1 bg-gray-50">
        <VStack className="p-2 gap-2">
          {!loading &&
            <Card size="lg" variant="outline" className="m-1">
              <Heading size="4xl" className="mb-1 p-2">
                Hotel Reviews
              </Heading>
              <Divider />
              
              <VStack className="gap-2">
                {isLoggedIn && (
                  <Button variant="solid" size="md" action="primary" onPress={() => setShowForm(!showForm)}>
                    <ButtonText>{showForm ? 'Cancel' : 'Create Review'}</ButtonText>
                  </Button>
                )}
                
                {showForm && (
                  <Card size="md" variant="outline" className="m-1">
                    <VStack className="gap-2">
                      <Text size="md">New Review</Text>
                      
                      <Select selectedValue={selectedHotel} onValueChange={setSelectedHotel}>
                        <SelectTrigger>
                          <SelectInput 
                            placeholder="Select hotel..." 
                            value={hotels.find(h => h.id.toString() === selectedHotel)?.name || 'Select hotel...'}
                          />
                          <SelectIcon as={ChevronDownIcon} />
                        </SelectTrigger>
                        <SelectPortal>
                          <SelectBackdrop />
                          <SelectContent>
                            <SelectDragIndicatorWrapper>
                              <SelectDragIndicator />
                            </SelectDragIndicatorWrapper>
                            {hotels.map((hotel) => (
                              <SelectItem key={hotel.id} label={hotel.name} value={hotel.id.toString()} />
                            ))}
                          </SelectContent>
                        </SelectPortal>
                      </Select>
                      
                      <StarRating 
                        rating={rating}
                        size={24}
                        interactive={true}
                        onRatingChange={setRating}
                        showNumber={true}
                      />
                      
                      <Textarea>
                        <TextareaInput 
                          placeholder="Write your review..."
                          value={comment}
                          onChangeText={setComment}
                        />
                      </Textarea>
                      
                      <VStack className="gap-1">
                        <Button 
                          variant="solid" 
                          size="sm" 
                          action="primary" 
                          onPress={handleCreateReview}
                          disabled={!comment.trim() || !selectedHotel}
                        >
                          <ButtonText>Submit</ButtonText>
                        </Button>
                        <Button variant="outline" size="sm" onPress={cancelEdit}>
                          <ButtonText>Cancel</ButtonText>
                        </Button>
                      </VStack>
                    </VStack>
                  </Card>
                )}
                
                <Card size="md" variant="outline" className="m-1">
                  <VStack className="gap-2">
                    <Text size="md">Filter Reviews</Text>
                    <Select selectedValue={filterHotel} onValueChange={handleFilterChange}>
                      <SelectTrigger>
                        <SelectInput placeholder="All hotels" />
                        <SelectIcon as={ChevronDownIcon} />
                      </SelectTrigger>
                      <SelectPortal>
                        <SelectBackdrop />
                        <SelectContent>
                          <SelectDragIndicatorWrapper>
                            <SelectDragIndicator />
                          </SelectDragIndicatorWrapper>
                          <SelectItem label="All reviews" value="all" />
                          {currentUser && <SelectItem label="My reviews" value="my-reviews" />}
                          {hotels.map((hotel) => (
                            <SelectItem key={hotel.id} label={hotel.name} value={hotel.id.toString()} />
                          ))}
                        </SelectContent>
                      </SelectPortal>
                    </Select>
                  </VStack>
                </Card>
                
                <Text size="lg" className="p-2">Reviews ({reviews.length}):</Text>
                
                {reviews.length === 0 ? (
                  <Text className="p-2 text-center">No reviews found</Text>
                ) : (
                  reviews.filter(review => review && review.id).map((review: Review) => (
                    <ReviewCard key={review.id} review={review} />
                  ))
                )}
              </VStack>
            </Card>
          }
        </VStack>
      </ScrollView>
    </>
  );
}

