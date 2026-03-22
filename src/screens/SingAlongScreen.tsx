import React, { useEffect, useRef, useState, useCallback } from 'react';
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
  withSpring,
  withDelay,
  Easing,
  FadeIn,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { SONGS, BackgroundElement } from '../utils/songs';
import { Colors } from '../utils/colors';
import { HapticFeedback } from '../utils/haptics';
import { SoundManager, SFXName } from '../utils/SoundManager';
import { CelebrationOverlay } from '../components/CelebrationOverlay';
import { useApp } from '../context/AppContext';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');

interface Props {
  route: any;
  navigation: any;
}

/** A single reactive background element that responds to toddler taps */
function ReactiveElement({
  element,
  isPlaying,
}: {
  element: BackgroundElement;
  isPlaying: boolean;
}) {
  const scale = useSharedValue(1);
  const rotate = useSharedValue(0);
  const translateY = useSharedValue(0);
  const glowOpacity = useSharedValue(0);
  const [tapCount, setTapCount] = useState(0);

  // Idle animation — gentle pulse synced to beat feel
  useEffect(() => {
    if (isPlaying) {
      translateY.value = withRepeat(
        withSequence(
          withTiming(-8, { duration: 1200, easing: Easing.inOut(Easing.ease) }),
          withTiming(8, { duration: 1200, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        true
      );
    }
  }, [isPlaying]);

  const handleTap = () => {
    setTapCount((c) => c + 1);

    // Tap animation based on element type
    switch (element.tapAnimation) {
      case 'spin':
        rotate.value = withSequence(
          withTiming(360, { duration: 500 }),
          withTiming(0, { duration: 0 })
        );
        break;
      case 'bounce':
        scale.value = withSequence(
          withTiming(1.4, { duration: 100 }),
          withSpring(1, { damping: 4, stiffness: 300 })
        );
        break;
      case 'grow':
        scale.value = withSequence(
          withTiming(1.6, { duration: 200 }),
          withTiming(1, { duration: 400 })
        );
        break;
      case 'wiggle':
        rotate.value = withSequence(
          withTiming(15, { duration: 80 }),
          withTiming(-15, { duration: 80 }),
          withTiming(10, { duration: 80 }),
          withTiming(-10, { duration: 80 }),
          withTiming(0, { duration: 100 })
        );
        break;
      case 'float':
        translateY.value = withSequence(
          withTiming(-30, { duration: 300 }),
          withSpring(0, { damping: 6 })
        );
        break;
    }

    // Glow effect
    glowOpacity.value = withSequence(
      withTiming(1, { duration: 100 }),
      withTiming(0, { duration: 400 })
    );

    // Haptic + sound feedback
    HapticFeedback.elementReact();
    SoundManager.playSFX(element.tapSound as SFXName);
  };

  const animStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value },
      { rotate: `${rotate.value}deg` },
      { translateY: translateY.value },
    ],
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
  }));

  // Generous tap target: 1.5x visual size
  const tapTargetSize = element.size * 1.5;

  return (
    <Pressable
      onPress={handleTap}
      style={[
        styles.elementContainer,
        {
          left: element.position.x * SCREEN_W - tapTargetSize / 2,
          top: element.position.y * SCREEN_H - tapTargetSize / 2,
          width: tapTargetSize,
          height: tapTargetSize,
        },
      ]}
    >
      {/* Glow ring */}
      <Animated.View
        style={[
          styles.glow,
          {
            width: element.size * 1.8,
            height: element.size * 1.8,
            borderRadius: element.size,
          },
          glowStyle,
        ]}
      />

      {/* Element emoji */}
      <Animated.Text
        style={[
          styles.elementEmoji,
          { fontSize: element.size },
          animStyle,
        ]}
      >
        {element.emoji}
      </Animated.Text>

      {/* Tap count sparkle */}
      {tapCount > 0 && (
        <Animated.Text
          entering={FadeIn.duration(200)}
          style={styles.sparkle}
        >
          ✨
        </Animated.Text>
      )}
    </Pressable>
  );
}

/** Main character that dances during the song */
function DancingCharacter({ isPlaying }: { isPlaying: boolean }) {
  const rotate = useSharedValue(0);
  const translateY = useSharedValue(0);
  const scale = useSharedValue(0);

  useEffect(() => {
    // Entrance animation
    scale.value = withSpring(1, { damping: 6, stiffness: 150 });

    if (isPlaying) {
      // Dance: bounce + sway
      translateY.value = withRepeat(
        withSequence(
          withTiming(-20, { duration: 300 }),
          withTiming(0, { duration: 300 })
        ),
        -1
      );
      rotate.value = withRepeat(
        withSequence(
          withTiming(8, { duration: 400 }),
          withTiming(-8, { duration: 400 })
        ),
        -1,
        true
      );
    }
  }, [isPlaying]);

  const style = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value },
      { translateY: translateY.value },
      { rotate: `${rotate.value}deg` },
    ],
  }));

  return (
    <Animated.View style={[styles.character, style]}>
      <Text style={styles.characterEmoji}>🐻</Text>
    </Animated.View>
  );
}

