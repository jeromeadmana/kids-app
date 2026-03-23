import React, { useState, useMemo, useCallback } from 'react';
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

type Mode = 'counting' | 'tracing' | 'addition';

const OBJECT_EMOJIS = ['🍎', '🍌', '⭐', '🌸', '🐟', '❤️', '🎈', '🍊'];

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateCountingRound() {
  const count = Math.floor(Math.random() * 10) + 1;
  const emoji = pickRandom(OBJECT_EMOJIS);
  // Generate 4 options including the correct answer
  const options = new Set<number>([count]);
  while (options.size < 4) {
    const opt = Math.floor(Math.random() * 10) + 1;
    options.add(opt);
  }
  return {
    count,
    emoji,
    options: [...options].sort((a, b) => a - b),
  };
}

function generateAdditionRound() {
  const a = Math.floor(Math.random() * 3) + 1;
  const b = Math.floor(Math.random() * (5 - a)) + 1;
  const answer = a + b;
  const emoji = pickRandom(OBJECT_EMOJIS);
  const options = new Set<number>([answer]);
  while (options.size < 3) {
    const opt = Math.floor(Math.random() * 8) + 1;
    options.add(opt);
  }
  return { a, b, answer, emoji, options: [...options].sort((n1, n2) => n1 - n2) };
}

// Dot positions for number tracing (simplified sequential dots)
const TRACE_DOTS: Record<number, { x: number; y: number }[]> = {
  1: [{ x: 0.5, y: 0.1 }, { x: 0.5, y: 0.5 }, { x: 0.5, y: 0.9 }],
  2: [{ x: 0.3, y: 0.15 }, { x: 0.7, y: 0.15 }, { x: 0.7, y: 0.45 }, { x: 0.3, y: 0.45 }, { x: 0.3, y: 0.8 }, { x: 0.7, y: 0.8 }],
  3: [{ x: 0.3, y: 0.1 }, { x: 0.7, y: 0.1 }, { x: 0.7, y: 0.4 }, { x: 0.3, y: 0.45 }, { x: 0.7, y: 0.7 }, { x: 0.3, y: 0.85 }],
  4: [{ x: 0.3, y: 0.1 }, { x: 0.3, y: 0.45 }, { x: 0.7, y: 0.45 }, { x: 0.7, y: 0.1 }, { x: 0.7, y: 0.85 }],
  5: [{ x: 0.7, y: 0.1 }, { x: 0.3, y: 0.1 }, { x: 0.3, y: 0.4 }, { x: 0.7, y: 0.4 }, { x: 0.7, y: 0.75 }, { x: 0.3, y: 0.85 }],
  6: [{ x: 0.6, y: 0.1 }, { x: 0.3, y: 0.3 }, { x: 0.3, y: 0.6 }, { x: 0.5, y: 0.8 }, { x: 0.7, y: 0.6 }, { x: 0.5, y: 0.45 }],
  7: [{ x: 0.3, y: 0.1 }, { x: 0.7, y: 0.1 }, { x: 0.5, y: 0.45 }, { x: 0.4, y: 0.85 }],
  8: [{ x: 0.5, y: 0.1 }, { x: 0.3, y: 0.25 }, { x: 0.5, y: 0.45 }, { x: 0.7, y: 0.25 }, { x: 0.5, y: 0.45 }, { x: 0.3, y: 0.65 }, { x: 0.5, y: 0.85 }, { x: 0.7, y: 0.65 }],
  9: [{ x: 0.5, y: 0.15 }, { x: 0.3, y: 0.3 }, { x: 0.5, y: 0.45 }, { x: 0.7, y: 0.3 }, { x: 0.7, y: 0.6 }, { x: 0.5, y: 0.85 }],
  10: [{ x: 0.2, y: 0.1 }, { x: 0.2, y: 0.85 }, { x: 0.55, y: 0.1 }, { x: 0.75, y: 0.3 }, { x: 0.75, y: 0.65 }, { x: 0.55, y: 0.85 }],
};

