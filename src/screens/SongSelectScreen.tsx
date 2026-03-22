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
import Animated, { FadeInDown } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { SONGS } from '../utils/songs';
import { Colors } from '../utils/colors';
import { HapticFeedback } from '../utils/haptics';

const { width: SCREEN_W } = Dimensions.get('window');
const CARD_SIZE = (SCREEN_W - 60) / 2;

interface Props {
  navigation: any;
}

function SongCard({
  song,
  index,
  onPress,
}: {
  song: (typeof SONGS)[0];
  index: number;
  onPress: () => void;
}) {
  return (
    <Animated.View entering={FadeInDown.delay(index * 100).springify()}>
      <Pressable
        onPress={() => {
          HapticFeedback.tap();
          onPress();
        }}
        style={({ pressed }) => [
          styles.card,
          { backgroundColor: song.color },
          pressed && styles.cardPressed,
        ]}
      >
        <Text style={styles.cardEmoji}>{song.icon}</Text>
      </Pressable>
    </Animated.View>
  );
}

export function SongSelectScreen({ navigation }: Props) {
  return (
    <View style={styles.container}>
      <StatusBar hidden />
      <LinearGradient
        colors={['#FD79A8', '#E17055']}
        style={StyleSheet.absoluteFill}
      />

      {/* Back button — home icon */}
      <Pressable
        style={styles.homeButton}
        onPress={() => {
          HapticFeedback.tap();
          navigation.goBack();
        }}
      >
        <Text style={styles.homeEmoji}>🏠</Text>
      </Pressable>

      {/* Title area — music icon instead of text */}
      <View style={styles.titleArea}>
        <Text style={styles.titleEmoji}>🎤</Text>
      </View>

      {/* Song grid */}
      <ScrollView
        contentContainerStyle={styles.grid}
        showsVerticalScrollIndicator={false}
      >
        {SONGS.map((song, index) => (
          <SongCard
            key={song.id}
            song={song}
            index={index}
            onPress={() => navigation.navigate('SingAlong', { songId: song.id })}
          />
        ))}
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
    backgroundColor: 'rgba(255,255,255,0.3)',
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
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 20,
    padding: 20,
    paddingBottom: 40,
  },
  card: {
    width: CARD_SIZE,
    height: CARD_SIZE,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 8,
  },
  cardPressed: {
    transform: [{ scale: 0.92 }],
    opacity: 0.9,
  },
  cardEmoji: {
    fontSize: CARD_SIZE * 0.45,
  },
});
