import React from 'react';
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
  FadeInDown,
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { useApp } from '../context/AppContext';
import { Colors } from '../utils/colors';
import { HapticFeedback } from '../utils/haptics';

const { width: SCREEN_W } = Dimensions.get('window');
const STICKER_SIZE = (SCREEN_W - 80) / 4;

interface Props {
  navigation: any;
}

const STICKER_DISPLAY: Record<string, string> = {
  'star-1': '⭐',
  'star-2': '🌟',
  'rocket-1': '🚀',
  'moon-1': '🌙',
  'fish-1': '🐠',
  'whale-1': '🐋',
  'shell-1': '🐚',
  'crab-1': '🦀',
  'flower-1': '🌸',
  'tree-1': '🌳',
  'sun-1': '☀️',
  'butterfly-1': '🦋',
  'cat-1': '🐱',
  'dog-1': '🐶',
  'bird-1': '🐦',
  'bunny-1': '🐰',
};

const THEME_LABELS: Record<string, string> = {
  space: '🚀',
  ocean: '🌊',
  garden: '🌸',
  animals: '🐾',
};

function StickerItem({
  stickerId,
  earned,
  index,
}: {
  stickerId: string;
  earned: boolean;
  index: number;
}) {
  const emoji = STICKER_DISPLAY[stickerId] || '❓';

  return (
    <Animated.View
      entering={FadeInDown.delay(index * 50).springify()}
      style={[
        styles.stickerSlot,
        earned && styles.stickerSlotEarned,
      ]}
    >
      <Text
        style={[
          styles.stickerEmoji,
          !earned && styles.stickerLocked,
        ]}
      >
        {earned ? emoji : '❓'}
      </Text>
      {earned && <Text style={styles.stickerGlow}>✨</Text>}
    </Animated.View>
  );
}

export function StickerBookScreen({ navigation }: Props) {
  const { state } = useApp();
  const earnedCount = state.stickers.filter((s) => s.earned).length;
  const totalCount = state.stickers.length;

  // Group stickers by theme
  const themes = ['space', 'ocean', 'garden', 'animals'] as const;

  return (
    <View style={styles.container}>
      <StatusBar hidden />
      <LinearGradient
        colors={['#A29BFE', '#6C5CE7']}
        style={StyleSheet.absoluteFill}
      />

      {/* Home button */}
      <Pressable
        style={styles.homeButton}
        onPress={() => {
          HapticFeedback.tap();
          navigation.goBack();
        }}
      >
        <Text style={styles.homeEmoji}>🏠</Text>
      </Pressable>

      {/* Title — star icon */}
      <View style={styles.titleArea}>
        <Text style={styles.titleEmoji}>⭐</Text>
        {/* Progress: show filled stars */}
        <View style={styles.progressStars}>
          {Array.from({ length: totalCount }).map((_, i) => (
            <Text key={i} style={styles.progressStar}>
              {i < earnedCount ? '⭐' : '☆'}
            </Text>
          ))}
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {themes.map((theme) => {
          const themeStickers = state.stickers.filter((s) => s.theme === theme);

          return (
            <View key={theme} style={styles.themeSection}>
              <Text style={styles.themeLabel}>{THEME_LABELS[theme]}</Text>
              <View style={styles.stickerRow}>
                {themeStickers.map((sticker, index) => (
                  <StickerItem
                    key={sticker.id}
                    stickerId={sticker.id}
                    earned={sticker.earned}
                    index={index}
                  />
                ))}
              </View>
            </View>
          );
        })}
      </ScrollView>
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
    paddingBottom: 10,
  },
  titleEmoji: {
    fontSize: 50,
  },
  progressStars: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginTop: 8,
    gap: 2,
  },
  progressStar: {
    fontSize: 12,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  themeSection: {
    marginBottom: 24,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 20,
    padding: 16,
  },
  themeLabel: {
    fontSize: 32,
    textAlign: 'center',
    marginBottom: 12,
  },
  stickerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    flexWrap: 'wrap',
  },
  stickerSlot: {
    width: STICKER_SIZE,
    height: STICKER_SIZE,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
    borderStyle: 'dashed',
  },
  stickerSlotEarned: {
    backgroundColor: 'rgba(255,255,255,0.4)',
    borderStyle: 'solid',
    borderColor: Colors.yellow,
  },
  stickerEmoji: {
    fontSize: STICKER_SIZE * 0.5,
  },
  stickerLocked: {
    opacity: 0.5,
  },
  stickerGlow: {
    position: 'absolute',
    top: -4,
    right: -4,
    fontSize: 14,
  },
});
