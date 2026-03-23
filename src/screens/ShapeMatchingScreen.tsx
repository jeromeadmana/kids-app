import React, { useState, useCallback } from 'react';
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
  runOnJS,
  FadeInDown,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { LinearGradient } from 'expo-linear-gradient';
import { useApp } from '../context/AppContext';
import { Colors } from '../utils/colors';
import { HapticFeedback } from '../utils/haptics';
import { SoundManager } from '../utils/SoundManager';
import { CelebrationOverlay } from '../components/CelebrationOverlay';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');

interface Props {
  navigation: any;
}

interface Shape {
  id: string;
  type: 'circle' | 'square' | 'triangle' | 'star' | 'heart' | 'diamond';
  color: string;
  emoji: string;
}

const LEVEL_1_SHAPES: Shape[] = [
  { id: 'circle', type: 'circle', color: Colors.red, emoji: '🔴' },
  { id: 'square', type: 'square', color: Colors.blue, emoji: '🟦' },
  { id: 'triangle', type: 'triangle', color: Colors.green, emoji: '🔺' },
];

const LEVEL_2_SHAPES: Shape[] = [
  ...LEVEL_1_SHAPES,
  { id: 'star', type: 'star', color: Colors.yellow, emoji: '⭐' },
  { id: 'heart', type: 'heart', color: Colors.pink, emoji: '❤️' },
  { id: 'diamond', type: 'diamond', color: Colors.purple, emoji: '💎' },
];

function ShapeHole({ shape, filled, size }: { shape: Shape; filled: boolean; size: number }) {
  return (
    <View
      style={[
        styles.hole,
        {
          width: size,
          height: size,
          borderColor: filled ? shape.color : 'rgba(255,255,255,0.5)',
          backgroundColor: filled ? `${shape.color}33` : 'rgba(255,255,255,0.1)',
        },
        shape.type === 'circle' && { borderRadius: size / 2 },
        shape.type === 'diamond' && { transform: [{ rotate: '45deg' }] },
      ]}
    >
      <Text style={[styles.holeEmoji, { fontSize: size * 0.5 }]}>
        {filled ? shape.emoji : ''}
      </Text>
    </View>
  );
}

function DraggableShape({
  shape,
  size,
  selected,
  placed,
  onTap,
}: {
  shape: Shape;
  size: number;
  selected: boolean;
  placed: boolean;
  onTap: () => void;
}) {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const scale = useSharedValue(1);

  if (placed) return <View style={{ width: size, height: size, margin: 8 }} />;

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
    ],
  }));

  const handleTap = () => {
    scale.value = withSequence(withSpring(0.85), withSpring(1));
    onTap();
  };

  return (
    <Pressable onPress={handleTap}>
      <Animated.View
        style={[
          styles.shapeSource,
          {
            width: size,
            height: size,
            backgroundColor: shape.color,
          },
          shape.type === 'circle' && { borderRadius: size / 2 },
          shape.type === 'diamond' && { transform: [{ rotate: '45deg' }] },
          selected && styles.shapeSelected,
          animatedStyle,
        ]}
      >
        <Text style={[
          styles.shapeEmoji,
          { fontSize: size * 0.45 },
          shape.type === 'diamond' && { transform: [{ rotate: '-45deg' }] },
        ]}>
          {shape.emoji}
        </Text>
      </Animated.View>
    </Pressable>
  );
}

