import React, { useEffect } from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  withSpring,
  Easing,
} from 'react-native-reanimated';
import { HapticFeedback } from '../utils/haptics';

interface Props {
  emoji: string;
  size?: number;
  color?: string;
  onPress: () => void;
  pulseAnimation?: boolean;
  label?: string;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function AnimatedIcon({
  emoji,
  size = 80,
  color = '#FFC312',
  onPress,
  pulseAnimation = true,
}: Props) {
  const scale = useSharedValue(1);
  const rotate = useSharedValue(0);

  useEffect(() => {
    if (pulseAnimation) {
      // Gentle idle bounce to invite interaction
      scale.value = withRepeat(
        withSequence(
          withTiming(1.08, { duration: 800, easing: Easing.inOut(Easing.ease) }),
          withTiming(1, { duration: 800, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        true
      );

      // Subtle wobble
      rotate.value = withRepeat(
        withSequence(
          withTiming(3, { duration: 600 }),
          withTiming(-3, { duration: 600 }),
          withTiming(0, { duration: 400 })
        ),
        -1
      );
    }
  }, [pulseAnimation]);

  const animStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value },
      { rotate: `${rotate.value}deg` },
    ],
  }));

  const handlePress = () => {
    // Tap reaction: quick squish then bounce back
    scale.value = withSequence(
      withTiming(0.85, { duration: 80 }),
      withSpring(1.15, { damping: 4, stiffness: 300 }),
      withSpring(1, { damping: 8 })
    );

    HapticFeedback.tap();
    onPress();
  };

  return (
    <AnimatedPressable
      onPress={handlePress}
      style={[
        styles.container,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: color,
        },
        animStyle,
      ]}
    >
      <Text style={[styles.emoji, { fontSize: size * 0.5 }]}>{emoji}</Text>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  emoji: {
    textAlign: 'center',
  },
});
