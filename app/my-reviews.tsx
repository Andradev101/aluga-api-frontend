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
import { deleteReview, updateReview } from '@/services/reviews-api';
import { Review } from '@/types/reviews';
import React, { useState, useCallback } from 'react';
import { ScrollView } from 'react-native';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';


export default function MyReviewsScreen() {
  const params = useLocalSearchParams();
  const [loading, setLoading] = useState(false);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [currentUser, setCurrentUser] = useState('');
  const [editingReview, setEditingReview] = useState<number | null>(null);
  const [editRating, setEditRating] = useState(5);
  const [editComment, setEditComment] = useState('');
  
  const handleCommentChange = useCallback((text: string) => {
    setEditComment(text);
  }, []);
  const [editHotel, setEditHotel] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedHotel, setSelectedHotel] = useState('');
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');


  const handleDeleteReview = async (reviewId: number) => {
    setLoading(true);
    try {
      // Verifica se a review ainda existe
      const reviewExists = reviews.find(r => r.id === reviewId);
      if (!reviewExists) {
        console.log('Review já foi deletada');
        setEditingReview(null);
        await loadMyReviews();
        return;
      }
      
      await deleteReview(reviewId.toString());
      
      // Fecha o formulário após deletar
      setEditingReview(null);
      setEditRating(5);
      setEditComment('');
      setEditHotel('');
      
      await loadMyReviews();
    } catch (error: any) {
      console.error('Erro ao deletar review:', error);
      // Se deu erro 404, a review já não existe
      if (error.message.includes('404') || error.message.includes('not found')) {
        setEditingReview(null);
        await loadMyReviews();
      }
    }
    setLoading(false);
  };

  const loadMyReviews = async () => {
    if (loading) return;
    
    setLoading(true);
    try {
      // Busca dados em paralelo
      const [authResponse, meResponse] = await Promise.all([
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
      
      if (!authResponse.ok || !meResponse.ok) {
        console.error('Sessão expirada');
        router.push('/login');
        return;
      }
      
      const meData = await meResponse.json();
      const username = meData.userName || meData.username || meData.user_name || '';
      setCurrentUser(username);

      const { getAllReviews } = await import('@/services/reviews-api');
      const allReviewsData = await getAllReviews();
      
      // Filtra e ordena
      const myReviews = allReviewsData
        .filter((review: Review) => review.user?.user_name === username)
        .sort((a: any, b: any) => {
          const dateA = new Date(a.createdAt || a.created_at || a.id).getTime();
          const dateB = new Date(b.createdAt || b.created_at || b.id).getTime();
          return dateB - dateA;
        });
      
      setReviews(myReviews);
      
      // Verifica se precisa abrir formulário de edição após carregar
      if (params.edit && myReviews.length > 0) {
        const reviewToEdit = myReviews.find(r => r.id.toString() === params.edit);
        if (reviewToEdit) {
          setTimeout(() => {
            handleEditReview(reviewToEdit);
          }, 100);
        }
      }
    } catch (error: any) {
      console.error('Erro ao carregar avaliações:', error.message);
      setReviews([]);
      setCurrentUser('');
    }
    setLoading(false);
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
  }, []);

  React.useEffect(() => {
    if (hotels.length > 0) {
      loadMyReviews();
    }
  }, [hotels]);

  // Abre automaticamente o formulário se vier com parâmetro edit
  React.useEffect(() => {
    if (params.edit && reviews.length > 0) {
      const reviewToEdit = reviews.find(r => r.id.toString() === params.edit);
      if (reviewToEdit) {
        handleEditReview(reviewToEdit);
      }
    }
  }, [params.edit, reviews]);

  // Recarrega dados sempre que voltar para a tela
  useFocusEffect(
    React.useCallback(() => {
      if (hotels.length > 0 && !loading) {
        loadMyReviews();
      }
    }, [])
  );

  const handleEditReview = (review: Review) => {
    setEditingReview(review.id);
    setEditRating(review.rating);
    setEditComment(review.comment || '');
    setEditHotel(review.hotel_id.toString());
  };

  const handleUpdateReview = async (reviewId: number) => {
    if (!editComment.trim() || !editHotel) return;
    setLoading(true);
    try {
      // Verifica se ainda está autenticado
      const authCheck = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/credentials`, {
        method: 'GET',
        credentials: 'include' as RequestCredentials,
        headers: {'content-type': 'application/json'},
      });
      
      if (!authCheck.ok) {
        console.error('Sessão expirada');
        router.push('/login');
        return;
      }
      
      // Se o hotel mudou, deleta a review atual e cria uma nova
      const currentReview = reviews.find(r => r.id === reviewId);
      
      if (!currentReview) {
        console.error('Review não encontrada');
        await loadMyReviews(); // Recarrega para sincronizar
        setEditingReview(null);
        return;
      }
      
      if (currentReview.hotel_id.toString() !== editHotel) {
        // Hotel mudou - deleta e cria nova
        await deleteReview(reviewId.toString());
        
        const { createReview } = await import('@/services/reviews-api');
        await createReview(editHotel, {
          rating: editRating,
          comment: editComment
        });
      } else {
        // Mesmo hotel - só atualiza rating e comentário
        await updateReview(reviewId.toString(), {
          rating: editRating,
          comment: editComment
        });
      }
      
      setEditingReview(null);
      setEditRating(5);
      setEditComment('');
      setEditHotel('');
      await loadMyReviews();
    } catch (error: any) {
      console.error('Erro ao atualizar review:', error);
      if (error.message.includes('authentication') || error.message.includes('401')) {
        router.push('/login');
      } else {
        // Recarrega dados para sincronizar
        await loadMyReviews();
        setEditingReview(null);
      }
    }
    setLoading(false);
  };

  const cancelEdit = () => {
    setEditingReview(null);
    setEditRating(5);
    setEditComment('');
    setEditHotel('');
  };

  const handleCreateReview = async () => {
    if (!comment.trim() || !selectedHotel) return;
    setLoading(true);
    try {
      const { createReview } = await import('@/services/reviews-api');
      await createReview(selectedHotel, { rating, comment });
      
      setComment('');
      setSelectedHotel('');
      setRating(5);
      setShowCreateForm(false);
      
      // Recarrega para mostrar a nova review
      await loadMyReviews();
    } catch (error: any) {
      console.error('Erro ao criar review:', error);
    }
    setLoading(false);
  };

  const cancelCreate = () => {
    setComment('');
    setSelectedHotel('');
    setRating(5);
    setShowCreateForm(false);
  };





  return (
    <>
      {loading && <ButtonSpinner color="gray" />}
      <ScrollView className="flex-1 bg-gray-50">
        <VStack className="p-2 gap-2">
          {!loading &&
            <Card size="lg" variant="outline" className="m-1">
              <Heading size="4xl" className="mb-1 p-2">
                My Reviews
              </Heading>
              <Divider />
              <Text size="lg" className="p-2">You have {reviews.length} reviews:</Text>
              
              <VStack className="gap-2">
                <Button variant="solid" size="md" action="primary" onPress={() => setShowCreateForm(!showCreateForm)}>
                  <ButtonText>{showCreateForm ? 'Cancel' : 'Create New Review'}</ButtonText>
                </Button>
                
                {showCreateForm && (
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
                        <Button variant="outline" size="sm" onPress={cancelCreate}>
                          <ButtonText>Cancel</ButtonText>
                        </Button>
                      </VStack>
                    </VStack>
                  </Card>
                )}
                
                
                {editingReview && (
                  <Card size="md" variant="outline" className="m-1">
                    <VStack className="gap-2">
                      <Text size="md">Edit Review</Text>
                      
                      <Select selectedValue={editHotel} onValueChange={setEditHotel}>
                        <SelectTrigger>
                          <SelectInput 
                            placeholder="Select hotel..." 
                            value={hotels.find(h => h.id.toString() === editHotel)?.name || 'Select hotel...'}
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
                        rating={editRating}
                        size={24}
                        interactive={true}
                        onRatingChange={setEditRating}
                        showNumber={true}
                      />
                      
                      <Textarea>
                        <TextareaInput 
                          placeholder="Edit your review..."
                          value={editComment}
                          onChangeText={setEditComment}
                        />
                      </Textarea>
                      
                      <VStack className="gap-1">
                        <Button 
                          variant="solid" 
                          size="sm" 
                          action="primary" 
                          onPress={() => handleUpdateReview(editingReview)}
                          disabled={!editComment.trim() || !editHotel}
                        >
                          <ButtonText>Update</ButtonText>
                        </Button>
                        <Button 
                          variant="solid" 
                          size="sm" 
                          action="negative" 
                          onPress={() => handleDeleteReview(editingReview)}
                        >
                          <ButtonText>Delete</ButtonText>
                        </Button>
                        <Button variant="outline" size="sm" onPress={cancelEdit}>
                          <ButtonText>Cancel</ButtonText>
                        </Button>
                      </VStack>
                    </VStack>
                  </Card>
                )}
                
                {reviews.length === 0 ? (
                  <Text className="p-2 text-center">No reviews yet. Create your first review!</Text>
                ) : (
                  reviews.filter(review => review && review.id).map((review: Review) => {
                    const hotel = hotels.find(h => h.id === review.hotel_id);
                    const hotelName = hotel?.name || `Hotel ID ${review.hotel_id}`;
                    
                    return (
                      <Card key={review.id} size="md" variant="outline" className="m-1">
                        <VStack className="gap-2">
                          <Text size="md">Hotel: {hotelName}</Text>
                          <Text size="sm">Rating: {review.rating || 0}/5 ⭐</Text>
                          <Text size="sm">{review.comment || 'No comment'}</Text>
                          
                          <VStack className="gap-1">
                            <Button variant="outline" size="sm" action="primary" onPress={() => handleEditReview(review)}>
                              <ButtonText>Edit</ButtonText>
                            </Button>
                            <Button variant="solid" size="sm" action="negative" onPress={() => handleDeleteReview(review.id)}>
                              <ButtonText>Delete</ButtonText>
                            </Button>
                          </VStack>
                        </VStack>
                      </Card>
                    );
                  })
                )}
              </VStack>
            </Card>
          }
        </VStack>
      </ScrollView>
    </>
  );
}