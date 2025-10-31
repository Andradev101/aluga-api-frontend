import StarRating from '@/components/star-rating';
import { Badge } from '@/components/ui/badge';
import { Button, ButtonText } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Heading } from '@/components/ui/heading';
import { HStack } from '@/components/ui/hstack';
import { ChevronDownIcon } from '@/components/ui/icon';
import { Select, SelectBackdrop, SelectContent, SelectDragIndicator, SelectDragIndicatorWrapper, SelectIcon, SelectInput, SelectItem, SelectPortal, SelectTrigger } from '@/components/ui/select';
import { Spinner } from '@/components/ui/spinner';
import { Text } from '@/components/ui/text';
import { Textarea, TextareaInput } from '@/components/ui/textarea';
import { VStack } from '@/components/ui/vstack';
import { getAllHotels, Hotel } from '@/services/hotels-api';
import { createReview, deleteReview, getHotelReviews, updateReview } from '@/services/reviews-api';
import React, { useRef, useState } from 'react';
import { ScrollView } from 'react-native';



export default function ReviewsScreen() {
  const [loading, setLoading] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [allReviews, setAllReviews] = useState([]);
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [selectedHotel, setSelectedHotel] = useState('');
  const [filterHotel, setFilterHotel] = useState('all');
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [editingReview, setEditingReview] = useState<any>(null);

  const [showForm, setShowForm] = useState(false);
  const scrollRef = useRef<ScrollView>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState('');
  const [currentUser, setCurrentUser] = useState('');

  const handleCreateReview = async () => {
    if (!comment.trim() || !selectedHotel) return;
    setLoading(true);
    try {
      if (editingReview) {
        await updateReview(editingReview.id, { rating, comment });
        setEditingReview(null);
      } else {
        await createReview(selectedHotel, { rating, comment });
      }
      setComment('');
      setSelectedHotel('');
      setRating(5);
      setShowForm(false);
      await loadAllReviews();
    } catch (error: any) {
      // Silently handle error
    }
    setLoading(false);
  };

  const handleEditReview = (review: any) => {
    setEditingReview(review);
    setSelectedHotel(review.hotel_id.toString());
    setRating(review.rating);
    setComment(review.comment);
    setShowForm(true);
    setTimeout(() => {
      scrollRef.current?.scrollTo({ y: 0, animated: true });
    }, 100);
  };

  const handleDeleteReview = async (reviewId: string) => {
    setLoading(true);
    try {
      await deleteReview(reviewId);
      await loadAllReviews();
    } catch (error: any) {
      // Silently handle error
    }
    setLoading(false);
  };

  const cancelEdit = () => {
    setEditingReview(null);
    setComment('');
    setSelectedHotel('');
    setRating(5);
    setShowForm(false);
  };

  const loadAllReviews = async () => {
    setLoading(true);
    try {
      // Carrega avaliações de todos os hotéis
      const allReviewsData = [];
      for (const hotel of hotels) {
        try {
          const hotelReviews = await getHotelReviews(hotel.id.toString());
          allReviewsData.push(...hotelReviews);
        } catch (error) {
          // Silently handle error
        }
      }
      // Ordena por data de criação (mais recente primeiro)
      const sortedReviews = allReviewsData.sort((a, b) => {
        const dateA = new Date(a.created_at || a.id).getTime();
        const dateB = new Date(b.created_at || b.id).getTime();
        return dateB - dateA;
      });
      setAllReviews(sortedReviews);
      filterReviews(sortedReviews, filterHotel);
    } catch (error: any) {
      // Silently handle error
    }
    setLoading(false);
  };

  const filterReviews = (reviewsData: any[], hotelFilter: string) => {
    let filtered;
    if (hotelFilter === 'all') {
      filtered = reviewsData;
    } else {
      filtered = reviewsData.filter(review => 
        review && review.hotel_id && review.hotel_id.toString() === hotelFilter
      );
    }
    // Ordena por data (mais recente primeiro)
    const sorted = filtered.sort((a, b) => {
      const dateA = new Date(a.created_at || a.id).getTime();
      const dateB = new Date(b.created_at || b.id).getTime();
      return dateB - dateA;
    });
    setReviews(sorted);
  };

  const handleFilterChange = (value: string) => {
    setFilterHotel(value);
    filterReviews(allReviews, value);
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
    
    const checkAuthStatus = async () => {
      try {
        const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/credentials`, {
          method: 'GET',
          credentials: 'include' as RequestCredentials,
          headers: {'content-type': 'application/json'},
        });
        if (response.ok) {
          const data = await response.json();

          setIsLoggedIn(true);
          setUserRole(data.token_content?.role || '');
          // Buscar username do usuário atual
          try {
            const meResponse = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/users/me`, {
              method: 'GET',
              credentials: 'include' as RequestCredentials,
              headers: {'content-type': 'application/json'},
            });
            if (meResponse.ok) {
              const meData = await meResponse.json();

              setCurrentUser(meData.userName || meData.username || meData.user_name || '');
            }
          } catch (error) {
            // Silently handle error
          }
        } else {
          setIsLoggedIn(false);
        }
      } catch (error) {
        setIsLoggedIn(false);
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

  const ReviewCard = ({ review }: { review: any }) => {
    const hotel = hotels.find(h => h.id === review.hotel_id);
    const hotelName = hotel?.name || `Hotel ID ${review.hotel_id}`;
    const isOwner = review.user?.user_name === currentUser;
    const isAdmin = userRole === 'sysAdmin' || userRole === 'admin';
    const canEdit = isOwner;
    const canDelete = isOwner || isAdmin;
    

    
    return (
      <Card className="p-4 bg-white border border-gray-200 rounded-xl shadow-sm">
        <VStack className="gap-3">
          <VStack className="gap-1">
            <HStack className="items-center justify-between">
              <Text className="font-semibold text-gray-800">@{review.user?.user_name || 'Usuário'}</Text>
              <Badge className="bg-aluga-100">
                <Text className="text-aluga-700 font-bold">{review.rating || 0}/5</Text>
              </Badge>
            </HStack>
            <HStack className="items-center gap-2">
              <Text className="text-sm text-aluga-600 font-medium">🏨 {hotelName}</Text>
            </HStack>
          </VStack>
          
          <HStack className="items-center gap-2">
            <StarRating 
              rating={review.rating || 0}
              size={20}
              interactive={false}
              showNumber={false}
            />
          </HStack>
          
          <Text className="text-gray-600 leading-relaxed">{review.comment || ''}</Text>
          
          {(canEdit || canDelete) && (
            <HStack className="gap-2 pt-2">
              {canEdit && (
                <Button 
                  size="sm"
                  className="bg-blue-500 hover:bg-blue-600 flex-1" 
                  onPress={() => handleEditReview(review)}
                >
                  <ButtonText className="text-white text-sm">✏️ Editar</ButtonText>
                </Button>
              )}
              {canDelete && (
                <Button 
                  size="sm"
                  className="bg-red-500 hover:bg-red-600 flex-1" 
                  onPress={() => handleDeleteReview(review.id)}
                >
                  <ButtonText className="text-white text-sm">🗑️ Excluir</ButtonText>
                </Button>
              )}
            </HStack>
          )}

        </VStack>
      </Card>
    );
  };

  return (
    <ScrollView ref={scrollRef} className="flex-1 bg-gray-50">
      <VStack className="p-6 gap-6">
        {/* Header */}
        <VStack className="items-center gap-2">
          <Heading className="text-3xl font-bold text-aluga-500">🌴 Aluga Aí</Heading>
        </VStack>

        {/* Botão para mostrar formulário - apenas se logado */}
        {!showForm && isLoggedIn && (
          <Button 
            className="bg-aluga-500 hover:bg-aluga-600" 
            onPress={() => setShowForm(true)}
          >
            <ButtonText className="text-white font-semibold">➕ Criar Avaliação</ButtonText>
          </Button>
        )}

        {/* Formulário de Nova Avaliação */}
        {showForm && (
          <Card className="p-6 bg-white shadow-lg border border-aluga-100 rounded-xl">
            <VStack className="gap-4">
              <HStack className="items-center justify-between">
                <Heading size="md" className="text-aluga-600">
                  {editingReview ? 'Editar Avaliação' : 'Escrever Avaliação'}
                </Heading>
                <Button size="sm" variant="outline" onPress={cancelEdit}>
                  <ButtonText className="text-gray-600">❌ Cancelar</ButtonText>
                </Button>
              </HStack>
            
            <VStack className="gap-2">
              <Text className="text-sm font-medium text-gray-700">Selecione o Hotel</Text>
              <Select value={selectedHotel} onValueChange={setSelectedHotel}>
                <SelectTrigger className="w-full">
                  <SelectInput placeholder="Escolha um hotel..." />
                  <SelectIcon className="mr-3" as={ChevronDownIcon} />
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
            </VStack>
            
            <HStack className="items-center justify-center gap-3">
              <StarRating 
                rating={rating}
                size={32}
                interactive={true}
                onRatingChange={setRating}
                showNumber={false}
              />
              <Badge className="bg-aluga-100 px-3 py-1 rounded-full">
                <Text className="text-aluga-700 font-bold">{rating}/5</Text>
              </Badge>
            </HStack>
            
            <Textarea className="min-h-20">
              <TextareaInput 
                placeholder="Compartilhe sua experiência..."
                value={comment}
                onChangeText={setComment}
              />
            </Textarea>
            
            <Button 
              className="bg-aluga-500 hover:bg-aluga-600 rounded-xl" 
              onPress={handleCreateReview}
              disabled={loading || !comment.trim() || !selectedHotel}
            >
                <ButtonText className="text-white font-semibold">
                {editingReview ? '✅ Salvar Alterações' : '✨ Publicar Avaliação'}
              </ButtonText>
            </Button>
          </VStack>
        </Card>
        )}

        {/* Filtro de Avaliações */}
        <Card className="p-4 bg-white border border-gray-200 rounded-xl">
          <VStack className="gap-3">
            <Text className="font-medium text-gray-700">Filtrar Avaliações</Text>
            <Select value={filterHotel} onValueChange={handleFilterChange}>
              <SelectTrigger className="w-full">
                <SelectInput placeholder="Filtrar por hotel..." />
                <SelectIcon className="mr-3" as={ChevronDownIcon} />
              </SelectTrigger>
              <SelectPortal>
                <SelectBackdrop />
                <SelectContent>
                  <SelectDragIndicatorWrapper>
                    <SelectDragIndicator />
                  </SelectDragIndicatorWrapper>
                  <SelectItem label="Todas as avaliações" value="all" />
                  {hotels.map((hotel) => (
                    <SelectItem key={hotel.id} label={hotel.name} value={hotel.id.toString()} />
                  ))}
                </SelectContent>
              </SelectPortal>
            </Select>
          </VStack>
        </Card>

        {/* Lista de Avaliações */}
        <VStack className="gap-4">
          <HStack className="items-center justify-between">
            <Heading size="md" className="text-gray-800">
              {filterHotel === 'all' ? 'Todas as Avaliações' : `Avaliações - ${hotels.find(h => h.id.toString() === filterHotel)?.name || 'Hotel'}`}
            </Heading>
            <Badge className="bg-gray-100">
              <Text className="text-gray-700 font-semibold">{reviews.length} avaliações</Text>
            </Badge>
          </HStack>
          
          {reviews.length === 0 && !loading && (
            <Card className="p-6 bg-gray-50 border border-gray-200 rounded-xl">
              <Text className="text-gray-500 text-center">Nenhuma avaliação encontrada</Text>
            </Card>
          )}
          
          {reviews.filter(review => review && review.id).map((review: any) => (
            <ReviewCard key={review.id} review={review} />
          ))}
        </VStack>

        {/* Loading */}
        {loading && (
          <Card className="p-4 bg-aluga-50 border border-aluga-200 rounded-xl">
            <HStack className="items-center justify-center gap-3">
              <Spinner className="text-aluga-500" />
              <Text className="text-aluga-700 font-semibold">Carregando...</Text>
            </HStack>
          </Card>
        )}
      </VStack>
    </ScrollView>
  );
}

