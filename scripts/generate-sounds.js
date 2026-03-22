/**
 * Generates simple WAV sound effect files for the toddler app.
 * Run with: node scripts/generate-sounds.js
 */
const fs = require('fs');
const path = require('path');

const SAMPLE_RATE = 22050;
const outDir = path.join(__dirname, '..', 'src', 'assets', 'sounds');

function createWav(samples) {
  const numSamples = samples.length;
  const byteRate = SAMPLE_RATE * 2;
  const dataSize = numSamples * 2;
  const buffer = Buffer.alloc(44 + dataSize);

  // RIFF header
  buffer.write('RIFF', 0);
  buffer.writeUInt32LE(36 + dataSize, 4);
  buffer.write('WAVE', 8);

  // fmt chunk
  buffer.write('fmt ', 12);
  buffer.writeUInt32LE(16, 16);       // chunk size
  buffer.writeUInt16LE(1, 20);        // PCM
  buffer.writeUInt16LE(1, 22);        // mono
  buffer.writeUInt32LE(SAMPLE_RATE, 24);
  buffer.writeUInt32LE(byteRate, 28);
  buffer.writeUInt16LE(2, 32);        // block align
  buffer.writeUInt16LE(16, 34);       // bits per sample

  // data chunk
  buffer.write('data', 36);
  buffer.writeUInt32LE(dataSize, 40);

  for (let i = 0; i < numSamples; i++) {
    const val = Math.max(-1, Math.min(1, samples[i]));
    buffer.writeInt16LE(Math.round(val * 32767), 44 + i * 2);
  }

  return buffer;
}

function envelope(t, attack, decay, total) {
  if (t < attack) return t / attack;
  if (t > total - decay) return (total - t) / decay;
  return 1;
}

// --- Sound generators ---

function generateChime(duration = 0.4) {
  const n = Math.floor(SAMPLE_RATE * duration);
  const samples = new Float64Array(n);
  for (let i = 0; i < n; i++) {
    const t = i / SAMPLE_RATE;
    const env = envelope(t, 0.01, 0.2, duration);
    samples[i] = env * 0.5 * (
      Math.sin(2 * Math.PI * 880 * t) * 0.5 +
      Math.sin(2 * Math.PI * 1320 * t) * 0.3 +
      Math.sin(2 * Math.PI * 1760 * t) * 0.2
    );
  }
  return samples;
}

function generatePop(duration = 0.15) {
  const n = Math.floor(SAMPLE_RATE * duration);
  const samples = new Float64Array(n);
  for (let i = 0; i < n; i++) {
    const t = i / SAMPLE_RATE;
    const freq = 600 - (t / duration) * 400;
    const env = envelope(t, 0.005, 0.08, duration);
    samples[i] = env * 0.6 * Math.sin(2 * Math.PI * freq * t);
  }
  return samples;
}

function generateSparkle(duration = 0.5) {
  const n = Math.floor(SAMPLE_RATE * duration);
  const samples = new Float64Array(n);
  for (let i = 0; i < n; i++) {
    const t = i / SAMPLE_RATE;
    const freq = 1200 + Math.sin(t * 20) * 400;
    const env = envelope(t, 0.01, 0.3, duration);
    samples[i] = env * 0.4 * Math.sin(2 * Math.PI * freq * t);
  }
  return samples;
}

function generateBoing(duration = 0.35) {
  const n = Math.floor(SAMPLE_RATE * duration);
  const samples = new Float64Array(n);
  for (let i = 0; i < n; i++) {
    const t = i / SAMPLE_RATE;
    const freq = 300 + Math.sin(t * 25) * 200;
    const env = envelope(t, 0.01, 0.15, duration);
    samples[i] = env * 0.5 * Math.sin(2 * Math.PI * freq * t);
  }
  return samples;
}

function generateWhoosh(duration = 0.3) {
  const n = Math.floor(SAMPLE_RATE * duration);
  const samples = new Float64Array(n);
  for (let i = 0; i < n; i++) {
    const t = i / SAMPLE_RATE;
    const env = envelope(t, 0.05, 0.15, duration);
    // Filtered noise
    const noise = (Math.random() * 2 - 1);
    const sweep = Math.sin(2 * Math.PI * (200 + t * 2000) * t);
    samples[i] = env * 0.3 * (noise * 0.3 + sweep * 0.7);
  }
  return samples;
}

