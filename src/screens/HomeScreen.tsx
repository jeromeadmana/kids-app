import React, { useEffect, useState } from 'react';
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
  withRepeat,
  withSequence,
  withTiming,
  Easing,
  withDelay,
  FadeIn,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { AnimatedIcon } from '../components/AnimatedIcon';
import { ParentalGate } from '../components/ParentalGate';
import { Colors } from '../utils/colors';
import { HapticFeedback } from '../utils/haptics';
import { SoundManager } from '../utils/SoundManager';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');

interface Props {
  navigation: any;
}

function FloatingEmoji({ emoji, delay, x, y }: { emoji: string; delay: number; x: number; y: number }) {
  const translateY = useSharedValue(0);
  const opacity = useSharedValue(0);

  useEffect(() => {
    opacity.value = withDelay(delay, withTiming(0.6, { duration: 500 }));
    translateY.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(-15, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
          withTiming(15, { duration: 2000, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        true
      )
    );
  }, []);

  const style = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <Animated.Text style={[styles.floatingEmoji, { left: x, top: y }, style]}>
      {emoji}
    </Animated.Text>
  );
}

export function HomeScreen({ navigation }: Props) {
  const [gateVisible, setGateVisible] = useState(false);

  const bgEmojis = [
    { emoji: '⭐', x: SCREEN_W * 0.1, y: SCREEN_H * 0.08, delay: 0 },
    { emoji: '🌙', x: SCREEN_W * 0.8, y: SCREEN_H * 0.06, delay: 300 },
    { emoji: '☁️', x: SCREEN_W * 0.5, y: SCREEN_H * 0.12, delay: 600 },
    { emoji: '✨', x: SCREEN_W * 0.3, y: SCREEN_H * 0.18, delay: 200 },
    { emoji: '💫', x: SCREEN_W * 0.7, y: SCREEN_H * 0.16, delay: 500 },
    { emoji: '🌟', x: SCREEN_W * 0.15, y: SCREEN_H * 0.22, delay: 400 },
  ];

  return (
    <View style={styles.container}>
      <StatusBar hidden />
      <LinearGradient
        colors={['#74B9FF', '#0984E3']}
        style={StyleSheet.absoluteFill}
      />

      {/* Floating background decorations */}
      {bgEmojis.map((e, i) => (
        <FloatingEmoji key={i} {...e} />
      ))}

      {/* Parent settings — tiny icon, top-right (40x40dp) */}
      <Pressable
        style={styles.parentTrigger}
        onPress={() => setGateVisible(true)}
      >
        <Text style={styles.parentTriggerText}>⚙️</Text>
      </Pressable>

      {/* Main content area */}
      <Animated.View
        entering={FadeIn.duration(600)}
        style={styles.mainContent}
      >
        {/* App mascot / title character */}
        <View style={styles.mascotContainer}>
          <Text style={styles.mascot}>🎵</Text>
          <Text style={styles.subtitle}>🎶 🎵 🎶</Text>
        </View>

        {/* Main action buttons — large touch targets */}
        <View style={styles.buttonGrid}>
          <AnimatedIcon
            emoji="🎤"
            size={110}
            color={Colors.red}
            onPress={() => navigation.navigate('SongSelect')}
          />
          <AnimatedIcon
            emoji="🎨"
            size={110}
            color={Colors.yellow}
            onPress={() => navigation.navigate('SongSelect')}
          />
        </View>

        <View style={styles.buttonGrid}>
          <AnimatedIcon
            emoji="⭐"
            size={110}
            color={Colors.purple}
            onPress={() => navigation.navigate('StickerBook')}
          />
          <AnimatedIcon
            emoji="🐾"
            size={110}
            color={Colors.green}
            onPress={() => navigation.navigate('SongSelect')}
          />
        </View>
      </Animated.View>

      {/* Parental Gate */}
      <ParentalGate
        visible={gateVisible}
        onSuccess={() => {
          setGateVisible(false);
          navigation.navigate('ParentDashboard');
        }}
        onCancel={() => setGateVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  parentTrigger: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
    opacity: 0.5,
  },
  parentTriggerText: {
    fontSize: 20,
  },
  mainContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 60,
  },
  mascotContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  mascot: {
    fontSize: 80,
  },
  subtitle: {
    fontSize: 30,
    marginTop: 8,
  },
  buttonGrid: {
    flexDirection: 'row',
    gap: 24,
    marginBottom: 24,
  },
  floatingEmoji: {
    position: 'absolute',
    fontSize: 30,
    zIndex: 1,
  },
});
