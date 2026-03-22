import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  runOnJS,
} from 'react-native-reanimated';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');

interface Particle {
  id: number;
  x: number;
  y: number;
  emoji: string;
  size: number;
}

const PARTICLE_EMOJIS = ['✨', '⭐', '💫', '🌟', '❤️', '🎵', '🎶'];
const CONFETTI_EMOJIS = ['🎉', '🎊', '⭐', '💛', '💜', '💙', '🧡', '💚'];

let particleIdCounter = 0;

function SingleParticle({
  particle,
  onComplete,
}: {
  particle: Particle;
  onComplete: (id: number) => void;
}) {
  const opacity = useSharedValue(1);
  const translateY = useSharedValue(0);
  const translateX = useSharedValue(0);
  const scale = useSharedValue(0.3);

  useEffect(() => {
    const drift = (Math.random() - 0.5) * 60;
    scale.value = withTiming(1.2, { duration: 200 });
    translateY.value = withTiming(-80 - Math.random() * 60, { duration: 800 });
    translateX.value = withTiming(drift, { duration: 800 });
    opacity.value = withDelay(
      400,
      withTiming(0, { duration: 400 }, () => {
        runOnJS(onComplete)(particle.id);
      })
    );
  }, []);

  const animStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [
      { translateY: translateY.value },
      { translateX: translateX.value },
      { scale: scale.value },
    ],
  }));

  return (
    <Animated.Text
      style={[
        styles.particle,
        { left: particle.x, top: particle.y, fontSize: particle.size },
        animStyle,
      ]}
    >
      {particle.emoji}
    </Animated.Text>
  );
}

export function ParticleSystem() {
  const [particles, setParticles] = useState<Particle[]>([]);

  const removeParticle = (id: number) => {
    setParticles((prev) => prev.filter((p) => p.id !== id));
  };

  return (
    <View style={styles.container} pointerEvents="none">
      {particles.map((p) => (
        <SingleParticle key={p.id} particle={p} onComplete={removeParticle} />
      ))}
    </View>
  );
}

/** Emit a burst of particles at a given position */
export function createParticleBurst(
  x: number,
  y: number,
  count: number = 8,
  type: 'sparkle' | 'confetti' = 'sparkle'
): Particle[] {
  const emojis = type === 'confetti' ? CONFETTI_EMOJIS : PARTICLE_EMOJIS;
  const newParticles: Particle[] = [];

  for (let i = 0; i < count; i++) {
    newParticles.push({
      id: ++particleIdCounter,
      x: x + (Math.random() - 0.5) * 40,
      y: y + (Math.random() - 0.5) * 40,
      emoji: emojis[Math.floor(Math.random() * emojis.length)],
      size: 16 + Math.random() * 16,
    });
  }

  return newParticles;
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1000,
  },
  particle: {
    position: 'absolute',
  },
});
