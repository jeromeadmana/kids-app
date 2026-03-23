import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  StatusBar,
  Pressable,
  Text,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withSequence,
  FadeInDown,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { useApp } from '../context/AppContext';
import { Colors } from '../utils/colors';
import { HapticFeedback } from '../utils/haptics';
import { SoundManager } from '../utils/SoundManager';
import { CelebrationOverlay } from '../components/CelebrationOverlay';

const { width: SCREEN_W } = Dimensions.get('window');

interface Props {
  navigation: any;
}

interface Card {
  id: number;
  emoji: string;
  pairId: number;
}

const DECKS = {
  animals: ['🐱', '🐶', '🐸', '🦁', '🐰', '🐻'],
  fruits: ['🍎', '🍌', '🍇', '🍊', '🍓', '🍉'],
  vehicles: ['🚗', '🚌', '🚀', '✈️', '🚂', '⛵'],
  emojis: ['😀', '😍', '🤩', '😎', '🥳', '😺'],
};

type DeckName = keyof typeof DECKS;

const DECK_LIST: DeckName[] = ['animals', 'fruits', 'vehicles', 'emojis'];
const DECK_ICONS: Record<DeckName, string> = {
  animals: '🐾',
  fruits: '🍎',
  vehicles: '🚗',
  emojis: '😀',
};

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function buildCards(deck: DeckName, pairCount: number): Card[] {
  const emojis = DECKS[deck].slice(0, pairCount);
  const cards: Card[] = [];
  emojis.forEach((emoji, idx) => {
    cards.push({ id: idx * 2, emoji, pairId: idx });
    cards.push({ id: idx * 2 + 1, emoji, pairId: idx });
  });
  return shuffle(cards);
}

function FlipCard({
  card,
  isFlipped,
  isMatched,
  onPress,
  size,
}: {
  card: Card;
  isFlipped: boolean;
  isMatched: boolean;
  onPress: () => void;
  size: number;
}) {
  const rotateY = useSharedValue(0);
  const scale = useSharedValue(1);

  useEffect(() => {
    rotateY.value = withTiming(isFlipped || isMatched ? 180 : 0, { duration: 300 });
  }, [isFlipped, isMatched]);

  const frontStyle = useAnimatedStyle(() => ({
    transform: [
      { perspective: 800 },
      { rotateY: `${rotateY.value}deg` },
      { scale: scale.value },
    ],
    backfaceVisibility: 'hidden' as const,
  }));

  const backStyle = useAnimatedStyle(() => ({
    transform: [
      { perspective: 800 },
      { rotateY: `${rotateY.value + 180}deg` },
      { scale: scale.value },
    ],
    backfaceVisibility: 'hidden' as const,
  }));

  const handlePress = () => {
    if (isFlipped || isMatched) return;
    scale.value = withSequence(
      withSpring(0.9),
      withSpring(1)
    );
    onPress();
  };

  return (
    <Pressable onPress={handlePress} style={{ width: size, height: size, margin: 6 }}>
      {/* Back face (question mark) */}
      <Animated.View style={[styles.card, { width: size, height: size, backgroundColor: Colors.blue }, frontStyle]}>
        <Text style={[styles.cardEmoji, { fontSize: size * 0.45 }]}>❓</Text>
      </Animated.View>
      {/* Front face (emoji) */}
      <Animated.View style={[styles.card, styles.cardFront, { width: size, height: size }, backStyle]}>
        <Text style={[styles.cardEmoji, { fontSize: size * 0.45 }]}>{card.emoji}</Text>
        {isMatched && <Text style={styles.matchStar}>⭐</Text>}
      </Animated.View>
    </Pressable>
  );
}