export function NumbersScreen({ navigation }: Props) {
  const { dispatch } = useApp();
  const [mode, setMode] = useState<Mode>('counting');
  const [showCelebration, setShowCelebration] = useState(false);

  // Counting state
  const [countRound, setCountRound] = useState(generateCountingRound);
  const [countScore, setCountScore] = useState(0);
  const [countFeedback, setCountFeedback] = useState<'correct' | 'wrong' | null>(null);

  // Tracing state
  const [traceNumber, setTraceNumber] = useState(1);
  const [tracedDots, setTracedDots] = useState<Set<number>>(new Set());

  // Addition state
  const [addRound, setAddRound] = useState(generateAdditionRound);
  const [addScore, setAddScore] = useState(0);
  const [addFeedback, setAddFeedback] = useState<'correct' | 'wrong' | null>(null);

  const handleCountAnswer = (num: number) => {
    if (num === countRound.count) {
      SoundManager.playSFX('success');
      HapticFeedback.success();
      setCountFeedback('correct');
      const newScore = countScore + 1;
      setCountScore(newScore);
      if (newScore === 5) {
        dispatch({ type: 'EARN_STICKER', stickerId: 'numbers-1' });
      }
      setTimeout(() => {
        setCountFeedback(null);
        setCountRound(generateCountingRound());
      }, 600);
    } else {
      SoundManager.playSFX('boing');
      HapticFeedback.elementReact();
      setCountFeedback('wrong');
      setTimeout(() => setCountFeedback(null), 400);
    }
  };

  const handleTraceDot = (index: number) => {
    // Must tap dots in order
    if (index !== tracedDots.size) {
      SoundManager.playSFX('boing');
      HapticFeedback.elementReact();
      return;
    }
    SoundManager.playSFX('tap');
    HapticFeedback.tap();
    const newTraced = new Set(tracedDots);
    newTraced.add(index);
    setTracedDots(newTraced);

    const dots = TRACE_DOTS[traceNumber] || [];
    if (newTraced.size === dots.length) {
      SoundManager.playSFX('success');
      HapticFeedback.success();
      setTimeout(() => {
        if (traceNumber < 10) {
          setTraceNumber(traceNumber + 1);
        } else {
          setTraceNumber(1);
        }
        setTracedDots(new Set());
      }, 500);
    }
  };

  const handleAddAnswer = (num: number) => {
    if (num === addRound.answer) {
      SoundManager.playSFX('success');
      HapticFeedback.success();
      setAddFeedback('correct');
      const newScore = addScore + 1;
      setAddScore(newScore);
      if (newScore === 3) {
        dispatch({ type: 'EARN_STICKER', stickerId: 'numbers-2' });
        SoundManager.playSFX('celebration');
        HapticFeedback.celebrate();
        setShowCelebration(true);
      }
      setTimeout(() => {
        setAddFeedback(null);
        setAddRound(generateAdditionRound());
      }, 600);
    } else {
      SoundManager.playSFX('boing');
      HapticFeedback.elementReact();
      setAddFeedback('wrong');
      setTimeout(() => setAddFeedback(null), 400);
    }
  };

  const traceDots = TRACE_DOTS[traceNumber] || [];
  const TRACE_AREA = Math.min(SCREEN_W - 80, 260);

  return (
    <View style={styles.container}>
      <StatusBar hidden />
      <LinearGradient colors={['#FDCB6E', '#E17055']} style={StyleSheet.absoluteFill} />

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

      {/* Mode tabs */}
      <View style={styles.tabRow}>
        {([
          { key: 'counting' as Mode, label: '🔢' },
          { key: 'tracing' as Mode, label: '✏️' },
          { key: 'addition' as Mode, label: '➕' },
        ]).map((tab) => (
          <Pressable
            key={tab.key}
            style={[styles.tab, mode === tab.key && styles.tabActive]}
            onPress={() => {
              setMode(tab.key);
              HapticFeedback.tap();
              SoundManager.playSFX('pop');
            }}
          >
            <Text style={styles.tabText}>{tab.label}</Text>
          </Pressable>
        ))}
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* COUNTING MODE */}
        {mode === 'counting' && (
          <View style={styles.modeContainer}>
            {/* Objects to count */}
            <View style={styles.objectsArea}>
              {Array.from({ length: countRound.count }).map((_, i) => (
                <Animated.Text
                  key={i}
                  entering={FadeInDown.delay(i * 60).springify()}
                  style={styles.objectEmoji}
                >
                  {countRound.emoji}
                </Animated.Text>
              ))}
            </View>

            {/* Answer options */}
            <Text style={styles.promptText}>How many?</Text>
            <View style={styles.optionsRow}>
              {countRound.options.map((num) => (
                <Pressable
                  key={num}
                  style={[
                    styles.optionButton,
                    countFeedback === 'correct' && num === countRound.count && styles.optionCorrect,
                    countFeedback === 'wrong' && num !== countRound.count && styles.optionWrong,
                  ]}
                  onPress={() => handleCountAnswer(num)}
                >
                  <Text style={styles.optionText}>{num}</Text>
                </Pressable>
              ))}
            </View>
            <Text style={styles.scoreText}>⭐ {countScore}</Text>
          </View>
        )}

        {/* TRACING MODE */}
        {mode === 'tracing' && (
          <View style={styles.modeContainer}>
            <Text style={styles.traceTitle}>{traceNumber}</Text>
            <View style={[styles.traceArea, { width: TRACE_AREA, height: TRACE_AREA }]}>
              {traceDots.map((dot, i) => {
                const traced = tracedDots.has(i);
                const isNext = i === tracedDots.size;
                return (
                  <Pressable
                    key={i}
                    style={[
                      styles.traceDot,
                      {
                        left: dot.x * TRACE_AREA - 20,
                        top: dot.y * TRACE_AREA - 20,
                      },
                      traced && styles.traceDotDone,
                      isNext && styles.traceDotNext,
                    ]}
                    onPress={() => handleTraceDot(i)}
                  >
                    <Text style={styles.traceDotText}>
                      {traced ? '⭐' : isNext ? `${i + 1}` : '·'}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        )}

        {/* ADDITION MODE */}
        {mode === 'addition' && (
          <View style={styles.modeContainer}>
            {/* Visual equation */}
            <View style={styles.equationArea}>
              <View style={styles.equationGroup}>
                {Array.from({ length: addRound.a }).map((_, i) => (
                  <Text key={`a-${i}`} style={styles.equationEmoji}>{addRound.emoji}</Text>
                ))}
              </View>
              <Text style={styles.equationOp}>+</Text>
              <View style={styles.equationGroup}>
                {Array.from({ length: addRound.b }).map((_, i) => (
                  <Text key={`b-${i}`} style={styles.equationEmoji}>{addRound.emoji}</Text>
                ))}
              </View>
              <Text style={styles.equationOp}>=</Text>
              <Text style={styles.equationQuestion}>?</Text>
            </View>

            {/* Answer options */}
            <View style={styles.optionsRow}>
              {addRound.options.map((num) => (
                <Pressable
                  key={num}
                  style={[
                    styles.optionButton,
                    addFeedback === 'correct' && num === addRound.answer && styles.optionCorrect,
                  ]}
                  onPress={() => handleAddAnswer(num)}
                >
                  <Text style={styles.optionText}>{num}</Text>
                </Pressable>
              ))}
            </View>
            <Text style={styles.scoreText}>⭐ {addScore}</Text>
          </View>
        )}
      </ScrollView>

      <CelebrationOverlay
        visible={showCelebration}
        onComplete={() => setShowCelebration(false)}
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
  tabRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    paddingTop: 24,
  },
  tab: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  tabActive: {
    backgroundColor: 'rgba(255,255,255,0.5)',
    borderWidth: 2,
    borderColor: '#fff',
  },
  tabText: { fontSize: 24 },
  content: {
    alignItems: 'center',
    paddingTop: 20,
    paddingBottom: 40,
  },
  modeContainer: {
    alignItems: 'center',
    width: '100%',
  },
  objectsArea: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 12,
    padding: 20,
    marginTop: 10,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 24,
    marginHorizontal: 20,
    minHeight: 100,
  },
  objectEmoji: { fontSize: 44 },
  promptText: {
    fontSize: 28,
    fontWeight: '800',
    color: '#fff',
    marginTop: 20,
    marginBottom: 12,
  },
  optionsRow: {
    flexDirection: 'row',
    gap: 16,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  optionButton: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionCorrect: { backgroundColor: Colors.green },
  optionWrong: { backgroundColor: 'rgba(255,0,0,0.2)' },
  optionText: {
    fontSize: 28,
    fontWeight: '900',
    color: '#fff',
  },
  scoreText: {
    fontSize: 22,
    fontWeight: '700',
    color: '#fff',
    marginTop: 20,
  },
  traceTitle: {
    fontSize: 60,
    fontWeight: '900',
    color: '#fff',
    marginBottom: 12,
  },
  traceArea: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 24,
    position: 'relative',
  },
  traceDot: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  traceDotDone: { backgroundColor: Colors.green },
  traceDotNext: {
    backgroundColor: Colors.yellow,
    borderWidth: 2,
    borderColor: '#fff',
  },
  traceDotText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#fff',
  },
  equationArea: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 30,
    flexWrap: 'wrap',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  equationGroup: {
    flexDirection: 'row',
    gap: 4,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 16,
    padding: 10,
  },
  equationEmoji: { fontSize: 36 },
  equationOp: {
    fontSize: 36,
    fontWeight: '900',
    color: '#fff',
  },
  equationQuestion: {
    fontSize: 48,
    fontWeight: '900',
    color: '#fff',
  },
});
