import React, { useState, useMemo } from 'react';
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
  withSpring,
  withSequence,
  withTiming,
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

const ALPHABET = [
  { letter: 'A', word: 'Apple', emoji: '🍎' },
  { letter: 'B', word: 'Bear', emoji: '🐻' },
  { letter: 'C', word: 'Cat', emoji: '🐱' },
  { letter: 'D', word: 'Dog', emoji: '🐶' },
  { letter: 'E', word: 'Elephant', emoji: '🐘' },
  { letter: 'F', word: 'Fish', emoji: '🐟' },
  { letter: 'G', word: 'Grape', emoji: '🍇' },
  { letter: 'H', word: 'Horse', emoji: '🐴' },
  { letter: 'I', word: 'Ice Cream', emoji: '🍦' },
  { letter: 'J', word: 'Jellyfish', emoji: '🪼' },
  { letter: 'K', word: 'Koala', emoji: '🐨' },
  { letter: 'L', word: 'Lion', emoji: '🦁' },
  { letter: 'M', word: 'Moon', emoji: '🌙' },
  { letter: 'N', word: 'Nest', emoji: '🪺' },
  { letter: 'O', word: 'Orange', emoji: '🍊' },
  { letter: 'P', word: 'Penguin', emoji: '🐧' },
  { letter: 'Q', word: 'Queen', emoji: '👸' },
  { letter: 'R', word: 'Rabbit', emoji: '🐰' },
  { letter: 'S', word: 'Star', emoji: '⭐' },
  { letter: 'T', word: 'Tiger', emoji: '🐯' },
  { letter: 'U', word: 'Umbrella', emoji: '☂️' },
  { letter: 'V', word: 'Violin', emoji: '🎻' },
  { letter: 'W', word: 'Whale', emoji: '🐋' },
  { letter: 'X', word: 'Xylophone', emoji: '🎵' },
  { letter: 'Y', word: 'Yarn', emoji: '🧶' },
  { letter: 'Z', word: 'Zebra', emoji: '🦓' },
];

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function ABCLettersScreen({ navigation }: Props) {
  const { dispatch } = useApp();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isUppercase, setIsUppercase] = useState(true);
  const [visited, setVisited] = useState<Set<number>>(new Set([0]));
  const [showCelebration, setShowCelebration] = useState(false);
  const [matchMode, setMatchMode] = useState(false);
  const [matchCorrect, setMatchCorrect] = useState<boolean | null>(null);
  const [matchScore, setMatchScore] = useState(0);

  const current = ALPHABET[currentIndex];
  const displayLetter = isUppercase ? current.letter : current.letter.toLowerCase();

  // Generate 3 emoji options for matching (1 correct + 2 random)
  const matchOptions = useMemo(() => {
    const others = ALPHABET.filter((_, i) => i !== currentIndex);
    const picked = shuffle(others).slice(0, 2);
    return shuffle([
      { emoji: current.emoji, correct: true },
      { emoji: picked[0].emoji, correct: false },
      { emoji: picked[1].emoji, correct: false },
    ]);
  }, [currentIndex]);

  const navigateToLetter = (index: number) => {
    setCurrentIndex(index);
    setMatchMode(false);
    setMatchCorrect(null);
    const newVisited = new Set(visited);
    newVisited.add(index);
    setVisited(newVisited);
    SoundManager.playSFX('chime');
    HapticFeedback.tap();

    // Check sticker milestones
    if (newVisited.size >= 13) {
      dispatch({ type: 'EARN_STICKER', stickerId: 'abc-1' });
    }
    if (newVisited.size >= 26) {
      dispatch({ type: 'EARN_STICKER', stickerId: 'abc-2' });
      if (!showCelebration) {
        SoundManager.playSFX('celebration');
        HapticFeedback.celebrate();
        setShowCelebration(true);
      }
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) navigateToLetter(currentIndex - 1);
  };

  const handleNext = () => {
    if (currentIndex < 25) navigateToLetter(currentIndex + 1);
  };

  const handleMatchOption = (correct: boolean) => {
    if (correct) {
      SoundManager.playSFX('success');
      HapticFeedback.success();
      setMatchCorrect(true);
      const newScore = matchScore + 1;
      setMatchScore(newScore);
      // Auto-advance after correct match
      setTimeout(() => {
        if (currentIndex < 25) {
          navigateToLetter(currentIndex + 1);
        }
        setMatchMode(false);
        setMatchCorrect(null);
      }, 600);
    } else {
      SoundManager.playSFX('boing');
      HapticFeedback.elementReact();
      setMatchCorrect(false);
      setTimeout(() => setMatchCorrect(null), 400);
    }
  };

  const TILE_SIZE = Math.floor((SCREEN_W - 60) / 7);

  return (
    <View style={styles.container}>
      <StatusBar hidden />
      <LinearGradient colors={['#74B9FF', '#0984E3']} style={StyleSheet.absoluteFill} />

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

      {/* Case toggle */}
      <Pressable
        style={styles.caseToggle}
        onPress={() => {
          setIsUppercase(!isUppercase);
          HapticFeedback.tap();
          SoundManager.playSFX('pop');
        }}
      >
        <Text style={styles.caseToggleText}>{isUppercase ? 'Aa' : 'aA'}</Text>
      </Pressable>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Main letter display */}
        <View style={styles.letterDisplay}>
          {/* Left arrow */}
          <Pressable
            style={[styles.arrowButton, currentIndex === 0 && styles.arrowDisabled]}
            onPress={handlePrev}
            disabled={currentIndex === 0}
          >
            <Text style={styles.arrowText}>◀️</Text>
          </Pressable>

          <View style={styles.letterCenter}>
            <Text style={styles.bigLetter}>{displayLetter}</Text>
            <Text style={styles.bigEmoji}>{current.emoji}</Text>
            <Text style={styles.wordText}>{current.word}</Text>
          </View>

          {/* Right arrow */}
          <Pressable
            style={[styles.arrowButton, currentIndex === 25 && styles.arrowDisabled]}
            onPress={handleNext}
            disabled={currentIndex === 25}
          >
            <Text style={styles.arrowText}>▶️</Text>
          </Pressable>
        </View>

        {/* Match mode toggle / Match game */}
        {!matchMode ? (
          <Pressable
            style={styles.matchButton}
            onPress={() => {
              setMatchMode(true);
              SoundManager.playSFX('sparkle');
              HapticFeedback.tap();
            }}
          >
            <Text style={styles.matchButtonText}>🎯</Text>
          </Pressable>
        ) : (
          <View style={styles.matchArea}>
            <Text style={styles.matchPrompt}>
              {displayLetter} = ?
            </Text>
            <View style={styles.matchOptions}>
              {matchOptions.map((opt, i) => (
                <Pressable
                  key={i}
                  style={[
                    styles.matchOption,
                    matchCorrect === true && opt.correct && styles.matchOptionCorrect,
                    matchCorrect === false && !opt.correct && styles.matchOptionWrong,
                  ]}
                  onPress={() => handleMatchOption(opt.correct)}
                >
                  <Text style={styles.matchOptionEmoji}>{opt.emoji}</Text>
                </Pressable>
              ))}
            </View>
          </View>
        )}

        {/* Letter grid */}
        <View style={styles.letterGrid}>
          {ALPHABET.map((item, index) => (
            <Pressable
              key={item.letter}
              style={[
                styles.letterTile,
                { width: TILE_SIZE, height: TILE_SIZE },
                index === currentIndex && styles.letterTileActive,
                visited.has(index) && styles.letterTileVisited,
              ]}
              onPress={() => navigateToLetter(index)}
            >
              <Text style={[
                styles.letterTileText,
                { fontSize: TILE_SIZE * 0.5 },
                index === currentIndex && styles.letterTileTextActive,
              ]}>
                {isUppercase ? item.letter : item.letter.toLowerCase()}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Progress */}
        <Text style={styles.progressText}>
          {visited.size} / 26 ⭐
        </Text>
      </ScrollView>

      <CelebrationOverlay
        visible={showCelebration}
        onComplete={() => {
          setShowCelebration(false);
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
  caseToggle: {
    position: 'absolute',
    top: 20,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.25)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
  },
  caseToggleText: { fontSize: 20, fontWeight: '800', color: '#fff' },
  scrollContent: {
    alignItems: 'center',
    paddingTop: 30,
    paddingBottom: 40,
  },
  letterDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 50,
    gap: 12,
  },
  arrowButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  arrowDisabled: { opacity: 0.3 },
  arrowText: { fontSize: 24 },
  letterCenter: {
    alignItems: 'center',
    minWidth: 160,
  },
  bigLetter: {
    fontSize: 100,
    fontWeight: '900',
    color: '#fff',
    textShadowColor: 'rgba(0,0,0,0.2)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
  },
  bigEmoji: { fontSize: 60, marginTop: 4 },
  wordText: {
    fontSize: 28,
    fontWeight: '700',
    color: '#fff',
    marginTop: 4,
  },
  matchButton: {
    marginTop: 16,
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  matchButtonText: { fontSize: 32 },
  matchArea: {
    alignItems: 'center',
    marginTop: 16,
  },
  matchPrompt: {
    fontSize: 32,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 12,
  },
  matchOptions: {
    flexDirection: 'row',
    gap: 16,
  },
  matchOption: {
    width: 72,
    height: 72,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  matchOptionCorrect: { backgroundColor: Colors.green },
  matchOptionWrong: { backgroundColor: 'rgba(255,0,0,0.3)' },
  matchOptionEmoji: { fontSize: 36 },
  letterGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 6,
    marginTop: 24,
    paddingHorizontal: 20,
  },
  letterTile: {
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  letterTileActive: {
    backgroundColor: Colors.yellow,
    borderWidth: 2,
    borderColor: '#fff',
  },
  letterTileVisited: {
    backgroundColor: 'rgba(255,255,255,0.35)',
  },
  letterTileText: {
    fontWeight: '800',
    color: '#fff',
  },
  letterTileTextActive: {
    color: '#333',
  },
  progressText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
    marginTop: 16,
  },
});
