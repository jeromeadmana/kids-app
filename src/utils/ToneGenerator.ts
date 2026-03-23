import { Audio } from 'expo-av';

const SAMPLE_RATE = 22050;

const NOTES: Record<string, number> = {
  C4: 261.63,
  D4: 293.66,
  E4: 329.63,
  F4: 349.23,
  G4: 392.0,
  A4: 440.0,
  B4: 493.88,
  C5: 523.25,
  D5: 587.33,
  E5: 659.25,
  F5: 698.46,
  G5: 783.99,
  A5: 880.0,
};

function generateWavBuffer(frequency: number, durationMs: number): string {
  const numSamples = Math.floor((SAMPLE_RATE * durationMs) / 1000);
  const dataSize = numSamples * 2; // 16-bit = 2 bytes per sample
  const fileSize = 44 + dataSize;

  const buffer = new ArrayBuffer(fileSize);
  const view = new DataView(buffer);

  // WAV header
  writeString(view, 0, 'RIFF');
  view.setUint32(4, fileSize - 8, true);
  writeString(view, 8, 'WAVE');
  writeString(view, 12, 'fmt ');
  view.setUint32(16, 16, true); // chunk size
  view.setUint16(20, 1, true); // PCM
  view.setUint16(22, 1, true); // mono
  view.setUint32(24, SAMPLE_RATE, true);
  view.setUint32(28, SAMPLE_RATE * 2, true); // byte rate
  view.setUint16(32, 2, true); // block align
  view.setUint16(34, 16, true); // bits per sample
  writeString(view, 36, 'data');
  view.setUint32(40, dataSize, true);

  // ADSR envelope
  const attackSamples = Math.floor(SAMPLE_RATE * 0.01);
  const decaySamples = Math.floor(SAMPLE_RATE * 0.05);
  const releaseSamples = Math.floor(SAMPLE_RATE * 0.08);
  const sustainLevel = 0.6;

  for (let i = 0; i < numSamples; i++) {
    let envelope = sustainLevel;
    if (i < attackSamples) {
      envelope = i / attackSamples;
    } else if (i < attackSamples + decaySamples) {
      const t = (i - attackSamples) / decaySamples;
      envelope = 1.0 - t * (1.0 - sustainLevel);
    } else if (i > numSamples - releaseSamples) {
      envelope = sustainLevel * ((numSamples - i) / releaseSamples);
    }

    const sample = Math.sin((2 * Math.PI * frequency * i) / SAMPLE_RATE) * envelope;
    const intSample = Math.max(-32768, Math.min(32767, Math.floor(sample * 32767)));
    view.setInt16(44 + i * 2, intSample, true);
  }

  return arrayBufferToBase64(buffer);
}

function writeString(view: DataView, offset: number, str: string) {
  for (let i = 0; i < str.length; i++) {
    view.setUint8(offset + i, str.charCodeAt(i));
  }
}

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

class ToneGeneratorClass {
  private cache: Map<string, Audio.Sound> = new Map();

  async playNote(noteName: string, durationMs: number = 400): Promise<void> {
    const freq = NOTES[noteName];
    if (!freq) return;
    await this.playFrequency(freq, durationMs);
  }

  async playFrequency(frequency: number, durationMs: number = 400): Promise<void> {
    const key = `${frequency}-${durationMs}`;
    let sound = this.cache.get(key);

    if (!sound) {
      const base64 = generateWavBuffer(frequency, durationMs);
      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: `data:audio/wav;base64,${base64}` },
        { shouldPlay: false }
      );
      sound = newSound;
      this.cache.set(key, sound);
    }

    try {
      await sound.setPositionAsync(0);
      await sound.playAsync();
    } catch {
      // Sound may have been unloaded, recreate
      this.cache.delete(key);
      await this.playFrequency(frequency, durationMs);
    }
  }

  async cleanup(): Promise<void> {
    for (const sound of this.cache.values()) {
      try {
        await sound.unloadAsync();
      } catch {}
    }
    this.cache.clear();
  }
}

export const ToneGenerator = new ToneGeneratorClass();
export { NOTES };
