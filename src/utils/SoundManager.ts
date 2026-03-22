import { Audio } from 'expo-av';
import { Platform } from 'react-native';

// Sound effect files
const SOUND_FILES = {
  tap: require('../assets/sounds/tap.wav'),
  chime: require('../assets/sounds/chime.wav'),
  pop: require('../assets/sounds/pop.wav'),
  sparkle: require('../assets/sounds/sparkle.wav'),
  boing: require('../assets/sounds/boing.wav'),
  whoosh: require('../assets/sounds/whoosh.wav'),
  celebration: require('../assets/sounds/celebration.wav'),
  success: require('../assets/sounds/success.wav'),
} as const;

// Song music files
const SONG_FILES: Record<string, any> = {
  'twinkle-star': require('../assets/sounds/twinkle-star.wav'),
  'old-macdonald': require('../assets/sounds/old-macdonald.wav'),
  'baby-shark': require('../assets/sounds/baby-shark.wav'),
  'itsy-spider': require('../assets/sounds/itsy-spider.wav'),
};

export type SFXName = keyof typeof SOUND_FILES;

class SoundManagerClass {
  private sfxCache: Map<string, Audio.Sound> = new Map();
  private currentSong: Audio.Sound | null = null;
  private initialized = false;
  private volume = 0.8;

  async init() {
    if (this.initialized) return;
    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
        shouldDuckAndroid: true,
      });
      this.initialized = true;
    } catch (e) {
      console.warn('Audio init failed:', e);
    }
  }

  setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(1, vol));
  }

  /** Play a short sound effect — overlaps allowed */
  async playSFX(name: SFXName) {
    try {
      await this.init();
      const file = SOUND_FILES[name];
      if (!file) return;

      const { sound } = await Audio.Sound.createAsync(file, {
        shouldPlay: true,
        volume: this.volume,
      });

      // Auto-unload when finished
      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          sound.unloadAsync();
        }
      });
    } catch (e) {
      console.warn(`SFX play failed (${name}):`, e);
    }
  }

  /** Play a song — stops any currently playing song */
  async playSong(songId: string): Promise<Audio.Sound | null> {
    try {
      await this.init();
      await this.stopSong();

      const file = SONG_FILES[songId];
      if (!file) return null;

      const { sound } = await Audio.Sound.createAsync(file, {
        shouldPlay: true,
        volume: this.volume,
        isLooping: false,
      });

      this.currentSong = sound;
      return sound;
    } catch (e) {
      console.warn(`Song play failed (${songId}):`, e);
      return null;
    }
  }

  /** Stop the currently playing song */
  async stopSong() {
    if (this.currentSong) {
      try {
        await this.currentSong.stopAsync();
        await this.currentSong.unloadAsync();
      } catch (e) {
        // Already unloaded
      }
      this.currentSong = null;
    }
  }
}

export const SoundManager = new SoundManagerClass();
