import React, { useState, useEffect, useRef, useCallback } from 'react';
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
  withSpring,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { useApp } from '../context/AppContext';
import { Colors } from '../utils/colors';
import { HapticFeedback } from '../utils/haptics';
import { SoundManager } from '../utils/SoundManager';
import { ToneGenerator, NOTES } from '../utils/ToneGenerator';
import { CelebrationOverlay } from '../components/CelebrationOverlay';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');

interface Props {
  navigation: any;
}

type Instrument = 'piano' | 'xylophone' | 'drums';
type PlayMode = 'free' | 'follow';

const PIANO_NOTES = ['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4', 'C5'];
const XYLO_NOTES = ['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4', 'C5'];
const XYLO_COLORS = [Colors.red, Colors.orange, Colors.yellow, Colors.green, Colors.cyan, Colors.blue, Colors.purple, Colors.pink];

const DRUM_PADS = [
  { id: 'kick', label: '🥁', sfx: 'tap' as const, color: Colors.red },
  { id: 'snare', label: '🪘', sfx: 'pop' as const, color: Colors.orange },
  { id: 'hihat', label: '🔔', sfx: 'chime' as const, color: Colors.yellow },
  { id: 'crash', label: '💥', sfx: 'whoosh' as const, color: Colors.blue },
];

function generatePattern(instrument: Instrument): number[] {
  const max = instrument === 'drums' ? 4 : 8;
  const length = 3 + Math.floor(Math.random() * 2); // 3-4 notes
  return Array.from({ length }, () => Math.floor(Math.random() * max));
}

function PianoKey({
  note,
  index,
  active,
  onPress,
}: {
  note: string;
  index: number;
  active: boolean;
  onPress: () => void;
}) {
  const scale = useSharedValue(1);
  const bgColor = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scaleY: scale.value }],
    backgroundColor: bgColor.value > 0.5 ? XYLO_COLORS[index] : '#fff',
  }));

  const handlePress = () => {
    scale.value = withSequence(withSpring(0.95), withSpring(1));
    bgColor.value = withSequence(withTiming(1, { duration: 100 }), withTiming(0, { duration: 300 }));
    onPress();
  };

  return (
    <Pressable onPress={handlePress} style={styles.pianoKeyWrapper}>
      <Animated.View
        style={[
          styles.pianoKey,
          active && styles.pianoKeyHighlight,
          animatedStyle,
        ]}
      >
        <Text style={styles.pianoKeyLabel}>{note.replace('4', '').replace('5', '')}</Text>
      </Animated.View>
    </Pressable>
  );
}

function XyloBar({
  note,
  index,
  active,
  onPress,
  totalBars,
}: {
  note: string;
  index: number;
  active: boolean;
  onPress: () => void;
  totalBars: number;
}) {
  const scale = useSharedValue(1);
  const widthPct = 100 - (index * 6);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePress = () => {
    scale.value = withSequence(withSpring(0.9), withSpring(1));
    onPress();
  };

  return (
    <Pressable onPress={handlePress} style={{ alignItems: 'center' }}>
      <Animated.View
        style={[
          styles.xyloBar,
          {
            width: `${widthPct}%`,
            backgroundColor: XYLO_COLORS[index],
          },
          active && styles.xyloBarHighlight,
          animatedStyle,
        ]}
      >
        <Text style={styles.xyloLabel}>{note.replace('4', '').replace('5', '')}</Text>
      </Animated.View>
    </Pressable>
  );
}

function DrumPad({
  pad,
  active,
  onPress,
}: {
  pad: typeof DRUM_PADS[0];
  active: boolean;
  onPress: () => void;
}) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePress = () => {
    scale.value = withSequence(withSpring(0.85), withSpring(1));
    onPress();
  };

  return (
    <Pressable onPress={handlePress}>
      <Animated.View
        style={[
          styles.drumPad,
          { backgroundColor: pad.color },
          active && styles.drumPadHighlight,
          animatedStyle,
        ]}
      >
        <Text style={styles.drumLabel}>{pad.label}</Text>
      </Animated.View>
    </Pressable>
  );
}