export function MemoryGameScreen({ navigation }: Props) {
  const { dispatch } = useApp();
  const [deck, setDeck] = useState<DeckName>('animals');
  const [gridSize, setGridSize] = useState<'2x2' | '3x4'>('2x2');
  const [cards, setCards] = useState<Card[]>([]);
  const [flipped, setFlipped] = useState<number[]>([]);
  const [matched, setMatched] = useState<Set<number>>(new Set());
  const [locked, setLocked] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);

  const pairCount = gridSize === '2x2' ? 2 : 6;
  const columns = gridSize === '2x2' ? 2 : 3;

  const startNewGame = useCallback(() => {
    setCards(buildCards(deck, pairCount));
    setFlipped([]);
    setMatched(new Set());
    setLocked(false);
  }, [deck, pairCount]);

  useEffect(() => {
    startNewGame();
  }, [startNewGame]);

  const handleCardPress = (index: number) => {
    if (locked || flipped.includes(index) || matched.has(cards[index].pairId)) return;

    SoundManager.playSFX('tap');
    HapticFeedback.tap();

    const newFlipped = [...flipped, index];
    setFlipped(newFlipped);

    if (newFlipped.length === 2) {
      setLocked(true);
      const [first, second] = newFlipped;

      if (cards[first].pairId === cards[second].pairId) {
        // Match!
        setTimeout(() => {
          SoundManager.playSFX('success');
          HapticFeedback.success();
          const newMatched = new Set(matched);
          newMatched.add(cards[first].pairId);
          setMatched(newMatched);
          setFlipped([]);
          setLocked(false);

          // Check win
          if (newMatched.size === pairCount) {
            setTimeout(() => {
              SoundManager.playSFX('celebration');
              HapticFeedback.celebrate();
              const stickerId = gridSize === '2x2' ? 'memory-1' : 'memory-2';
              dispatch({ type: 'EARN_STICKER', stickerId });
              setShowCelebration(true);
            }, 400);
          }
        }, 300);
      } else {
        // No match — flip back
        setTimeout(() => {
          SoundManager.playSFX('pop');
          setFlipped([]);
          setLocked(false);
        }, 800);
      }
    }
  };

  const cardSize = Math.min(
    (SCREEN_W - 40 - columns * 12) / columns,
    120
  );

  return (
    <View style={styles.container}>
      <StatusBar hidden />
      <LinearGradient colors={['#FD79A8', '#E84393']} style={StyleSheet.absoluteFill} />

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
        <Text style={styles.titleEmoji}>🃏</Text>
      </View>

      {/* Deck selector */}
      <View style={styles.deckRow}>
        {DECK_LIST.map((d) => (
          <Pressable
            key={d}
            style={[styles.deckButton, deck === d && styles.deckButtonActive]}
            onPress={() => {
              setDeck(d);
              HapticFeedback.tap();
              SoundManager.playSFX('chime');
            }}
          >
            <Text style={styles.deckEmoji}>{DECK_ICONS[d]}</Text>
          </Pressable>
        ))}
      </View>

      {/* Grid size selector */}
      <View style={styles.sizeRow}>
        {(['2x2', '3x4'] as const).map((size) => (
          <Pressable
            key={size}
            style={[styles.sizeButton, gridSize === size && styles.sizeButtonActive]}
            onPress={() => {
              setGridSize(size);
              HapticFeedback.tap();
            }}
          >
            <Text style={[styles.sizeText, gridSize === size && styles.sizeTextActive]}>
              {size}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Card grid */}
      <View style={styles.gridContainer}>
        <View style={[styles.grid, { width: columns * (cardSize + 12) }]}>
          {cards.map((card, index) => (
            <FlipCard
              key={`${card.id}-${deck}-${gridSize}`}
              card={card}
              isFlipped={flipped.includes(index)}
              isMatched={matched.has(card.pairId)}
              onPress={() => handleCardPress(index)}
              size={cardSize}
            />
          ))}
        </View>
      </View>

      <CelebrationOverlay
        visible={showCelebration}
        onComplete={() => {
          setShowCelebration(false);
          startNewGame();
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
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
  homeEmoji: { fontSize: 28 },
  titleArea: { alignItems: 'center', paddingTop: 24 },
  titleEmoji: { fontSize: 48 },
  deckRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    marginTop: 12,
  },
  deckButton: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  deckButtonActive: {
    backgroundColor: 'rgba(255,255,255,0.5)',
    borderWidth: 2,
    borderColor: '#fff',
  },
  deckEmoji: { fontSize: 24 },
  sizeRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    marginTop: 10,
  },
  sizeButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  sizeButtonActive: {
    backgroundColor: 'rgba(255,255,255,0.5)',
    borderWidth: 2,
    borderColor: '#fff',
  },
  sizeText: { fontSize: 16, fontWeight: '700', color: 'rgba(255,255,255,0.7)' },
  sizeTextActive: { color: '#fff' },
  gridContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  card: {
    position: 'absolute',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  cardFront: {
    backgroundColor: '#fff',
  },
  cardEmoji: { fontSize: 40 },
  matchStar: {
    position: 'absolute',
    top: -4,
    right: -4,
    fontSize: 16,
  },
});
