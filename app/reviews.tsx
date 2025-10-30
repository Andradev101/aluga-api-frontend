import React, { useState } from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import StarRating from '@/components/star-rating';
import { createReview, getHotelReviews, updateReview, deleteReview } from '@/services/reviews-api';

export default function ReviewsScreen() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('');
  const [rating, setRating] = useState(5);

  const testCreateReview = async () => {
    setLoading(true);
    try {
      const review = await createReview('1', { rating, comment: 'Teste de avaliação' });
      setResult(`✅ Criar: ${JSON.stringify(review, null, 2)}`);
    } catch (error: any) {
      setResult(`❌ Criar: ${error.message}`);
    }
    setLoading(false);
  };

  const testGetReviews = async () => {
    setLoading(true);
    try {
      const reviews = await getHotelReviews('1');
      setResult(`✅ Listar: ${reviews.length} avaliações encontradas\n${JSON.stringify(reviews, null, 2)}`);
    } catch (error: any) {
      setResult(`❌ Listar: ${error.message}`);
    }
    setLoading(false);
  };

  const testUpdateReview = async () => {
    setLoading(true);
    try {
      const updated = await updateReview('1', { rating: 4, comment: 'Avaliação atualizada' });
      setResult(`✅ Atualizar: ${JSON.stringify(updated, null, 2)}`);
    } catch (error: any) {
      setResult(`❌ Atualizar: ${error.message}`);
    }
    setLoading(false);
  };

  const testDeleteReview = async () => {
    setLoading(true);
    try {
      await deleteReview('1');
      setResult(`✅ Deletar: Avaliação removida com sucesso`);
    } catch (error: any) {
      setResult(`❌ Deletar: ${error.message}`);
    }
    setLoading(false);
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title">Avaliações</ThemedText>
      
      <StarRating 
        rating={rating}
        size={30}
        interactive={true}
        onRatingChange={setRating}
        showNumber={false}
      />
      
      <TouchableOpacity style={styles.button} onPress={testGetReviews} disabled={loading}>
        <ThemedText style={styles.buttonText}>Buscar Avaliações</ThemedText>
      </TouchableOpacity>
      
      <TouchableOpacity style={styles.button} onPress={testCreateReview} disabled={loading}>
        <ThemedText style={styles.buttonText}>Criar Avaliação</ThemedText>
      </TouchableOpacity>
      
      <TouchableOpacity style={styles.button} onPress={testUpdateReview} disabled={loading}>
        <ThemedText style={styles.buttonText}>Atualizar Avaliação</ThemedText>
      </TouchableOpacity>
      
      <TouchableOpacity style={[styles.button, {backgroundColor: '#dc3545'}]} onPress={testDeleteReview} disabled={loading}>
        <ThemedText style={styles.buttonText}>Deletar Avaliação</ThemedText>
      </TouchableOpacity>

      {loading && <ThemedText>Carregando...</ThemedText>}
      {result && <ThemedText style={styles.result}>{result}</ThemedText>}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, gap: 15 },
  button: { backgroundColor: '#007AFF', padding: 15, borderRadius: 8 },
  buttonText: { color: '#fff', textAlign: 'center' },
  result: { fontSize: 12, marginTop: 20 },
  ratingText: { textAlign: 'center', marginBottom: 20 },
});