export function MusicalInstrumentsScreen({ navigation }: Props) {
  const { dispatch } = useApp();
  const [instrument, setInstrument] = useState<Instrument>('piano');
  const [playMode, setPlayMode] = useState<PlayMode>('free');
  const [showCelebration, setShowCelebration] = useState(false);
  const [tapCount, setTapCount] = useState(0);
  const [earnedFreePlay, setEarnedFreePlay] = useState(false);

  // Follow-along state
  const [pattern, setPattern] = useState<number[]>([]);
  const [showingPattern, setShowingPattern] = useState(false);
  const [highlightIndex, setHighlightIndex] = useState(-1);
  const [playerInput, setPlayerInput] = useState<number[]>([]);
  const [patternsCompleted, setPatternsCompleted] = useState(0);
  const showingRef = useRef(false);

  useEffect(() => {
    return () => {
      ToneGenerator.cleanup();
    };
  }, []);

  useEffect(() => {
    if (playMode === 'follow') {
      startNewPattern();
    }
  }, [playMode, instrument]);

  const startNewPattern = useCallback(() => {
    const newPattern = generatePattern(instrument);
    setPattern(newPattern);
    setPlayerInput([]);
    setHighlightIndex(-1);

    // Show pattern with delay
    setTimeout(() => {
      showingRef.current = true;
      setShowingPattern(true);
      newPattern.forEach((noteIdx, i) => {
        setTimeout(() => {
          setHighlightIndex(noteIdx);
          playNoteForIndex(noteIdx);
          setTimeout(() => setHighlightIndex(-1), 300);
          if (i === newPattern.length - 1) {
            setTimeout(() => {
              showingRef.current = false;
              setShowingPattern(false);
            }, 400);
          }
        }, i * 600);
      });
    }, 500);
  }, [instrument]);

  const playNoteForIndex = async (index: number) => {
    if (instrument === 'drums') {
      SoundManager.playSFX(DRUM_PADS[index].sfx);
    } else {
      const notes = instrument === 'piano' ? PIANO_NOTES : XYLO_NOTES;
      await ToneGenerator.playNote(notes[index]);
    }
  };

  const handleNotePress = async (index: number) => {
    HapticFeedback.tap();

    // Play the sound
    await playNoteForIndex(index);

    // Track taps for free play sticker
    const newTapCount = tapCount + 1;
    setTapCount(newTapCount);
    if (newTapCount >= 20 && !earnedFreePlay) {
      setEarnedFreePlay(true);
      dispatch({ type: 'EARN_STICKER', stickerId: 'instruments-1' });
    }

    // Follow-along mode
    if (playMode === 'follow' && !showingRef.current) {
      const newInput = [...playerInput, index];
      setPlayerInput(newInput);

      const inputIdx = newInput.length - 1;
      if (newInput[inputIdx] !== pattern[inputIdx]) {
        // Wrong note
        SoundManager.playSFX('boing');
        HapticFeedback.elementReact();
        setTimeout(() => startNewPattern(), 600);
        return;
      }

      if (newInput.length === pattern.length) {
        // Pattern complete!
        SoundManager.playSFX('success');
        HapticFeedback.success();
        const completed = patternsCompleted + 1;
        setPatternsCompleted(completed);

        if (completed >= 3) {
          dispatch({ type: 'EARN_STICKER', stickerId: 'instruments-2' });
          SoundManager.playSFX('celebration');
          HapticFeedback.celebrate();
          setShowCelebration(true);
        } else {
          setTimeout(() => startNewPattern(), 800);
        }
      }
    }
  };

  const renderInstrument = () => {
    switch (instrument) {
      case 'piano':
        return (
          <View style={styles.pianoContainer}>
            {PIANO_NOTES.map((note, i) => (
              <PianoKey
                key={note}
                note={note}
                index={i}
                active={highlightIndex === i}
                onPress={() => handleNotePress(i)}
              />
            ))}
          </View>
        );
      case 'xylophone':
        return (
          <View style={styles.xyloContainer}>
            {XYLO_NOTES.map((note, i) => (
              <XyloBar
                key={note}
                note={note}
                index={i}
                active={highlightIndex === i}
                onPress={() => handleNotePress(i)}
                totalBars={XYLO_NOTES.length}
              />
            ))}
          </View>
        );
      case 'drums':
        return (
          <View style={styles.drumsContainer}>
            {DRUM_PADS.map((pad, i) => (
              <DrumPad
                key={pad.id}
                pad={pad}
                active={highlightIndex === i}
                onPress={() => handleNotePress(i)}
              />
            ))}
          </View>
        );
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar hidden />
      <LinearGradient colors={['#A29BFE', '#6C5CE7']} style={StyleSheet.absoluteFill} />

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
        <Text style={styles.titleEmoji}>🎹</Text>
      </View>

      {/* Instrument selector */}
      <View style={styles.instrumentRow}>
        {([
          { key: 'piano' as Instrument, icon: '🎹' },
          { key: 'xylophone' as Instrument, icon: '🎵' },
          { key: 'drums' as Instrument, icon: '🥁' },
        ]).map((inst) => (
          <Pressable
            key={inst.key}
            style={[styles.instButton, instrument === inst.key && styles.instButtonActive]}
            onPress={() => {
              setInstrument(inst.key);
              HapticFeedback.tap();
              SoundManager.playSFX('pop');
            }}
          >
            <Text style={styles.instEmoji}>{inst.icon}</Text>
          </Pressable>
        ))}
      </View>

      {/* Mode selector */}
      <View style={styles.modeRow}>
        {([
          { key: 'free' as PlayMode, label: '🎶 Free' },
          { key: 'follow' as PlayMode, label: '🎯 Follow' },
        ]).map((m) => (
          <Pressable
            key={m.key}
            style={[styles.modeButton, playMode === m.key && styles.modeButtonActive]}
            onPress={() => {
              setPlayMode(m.key);
              HapticFeedback.tap();
            }}
          >
            <Text style={[styles.modeText, playMode === m.key && styles.modeTextActive]}>
              {m.label}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Status for follow mode */}
      {playMode === 'follow' && (
        <View style={styles.followStatus}>
          {showingPattern ? (
            <Text style={styles.followText}>👀 Watch the pattern...</Text>
          ) : (
            <Text style={styles.followText}>
              🎯 Your turn! ({playerInput.length}/{pattern.length})
            </Text>
          )}
          <Text style={styles.followScore}>
            {patternsCompleted} / 3 ⭐
          </Text>
        </View>
      )}

      {/* Instrument area */}
      <View style={styles.instrumentArea}>
        {renderInstrument()}
      </View>

      <CelebrationOverlay
        visible={showCelebration}
        onComplete={() => {
          setShowCelebration(false);
          setPatternsCompleted(0);
          startNewPattern();
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
  titleEmoji: { fontSize: 44 },
  instrumentRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    marginTop: 10,
  },
  instButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  instButtonActive: {
    backgroundColor: 'rgba(255,255,255,0.5)',
    borderWidth: 2,
    borderColor: '#fff',
  },
  instEmoji: { fontSize: 26 },
  modeRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    marginTop: 10,
  },
  modeButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  modeButtonActive: {
    backgroundColor: 'rgba(255,255,255,0.5)',
    borderWidth: 2,
    borderColor: '#fff',
  },
  modeText: { fontSize: 16, fontWeight: '700', color: 'rgba(255,255,255,0.7)' },
  modeTextActive: { color: '#fff' },
  followStatus: {
    alignItems: 'center',
    marginTop: 10,
  },
  followText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
  },
  followScore: {
    fontSize: 16,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.8)',
    marginTop: 4,
  },
  instrumentArea: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingBottom: 30,
  },
  // Piano
  pianoContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-end',
    gap: 4,
    height: SCREEN_H * 0.35,
  },
  pianoKeyWrapper: {
    flex: 1,
    maxWidth: (SCREEN_W - 60) / 8,
  },
  pianoKey: {
    height: '100%',
    borderRadius: 8,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    backgroundColor: '#fff',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 3,
  },
  pianoKeyHighlight: {
    backgroundColor: Colors.yellow,
  },
  pianoKeyLabel: {
    fontSize: 14,
    fontWeight: '800',
    color: '#666',
  },
  // Xylophone
  xyloContainer: {
    gap: 6,
    paddingHorizontal: 10,
  },
  xyloBar: {
    height: 40,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  xyloBarHighlight: {
    borderWidth: 3,
    borderColor: '#fff',
  },
  xyloLabel: {
    fontSize: 14,
    fontWeight: '800',
    color: '#fff',
  },
  // Drums
  drumsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 16,
  },
  drumPad: {
    width: (SCREEN_W - 80) / 2,
    height: (SCREEN_W - 80) / 2,
    borderRadius: (SCREEN_W - 80) / 4,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 5,
  },
  drumPadHighlight: {
    borderWidth: 4,
    borderColor: '#fff',
  },
  drumLabel: { fontSize: 48 },
});
