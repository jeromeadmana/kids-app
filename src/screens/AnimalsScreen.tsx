import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  StatusBar,
  Pressable,
  Text,
  ScrollView,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSequence,
  withTiming,
  withSpring,
  withRepeat,
  FadeInDown,
  Easing,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../utils/colors';
import { HapticFeedback } from '../utils/haptics';
import { SoundManager } from '../utils/SoundManager';
import { useApp } from '../context/AppContext';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');

interface Animal {
  id: string;
  emoji: string;
  color: string;
  sound: string;
  stickerId: string;
}

const ANIMALS: Animal[] = [
  { id: 'cat', emoji: '🐱', color: '#FF6348', sound: 'Meow!', stickerId: 'cat-1' },
  { id: 'dog', emoji: '🐶', color: '#FFC312', sound: 'Woof!', stickerId: 'dog-1' },
  { id: 'cow', emoji: '🐄', color: '#2ED573', sound: 'Mooo!', stickerId: 'cat-1' },
  { id: 'chicken', emoji: '🐔', color: '#FF6B9D', sound: 'Cluck!', stickerId: 'bird-1' },
  { id: 'duck', emoji: '🦆', color: '#FFC312', sound: 'Quack!', stickerId: 'bird-1' },
  { id: 'pig', emoji: '🐷', color: '#FF6B9D', sound: 'Oink!', stickerId: 'bunny-1' },
  { id: 'frog', emoji: '🐸', color: '#2ED573', sound: 'Ribbit!', stickerId: 'bunny-1' },
  { id: 'lion', emoji: '🦁', color: '#FF6348', sound: 'Roar!', stickerId: 'dog-1' },
  { id: 'monkey', emoji: '🐵', color: '#A855F7', sound: 'Ooh ooh!', stickerId: 'bunny-1' },
  { id: 'whale', emoji: '🐋', color: '#3742FA', sound: 'Whoosh!', stickerId: 'whale-1' },
  { id: 'bird', emoji: '🐦', color: '#00D2D3', sound: 'Tweet!', stickerId: 'bird-1' },
  { id: 'bunny', emoji: '🐰', color: '#A855F7', sound: 'Squeak!', stickerId: 'bunny-1' },
];

function AnimalCard({
  animal,
  index,
  onPress,
}: {
  animal: Animal;
  index: number;
  onPress: () => void;
}) {
  const scale = useSharedValue(1);
  const rotate = useSharedValue(0);
  const [showSound, setShowSound] = useState(false);

  const handlePress = () => {
    // Bounce animation
    scale.value = withSequence(
      withTiming(0.85, { duration: 80 }),
      withSpring(1.2, { damping: 4, stiffness: 300 }),
      withSpring(1, { damping: 8 })
    );

    // Wiggle
    rotate.value = withSequence(
      withTiming(10, { duration: 60 }),
      withTiming(-10, { duration: 60 }),
      withTiming(8, { duration: 60 }),
      withTiming(-8, { duration: 60 }),
      withTiming(0, { duration: 80 })
    );

    // Show sound text briefly
    setShowSound(true);
    setTimeout(() => setShowSound(false), 1200);

    HapticFeedback.elementReact();
    onPress();
  };

  const animStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value },
      { rotate: `${rotate.value}deg` },
    ],
  }));

  return (
    <Animated.View
      entering={FadeInDown.delay(index * 80).springify()}
    >
      <Pressable onPress={handlePress}>
        <Animated.View
          style={[
            styles.animalCard,
            { backgroundColor: animal.color },
            animStyle,
          ]}
        >
          <Text style={styles.animalEmoji}>{animal.emoji}</Text>
          {showSound && (
            <Animated.View
              entering={FadeInDown.duration(200)}
              style={styles.soundBubble}
            >
              <Text style={styles.soundText}>{animal.sound}</Text>
            </Animated.View>
          )}
        </Animated.View>
      </Pressable>
    </Animated.View>
  );
}

export function AnimalsScreen({ navigation }: { navigation: any }) {
  const { dispatch } = useApp();
  const [tappedAnimals, setTappedAnimals] = useState<Set<string>>(new Set());

  const handleAnimalTap = (animal: Animal) => {
    // Play a sound effect
    const sounds = ['boing', 'pop', 'chime', 'sparkle'] as const;
    const sfx = sounds[Math.floor(Math.random() * sounds.length)];
    SoundManager.playSFX(sfx);

    // Track tapped animals
    const newTapped = new Set(tappedAnimals);
    newTapped.add(animal.id);
    setTappedAnimals(newTapped);

    // Earn sticker every 3 unique animals tapped
    if (newTapped.size % 3 === 0) {
      dispatch({ type: 'EARN_STICKER', stickerId: animal.stickerId });
      SoundManager.playSFX('success');
      HapticFeedback.success();
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar hidden />
      <LinearGradient
        colors={['#00B894', '#2ED573']}
        style={StyleSheet.absoluteFill}
      />

      {/* Home button */}
      <Pressable
        style={styles.homeButton}
        onPress={() => {
          HapticFeedback.tap();
          SoundManager.playSFX('pop');
          navigation.goBack();
        }}
      >
        <Text style={styles.homeEmoji}>🏠</Text>
      </Pressable>

      {/* Title */}
      <View style={styles.titleArea}>
        <Text style={styles.titleEmoji}>🐾</Text>
        {/* Progress dots */}
        <View style={styles.progressRow}>
          {Array.from({ length: Math.min(tappedAnimals.size, 12) }).map((_, i) => (
            <Text key={i} style={styles.progressDot}>⭐</Text>
          ))}
        </View>
      </View>

      {/* Animal grid */}
      <ScrollView
        contentContainerStyle={styles.grid}
        showsVerticalScrollIndicator={false}
      >
        {ANIMALS.map((animal, index) => (
          <AnimalCard
            key={animal.id}
            animal={animal}
            index={index}
            onPress={() => handleAnimalTap(animal)}
          />
        ))}
      </ScrollView>
    </View>
  );
}

const CARD_SIZE = (SCREEN_W - 72) / 3;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  homeButton: {
    position: 'absolute',
    top: 20,
    left: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.25)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
  },
  homeEmoji: {
    fontSize: 28,
  },
  titleArea: {
    alignItems: 'center',
    paddingTop: 30,
    paddingBottom: 10,
  },
  titleEmoji: {
    fontSize: 50,
  },
  progressRow: {
    flexDirection: 'row',
    marginTop: 8,
    gap: 2,
  },
  progressDot: {
    fontSize: 14,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 12,
    padding: 16,
    paddingBottom: 40,
  },
  animalCard: {
    width: CARD_SIZE,
    height: CARD_SIZE,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  animalEmoji: {
    fontSize: CARD_SIZE * 0.5,
  },
  soundBubble: {
    position: 'absolute',
    top: -20,
    backgroundColor: 'rgba(255,255,255,0.9)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  soundText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#2D3436',
  },
});
