import React, { useEffect } from 'react';
import { View, StyleSheet, Dimensions, Text } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  withDelay,
  withSpring,
  Easing,
  runOnJS,
} from 'react-native-reanimated';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');

interface Props {
  visible: boolean;
  onComplete: () => void;
}

const CONFETTI = ['🎉', '⭐', '🌟', '💛', '💜', '🎊', '💙', '🧡', '✨', '🎶'];

function ConfettiPiece({ emoji, index }: { emoji: string; index: number }) {
  const translateY = useSharedValue(-50);
  const translateX = useSharedValue(0);
  const rotate = useSharedValue(0);
  const opacity = useSharedValue(0);

  const startX = Math.random() * SCREEN_W;

  useEffect(() => {
    const delay = index * 60;
    opacity.value = withDelay(delay, withTiming(1, { duration: 100 }));
    translateY.value = withDelay(
      delay,
      withTiming(SCREEN_H + 50, { duration: 1800 + Math.random() * 600 })
    );
    translateX.value = withDelay(
      delay,
      withTiming((Math.random() - 0.5) * 200, { duration: 1800 })
    );
    rotate.value = withDelay(
      delay,
      withTiming(360 * (Math.random() > 0.5 ? 1 : -1), { duration: 1800 })
    );
  }, []);

  const style = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [
      { translateY: translateY.value },
      { translateX: translateX.value },
      { rotate: `${rotate.value}deg` },
    ],
  }));

  return (
    <Animated.Text
      style={[styles.confetti, { left: startX, fontSize: 24 + Math.random() * 16 }, style]}
    >
      {emoji}
    </Animated.Text>
  );
}

export function CelebrationOverlay({ visible, onComplete }: Props) {
  const flashOpacity = useSharedValue(0);
  const textScale = useSharedValue(0);
  const textOpacity = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      // Flash
      flashOpacity.value = withSequence(
        withTiming(0.7, { duration: 50 }),
        withTiming(0, { duration: 200 })
      );

      // "YAY!" text
      textScale.value = withDelay(
        100,
        withSpring(1, { damping: 6, stiffness: 200 })
      );
      textOpacity.value = withDelay(100, withTiming(1, { duration: 150 }));

      // Fade out text
      textOpacity.value = withDelay(
        1200,
        withTiming(0, { duration: 300 }, () => {
          runOnJS(onComplete)();
        })
      );
      textScale.value = withDelay(1200, withTiming(1.5, { duration: 300 }));
    } else {
      flashOpacity.value = 0;
      textScale.value = 0;
      textOpacity.value = 0;
    }
  }, [visible]);

  const flashStyle = useAnimatedStyle(() => ({
    opacity: flashOpacity.value,
  }));

  const textStyle = useAnimatedStyle(() => ({
    opacity: textOpacity.value,
    transform: [{ scale: textScale.value }],
  }));

  if (!visible) return null;

  return (
    <View style={styles.container} pointerEvents="none">
      {/* White flash */}
      <Animated.View style={[styles.flash, flashStyle]} />

      {/* Confetti */}
      {CONFETTI.map((emoji, i) =>
        Array.from({ length: 3 }).map((_, j) => (
          <ConfettiPiece key={`${i}-${j}`} emoji={emoji} index={i * 3 + j} />
        ))
      )}

      {/* YAY text */}
      <Animated.View style={[styles.textContainer, textStyle]}>
        <Text style={styles.yayText}>YAY!</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 2000,
  },
  flash: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#FFFFFF',
  },
  confetti: {
    position: 'absolute',
    top: 0,
  },
  textContainer: {
    position: 'absolute',
    top: SCREEN_H * 0.35,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  yayText: {
    fontSize: 80,
    fontWeight: '900',
    color: '#FFC312',
    textShadowColor: '#FF6348',
    textShadowOffset: { width: 3, height: 3 },
    textShadowRadius: 0,
  },
});
