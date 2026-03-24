import React, { useEffect, useState } from 'react';
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
import { Colors, getTimeTheme, TimeThemeConfig } from '../utils/colors';
import { HapticFeedback } from '../utils/haptics';
import { SoundManager } from '../utils/SoundManager';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');
const ICON_SIZE = Math.min(90, (SCREEN_W - 80) / 3);

interface Props {
  navigation: any;
}

const MENU_BUTTONS = [
  { emoji: '🎤', color: Colors.red, screen: 'SongSelect' },
  { emoji: '🎨', color: Colors.yellow, screen: 'Coloring' },
  { emoji: '🐾', color: Colors.green, screen: 'Animals' },
  { emoji: '🔤', color: Colors.blue, screen: 'ABCLetters' },
  { emoji: '🔢', color: Colors.orange, screen: 'Numbers' },
  { emoji: '🔷', color: Colors.cyan, screen: 'ShapeMatching' },
  { emoji: '🃏', color: Colors.pink, screen: 'MemoryGame' },
  { emoji: '🎹', color: Colors.purple, screen: 'MusicalInstruments' },
  { emoji: '⭐', color: Colors.yellow, screen: 'StickerBook' },
];

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

  const theme = getTimeTheme();
  const themeConfig = TimeThemeConfig[theme];

  const emojiPositions = [
    { x: SCREEN_W * 0.1, y: SCREEN_H * 0.08, delay: 0 },
    { x: SCREEN_W * 0.8, y: SCREEN_H * 0.06, delay: 300 },
    { x: SCREEN_W * 0.5, y: SCREEN_H * 0.12, delay: 600 },
    { x: SCREEN_W * 0.3, y: SCREEN_H * 0.18, delay: 200 },
    { x: SCREEN_W * 0.7, y: SCREEN_H * 0.16, delay: 500 },
    { x: SCREEN_W * 0.15, y: SCREEN_H * 0.22, delay: 400 },
  ];

  const bgEmojis = emojiPositions.map((pos, i) => ({
    ...pos,
    emoji: themeConfig.emojis[i],
  }));

  return (
    <View style={styles.container}>
      <StatusBar hidden />
      <LinearGradient
        colors={themeConfig.gradient}
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

        {/* Activity buttons — 3x3 grid */}
        <ScrollView
          contentContainerStyle={styles.gridContainer}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.buttonGrid}>
            {MENU_BUTTONS.map((btn) => (
              <AnimatedIcon
                key={btn.screen}
                emoji={btn.emoji}
                size={ICON_SIZE}
                color={btn.color}
                onPress={() => navigation.navigate(btn.screen)}
              />
            ))}
          </View>
        </ScrollView>
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
    alignItems: 'center',
    paddingTop: 40,
  },
  mascotContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  mascot: {
    fontSize: 60,
  },
  subtitle: {
    fontSize: 24,
    marginTop: 4,
  },
  gridContainer: {
    alignItems: 'center',
    paddingBottom: 40,
  },
  buttonGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 16,
    maxWidth: ICON_SIZE * 3 + 16 * 2 + 40,
    paddingHorizontal: 20,
  },
  floatingEmoji: {
    position: 'absolute',
    fontSize: 30,
    zIndex: 1,
  },
});