/** Progress bar showing song progress */
function SongProgress({ progress }: { progress: number }) {
  return (
    <View style={styles.progressContainer}>
      <View style={styles.progressTrack}>
        <View
          style={[
            styles.progressFill,
            { width: `${Math.min(progress * 100, 100)}%` },
          ]}
        />
        <Text style={[styles.progressDot, { left: `${Math.min(progress * 100, 100)}%` }]}>
          🎵
        </Text>
      </View>
    </View>
  );
}

export function SingAlongScreen({ route, navigation }: Props) {
  const { songId } = route.params;
  const song = SONGS.find((s) => s.id === songId) || SONGS[0];
  const { dispatch } = useApp();

  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showCelebration, setShowCelebration] = useState(false);
  const progressInterval = useRef<ReturnType<typeof setInterval> | null>(null);

  const SONG_DURATION = 15000; // 15 seconds for demo

  const gradientColors = {
    space: ['#2C3E50', '#3742FA'] as const,
    animals: ['#00B894', '#2ED573'] as const,
    ocean: ['#00D2D3', '#0984E3'] as const,
    garden: ['#A855F7', '#6C5CE7'] as const,
  };

  const startSong = useCallback(() => {
    setIsPlaying(true);
    setProgress(0);
    HapticFeedback.tap();
    SoundManager.playSong(song.id);

    const startTime = Date.now();
    progressInterval.current = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const p = elapsed / SONG_DURATION;
      setProgress(p);

      if (p >= 1) {
        clearInterval(progressInterval.current!);
        SoundManager.stopSong();
        SoundManager.playSFX('celebration');
        setIsPlaying(false);
        setShowCelebration(true);
        HapticFeedback.celebrate();
        dispatch({ type: 'EARN_STICKER', stickerId: song.stickerId });
      }
    }, 50);
  }, [song]);

  useEffect(() => {
    // Auto-start after brief entrance delay
    const timer = setTimeout(startSong, 800);
    return () => {
      clearTimeout(timer);
      if (progressInterval.current) clearInterval(progressInterval.current!);
      SoundManager.stopSong();
    };
  }, []);

  const handleCelebrationComplete = () => {
    setShowCelebration(false);
    // Reset for replay
    setProgress(0);
  };

  return (
    <View style={styles.container}>
      <StatusBar hidden />
      <LinearGradient
        colors={[...gradientColors[song.theme]]}
        style={StyleSheet.absoluteFill}
      />

      {/* Home button */}
      <Pressable
        style={styles.homeButton}
        onPress={() => {
          if (progressInterval.current) clearInterval(progressInterval.current!);
          SoundManager.stopSong();
          HapticFeedback.tap();
          navigation.goBack();
        }}
      >
        <Text style={styles.homeEmoji}>🏠</Text>
      </Pressable>

      {/* Reactive background elements */}
      {song.backgroundElements.map((element) => (
        <ReactiveElement
          key={element.id}
          element={element}
          isPlaying={isPlaying}
        />
      ))}

      {/* Dancing character — center stage */}
      <DancingCharacter isPlaying={isPlaying} />

      {/* Play/replay button */}
      {!isPlaying && progress === 0 && (
        <Pressable style={styles.playButton} onPress={startSong}>
          <Text style={styles.playEmoji}>▶️</Text>
        </Pressable>
      )}

      {/* Replay button after song ends */}
      {!isPlaying && progress >= 1 && !showCelebration && (
        <Pressable style={styles.playButton} onPress={startSong}>
          <Text style={styles.playEmoji}>🔄</Text>
        </Pressable>
      )}

      {/* Song progress */}
      {isPlaying && <SongProgress progress={progress} />}

      {/* Celebration overlay */}
      <CelebrationOverlay
        visible={showCelebration}
        onComplete={handleCelebrationComplete}
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
  elementContainer: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  glow: {
    position: 'absolute',
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
  },
  elementEmoji: {
    textAlign: 'center',
  },
  sparkle: {
    position: 'absolute',
    top: -5,
    right: -5,
    fontSize: 16,
  },
  character: {
    position: 'absolute',
    bottom: SCREEN_H * 0.2,
    alignSelf: 'center',
    zIndex: 20,
  },
  characterEmoji: {
    fontSize: 100,
  },
  playButton: {
    position: 'absolute',
    bottom: SCREEN_H * 0.08,
    alignSelf: 'center',
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 50,
  },
  playEmoji: {
    fontSize: 40,
  },
  progressContainer: {
    position: 'absolute',
    bottom: 40,
    left: 30,
    right: 30,
    zIndex: 50,
  },
  progressTrack: {
    height: 12,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 6,
    overflow: 'visible',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.yellow,
    borderRadius: 6,
  },
  progressDot: {
    position: 'absolute',
    top: -10,
    fontSize: 20,
    marginLeft: -10,
  },
});