function generateCelebration(duration = 1.2) {
  const n = Math.floor(SAMPLE_RATE * duration);
  const samples = new Float64Array(n);
  const notes = [523, 659, 784, 1047]; // C5, E5, G5, C6

  for (let i = 0; i < n; i++) {
    const t = i / SAMPLE_RATE;
    let val = 0;

    for (let j = 0; j < notes.length; j++) {
      const noteStart = j * 0.15;
      const noteT = t - noteStart;
      if (noteT >= 0) {
        const noteEnv = Math.exp(-noteT * 3) * (noteT < 0.6 ? 1 : 0);
        val += noteEnv * Math.sin(2 * Math.PI * notes[j] * t) * 0.25;
      }
    }

    // Add shimmer
    if (t > 0.5) {
      const shimmerEnv = envelope(t - 0.5, 0.05, 0.4, 0.7);
      val += shimmerEnv * 0.15 * Math.sin(2 * Math.PI * 2093 * t);
    }

    samples[i] = val;
  }
  return samples;
}

function generateTap(duration = 0.08) {
  const n = Math.floor(SAMPLE_RATE * duration);
  const samples = new Float64Array(n);
  for (let i = 0; i < n; i++) {
    const t = i / SAMPLE_RATE;
    const env = Math.exp(-t * 50);
    samples[i] = env * 0.5 * Math.sin(2 * Math.PI * 700 * t);
  }
  return samples;
}

function generateSuccess(duration = 0.6) {
  const n = Math.floor(SAMPLE_RATE * duration);
  const samples = new Float64Array(n);
  const notes = [523, 659, 784]; // C E G
  for (let i = 0; i < n; i++) {
    const t = i / SAMPLE_RATE;
    let val = 0;
    for (let j = 0; j < notes.length; j++) {
      const noteStart = j * 0.12;
      const noteT = t - noteStart;
      if (noteT >= 0) {
        const noteEnv = Math.exp(-noteT * 4);
        val += noteEnv * Math.sin(2 * Math.PI * notes[j] * t) * 0.3;
      }
    }
    samples[i] = val;
  }
  return samples;
}

function generateSongMelody(notes, bpm, duration = 15) {
  const n = Math.floor(SAMPLE_RATE * duration);
  const samples = new Float64Array(n);
  const beatLen = 60 / bpm;

  for (let i = 0; i < n; i++) {
    const t = i / SAMPLE_RATE;
    const beatIndex = Math.floor(t / beatLen) % notes.length;
    const freq = notes[beatIndex];
    const beatT = (t % beatLen) / beatLen;
    const env = beatT < 0.1 ? beatT / 0.1 : Math.exp(-(beatT - 0.1) * 3);

    if (freq > 0) {
      samples[i] = env * 0.35 * (
        Math.sin(2 * Math.PI * freq * t) * 0.6 +
        Math.sin(2 * Math.PI * freq * 2 * t) * 0.25 +
        Math.sin(2 * Math.PI * freq * 0.5 * t) * 0.15
      );
    }
  }
  return samples;
}

// --- Generate all sounds ---

const sounds = {
  'chime.wav': generateChime(),
  'pop.wav': generatePop(),
  'sparkle.wav': generateSparkle(),
  'boing.wav': generateBoing(),
  'whoosh.wav': generateWhoosh(),
  'celebration.wav': generateCelebration(),
  'tap.wav': generateTap(),
  'success.wav': generateSuccess(),

  // Song melodies
  'twinkle-star.wav': generateSongMelody(
    [262, 262, 392, 392, 440, 440, 392, 0, 349, 349, 330, 330, 294, 294, 262, 0],
    100, 15
  ),
  'old-macdonald.wav': generateSongMelody(
    [262, 262, 262, 196, 220, 220, 196, 0, 330, 330, 294, 294, 262, 0, 0, 0],
    120, 15
  ),
  'baby-shark.wav': generateSongMelody(
    [330, 392, 392, 392, 392, 392, 392, 440, 330, 392, 392, 392, 392, 392, 0, 0],
    115, 15
  ),
  'itsy-spider.wav': generateSongMelody(
    [262, 330, 349, 349, 349, 330, 349, 392, 392, 349, 330, 349, 0, 0, 0, 0],
    95, 15
  ),
};

if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

for (const [name, samples] of Object.entries(sounds)) {
  const wav = createWav(Array.from(samples));
  fs.writeFileSync(path.join(outDir, name), wav);
  console.log(`Generated: ${name} (${(wav.length / 1024).toFixed(1)} KB)`);
}

console.log('\nAll sounds generated!');
