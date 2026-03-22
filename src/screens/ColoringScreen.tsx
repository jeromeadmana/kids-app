import React, { useState } from 'react';
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
  withSequence,
  withTiming,
  withSpring,
  FadeInDown,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../utils/colors';
import { HapticFeedback } from '../utils/haptics';
import { SoundManager } from '../utils/SoundManager';
import { CelebrationOverlay } from '../components/CelebrationOverlay';
import { useApp } from '../context/AppContext';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');

const COLOR_PALETTE = [
  { color: '#FF4757', name: 'red' },
  { color: '#3742FA', name: 'blue' },
  { color: '#FFC312', name: 'yellow' },
  { color: '#2ED573', name: 'green' },
  { color: '#FF6348', name: 'orange' },
  { color: '#A855F7', name: 'purple' },
  { color: '#FF6B9D', name: 'pink' },
  { color: '#00D2D3', name: 'cyan' },
];

const COLORING_PICTURES = [
  {
    id: 'fish',
    emoji: '🐟',
    parts: ['body', 'tail', 'fin', 'eye'],
    stickerId: 'fish-1',
  },
  {
    id: 'flower',
    emoji: '🌸',
    parts: ['petal1', 'petal2', 'petal3', 'center'],
    stickerId: 'flower-1',
  },
  {
    id: 'star',
    emoji: '⭐',
    parts: ['point1', 'point2', 'point3', 'center'],
    stickerId: 'star-2',
  },
  {
    id: 'butterfly',
    emoji: '🦋',
    parts: ['wingL', 'wingR', 'body', 'antenna'],
    stickerId: 'butterfly-1',
  },
];

interface PartProps {
  index: number;
  filledColor: string | null;
  selectedColor: string;
  onFill: () => void;
  position: { x: number; y: number };
}

function ColorPart({ index, filledColor, selectedColor, onFill, position }: PartProps) {
  const scale = useSharedValue(1);

  const handlePress = () => {
    scale.value = withSequence(
      withTiming(1.3, { duration: 100 }),
      withSpring(1, { damping: 6 })
    );
    HapticFeedback.elementReact();
    SoundManager.playSFX('sparkle');
    onFill();
  };

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View style={animStyle}>
      <Pressable
        onPress={handlePress}
        style={[
          styles.colorPart,
          {
            backgroundColor: filledColor || 'rgba(255,255,255,0.3)',
            borderColor: filledColor ? filledColor : 'rgba(255,255,255,0.6)',
            left: position.x,
            top: position.y,
          },
        ]}
      >
        {!filledColor && (
          <Text style={styles.partHint}>✨</Text>
        )}
      </Pressable>
    </Animated.View>
  );
}

export function ColoringScreen({ navigation }: { navigation: any }) {
  const [selectedColor, setSelectedColor] = useState(COLOR_PALETTE[0].color);
  const [currentPicIndex, setCurrentPicIndex] = useState(0);
  const [filledParts, setFilledParts] = useState<Record<string, string>>({});
  const [showCelebration, setShowCelebration] = useState(false);
  const { dispatch } = useApp();

  const currentPic = COLORING_PICTURES[currentPicIndex];
  const allFilled = currentPic.parts.every((p) => filledParts[p]);

  const partPositions = [
    { x: -40, y: -40 },
    { x: 40, y: -40 },
    { x: -40, y: 40 },
    { x: 40, y: 40 },
  ];

  const fillPart = (partName: string) => {
    const newFilled = { ...filledParts, [partName]: selectedColor };
    setFilledParts(newFilled);

    const nowAllFilled = currentPic.parts.every((p) => newFilled[p]);
    if (nowAllFilled) {
      SoundManager.playSFX('celebration');
      HapticFeedback.celebrate();
      dispatch({ type: 'EARN_STICKER', stickerId: currentPic.stickerId });
      setShowCelebration(true);
    }
  };

  const nextPicture = () => {
    setShowCelebration(false);
    setFilledParts({});
    setCurrentPicIndex((i) => (i + 1) % COLORING_PICTURES.length);
  };

  return (
    <View style={styles.container}>
      <StatusBar hidden />
      <LinearGradient
        colors={['#FD79A8', '#E17055']}
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
        <Text style={styles.titleEmoji}>🎨</Text>
      </View>

      {/* Canvas area */}
      <View style={styles.canvasArea}>
        {/* Main emoji */}
        <Text style={styles.mainEmoji}>{currentPic.emoji}</Text>

        {/* Colorable parts around the emoji */}
        <View style={styles.partsContainer}>
          {currentPic.parts.map((part, i) => (
            <ColorPart
              key={part}
              index={i}
              filledColor={filledParts[part] || null}
              selectedColor={selectedColor}
              onFill={() => fillPart(part)}
              position={partPositions[i]}
            />
          ))}
        </View>

        {/* Next button after completion */}
        {allFilled && !showCelebration && (
          <Pressable style={styles.nextButton} onPress={nextPicture}>
            <Text style={styles.nextEmoji}>➡️</Text>
          </Pressable>
        )}
      </View>

      {/* Color palette */}
      <Animated.View
        entering={FadeInDown.delay(200).springify()}
        style={styles.palette}
      >
        {COLOR_PALETTE.map((c) => (
          <Pressable
            key={c.name}
            onPress={() => {
              setSelectedColor(c.color);
              HapticFeedback.tap();
              SoundManager.playSFX('pop');
            }}
            style={[
              styles.colorButton,
              { backgroundColor: c.color },
              selectedColor === c.color && styles.colorButtonSelected,
            ]}
          />
        ))}
      </Animated.View>

      {/* Picture selector */}
      <Animated.View
        entering={FadeInDown.delay(300).springify()}
        style={styles.picSelector}
      >
        {COLORING_PICTURES.map((pic, i) => (
          <Pressable
            key={pic.id}
            onPress={() => {
              setCurrentPicIndex(i);
              setFilledParts({});
              HapticFeedback.tap();
              SoundManager.playSFX('chime');
            }}
            style={[
              styles.picButton,
              currentPicIndex === i && styles.picButtonActive,
            ]}
          >
            <Text style={styles.picEmoji}>{pic.emoji}</Text>
          </Pressable>
        ))}
      </Animated.View>

      <CelebrationOverlay
        visible={showCelebration}
        onComplete={nextPicture}
      />
    </View>
  );
}

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
  },
  titleEmoji: {
    fontSize: 50,
  },
  canvasArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mainEmoji: {
    fontSize: 120,
  },
  partsContainer: {
    position: 'absolute',
    width: 200,
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  colorPart: {
    position: 'absolute',
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 3,
    justifyContent: 'center',
    alignItems: 'center',
  },
  partHint: {
    fontSize: 20,
  },
  nextButton: {
    position: 'absolute',
    bottom: -60,
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  nextEmoji: {
    fontSize: 36,
  },
  palette: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 16,
    paddingHorizontal: 20,
    flexWrap: 'wrap',
  },
  colorButton: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.4)',
  },
  colorButtonSelected: {
    borderColor: '#FFFFFF',
    borderWidth: 4,
    transform: [{ scale: 1.15 }],
  },
  picSelector: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    paddingBottom: 30,
  },
  picButton: {
    width: 60,
    height: 60,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  picButtonActive: {
    backgroundColor: 'rgba(255,255,255,0.5)',
    borderWidth: 2,
    borderColor: '#FFF',
  },
  picEmoji: {
    fontSize: 30,
  },
});