export function ShapeMatchingScreen({ navigation }: Props) {
  const { dispatch } = useApp();
  const [level, setLevel] = useState(1);
  const [selectedShape, setSelectedShape] = useState<string | null>(null);
  const [placedShapes, setPlacedShapes] = useState<Set<string>>(new Set());
  const [showCelebration, setShowCelebration] = useState(false);

  const shapes = level === 1 ? LEVEL_1_SHAPES : LEVEL_2_SHAPES;
  const holeSize = Math.min((SCREEN_W - 60) / shapes.length - 12, 80);
  const sourceSize = Math.min((SCREEN_W - 60) / shapes.length - 12, 72);

  const handleShapeTap = (shapeId: string) => {
    SoundManager.playSFX('tap');
    HapticFeedback.tap();
    setSelectedShape(shapeId);
  };

  const handleHoleTap = (holeId: string) => {
    if (!selectedShape) return;

    if (selectedShape === holeId) {
      // Correct placement!
      SoundManager.playSFX('sparkle');
      HapticFeedback.success();
      const newPlaced = new Set(placedShapes);
      newPlaced.add(holeId);
      setPlacedShapes(newPlaced);
      setSelectedShape(null);

      // Check level complete
      if (newPlaced.size === shapes.length) {
        setTimeout(() => {
          if (level === 1) {
            SoundManager.playSFX('success');
            HapticFeedback.celebrate();
            dispatch({ type: 'EARN_STICKER', stickerId: 'shapes-1' });
            setShowCelebration(true);
          } else {
            SoundManager.playSFX('celebration');
            HapticFeedback.celebrate();
            dispatch({ type: 'EARN_STICKER', stickerId: 'shapes-2' });
            setShowCelebration(true);
          }
        }, 300);
      }
    } else {
      // Wrong hole
      SoundManager.playSFX('boing');
      HapticFeedback.elementReact();
      setSelectedShape(null);
    }
  };

  const advanceLevel = () => {
    if (level === 1) {
      setLevel(2);
      setPlacedShapes(new Set());
      setSelectedShape(null);
    } else {
      // Reset level 2
      setPlacedShapes(new Set());
      setSelectedShape(null);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar hidden />
      <LinearGradient colors={['#55E6C1', '#1ABC9C']} style={StyleSheet.absoluteFill} />

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

      {/* Title + level indicator */}
      <View style={styles.titleArea}>
        <Text style={styles.titleEmoji}>🔷</Text>
        <View style={styles.levelRow}>
          <Text style={styles.levelText}>
            {level === 1 ? '⭐' : '⭐⭐'}
          </Text>
        </View>
      </View>

      {/* Instruction */}
      <Text style={styles.instruction}>
        {selectedShape ? '👆 Tap the matching hole!' : '👇 Tap a shape first!'}
      </Text>

      {/* Holes (targets) */}
      <View style={styles.holesArea}>
        {shapes.map((shape) => (
          <Pressable
            key={`hole-${shape.id}`}
            onPress={() => handleHoleTap(shape.id)}
          >
            <ShapeHole
              shape={shape}
              filled={placedShapes.has(shape.id)}
              size={holeSize}
            />
          </Pressable>
        ))}
      </View>

      {/* Divider */}
      <View style={styles.divider}>
        <Text style={styles.dividerText}>▼ ▼ ▼</Text>
      </View>

      {/* Source shapes (draggable) */}
      <View style={styles.sourcesArea}>
        {[...shapes].sort(() => 0.5 - Math.random()).map((shape) => (
          <DraggableShape
            key={`src-${shape.id}`}
            shape={shape}
            size={sourceSize}
            selected={selectedShape === shape.id}
            placed={placedShapes.has(shape.id)}
            onTap={() => handleShapeTap(shape.id)}
          />
        ))}
      </View>

      {/* Progress */}
      <View style={styles.progressArea}>
        <Text style={styles.progressText}>
          {placedShapes.size} / {shapes.length}
        </Text>
      </View>

      <CelebrationOverlay
        visible={showCelebration}
        onComplete={() => {
          setShowCelebration(false);
          advanceLevel();
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
  titleArea: {
    alignItems: 'center',
    paddingTop: 24,
  },
  titleEmoji: { fontSize: 44 },
  levelRow: {
    flexDirection: 'row',
    marginTop: 4,
  },
  levelText: { fontSize: 20 },
  instruction: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
    textAlign: 'center',
    marginTop: 12,
    marginBottom: 8,
  },
  holesArea: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    paddingHorizontal: 20,
    marginTop: 12,
    minHeight: 100,
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  hole: {
    borderWidth: 3,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    margin: 4,
  },
  holeEmoji: { fontSize: 32 },
  divider: {
    alignItems: 'center',
    marginVertical: 20,
  },
  dividerText: {
    fontSize: 20,
    color: 'rgba(255,255,255,0.5)',
  },
  sourcesArea: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    paddingHorizontal: 20,
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  shapeSource: {
    justifyContent: 'center',
    alignItems: 'center',
    margin: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  shapeSelected: {
    borderWidth: 3,
    borderColor: '#fff',
    shadowOpacity: 0.5,
    shadowRadius: 8,
  },
  shapeEmoji: { fontSize: 28 },
  progressArea: {
    alignItems: 'center',
    marginTop: 20,
  },
  progressText: {
    fontSize: 22,
    fontWeight: '800',
    color: '#fff',
  },
});
