import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { ThemedText } from './themed-text';
import { StarRatingProps } from '@/types/reviews';

export default function StarRating({ 
  rating, 
  size = 16, 
  showNumber = true, 
  maxStars = 5,
  interactive = false,
  onRatingChange
}: StarRatingProps) {
  const renderStars = () => {
    const stars = [];
    
    for (let i = 1; i <= maxStars; i++) {
      const isFilled = i <= rating;
      const StarComponent = interactive ? TouchableOpacity : View;
      
      stars.push(
        <StarComponent 
          key={i}
          style={interactive ? styles.interactiveStar : undefined}
          onPress={interactive ? () => onRatingChange?.(i) : undefined}
        >
          <ThemedText style={[styles.star, { fontSize: size, color: isFilled ? '#ffc107' : '#e9ecef' }]}>
            {isFilled ? '★' : '☆'}
          </ThemedText>
        </StarComponent>
      );
    }

    return stars;
  };

  return (
    <View style={styles.container}>
      <View style={styles.starsContainer}>
        {renderStars()}
      </View>
      {showNumber && (
        <ThemedText style={[styles.ratingText, { fontSize: size * 0.8 }]}>
          {rating.toFixed(1)}
        </ThemedText>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  starsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  star: {
    marginRight: 2,
  },
  interactiveStar: {
    padding: 2,
  },
  ratingText: {
    marginLeft: 8,
    color: '#6c757d',
    fontWeight: '500',
  },
});