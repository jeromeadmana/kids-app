/** Song data for the sing-along feature */

export interface Song {
  id: string;
  icon: string;        // emoji icon for the song card
  color: string;       // card background color
  bpm: number;         // beats per minute for sync
  theme: 'animals' | 'space' | 'ocean' | 'garden';
  backgroundElements: BackgroundElement[];
  stickerId: string;   // sticker earned on completion
}

export interface BackgroundElement {
  id: string;
  emoji: string;
  size: number;         // base size in dp
  position: { x: number; y: number }; // percentage of screen (0-1)
  tapSound: 'chime' | 'pop' | 'sparkle' | 'boing' | 'whoosh';
  tapAnimation: 'spin' | 'bounce' | 'grow' | 'wiggle' | 'float';
}

export const SONGS: Song[] = [
  {
    id: 'twinkle-star',
    icon: '⭐',
    color: '#3742FA',
    bpm: 100,
    theme: 'space',
    stickerId: 'star-1',
    backgroundElements: [
      { id: 'star1', emoji: '⭐', size: 50, position: { x: 0.15, y: 0.15 }, tapSound: 'chime', tapAnimation: 'spin' },
      { id: 'star2', emoji: '🌟', size: 45, position: { x: 0.75, y: 0.1 }, tapSound: 'sparkle', tapAnimation: 'grow' },
      { id: 'moon', emoji: '🌙', size: 60, position: { x: 0.85, y: 0.25 }, tapSound: 'whoosh', tapAnimation: 'float' },
      { id: 'cloud1', emoji: '☁️', size: 55, position: { x: 0.3, y: 0.3 }, tapSound: 'pop', tapAnimation: 'bounce' },
      { id: 'star3', emoji: '✨', size: 35, position: { x: 0.6, y: 0.2 }, tapSound: 'chime', tapAnimation: 'wiggle' },
      { id: 'planet', emoji: '🪐', size: 50, position: { x: 0.1, y: 0.4 }, tapSound: 'boing', tapAnimation: 'spin' },
    ],
  },
  {
    id: 'old-macdonald',
    icon: '🐄',
    color: '#2ED573',
    bpm: 120,
    theme: 'animals',
    stickerId: 'cat-1',
    backgroundElements: [
      { id: 'cow', emoji: '🐄', size: 55, position: { x: 0.2, y: 0.15 }, tapSound: 'boing', tapAnimation: 'bounce' },
      { id: 'chicken', emoji: '🐔', size: 45, position: { x: 0.7, y: 0.12 }, tapSound: 'pop', tapAnimation: 'wiggle' },
      { id: 'pig', emoji: '🐷', size: 50, position: { x: 0.5, y: 0.25 }, tapSound: 'boing', tapAnimation: 'bounce' },
      { id: 'sun', emoji: '🌞', size: 65, position: { x: 0.85, y: 0.08 }, tapSound: 'chime', tapAnimation: 'spin' },
      { id: 'tree', emoji: '🌳', size: 60, position: { x: 0.1, y: 0.35 }, tapSound: 'whoosh', tapAnimation: 'wiggle' },
      { id: 'flower', emoji: '🌻', size: 40, position: { x: 0.4, y: 0.4 }, tapSound: 'sparkle', tapAnimation: 'grow' },
    ],
  },
  {
    id: 'baby-shark',
    icon: '🦈',
    color: '#00D2D3',
    bpm: 115,
    theme: 'ocean',
    stickerId: 'fish-1',
    backgroundElements: [
      { id: 'shark', emoji: '🦈', size: 60, position: { x: 0.5, y: 0.2 }, tapSound: 'whoosh', tapAnimation: 'bounce' },
      { id: 'fish', emoji: '🐠', size: 40, position: { x: 0.2, y: 0.15 }, tapSound: 'pop', tapAnimation: 'wiggle' },
      { id: 'octopus', emoji: '🐙', size: 50, position: { x: 0.8, y: 0.3 }, tapSound: 'boing', tapAnimation: 'bounce' },
      { id: 'shell', emoji: '🐚', size: 35, position: { x: 0.15, y: 0.4 }, tapSound: 'chime', tapAnimation: 'spin' },
      { id: 'wave', emoji: '🌊', size: 55, position: { x: 0.6, y: 0.1 }, tapSound: 'whoosh', tapAnimation: 'float' },
      { id: 'crab', emoji: '🦀', size: 45, position: { x: 0.4, y: 0.35 }, tapSound: 'sparkle', tapAnimation: 'wiggle' },
    ],
  },
  {
    id: 'itsy-spider',
    icon: '🕷️',
    color: '#A855F7',
    bpm: 95,
    theme: 'garden',
    stickerId: 'flower-1',
    backgroundElements: [
      { id: 'spider', emoji: '🕷️', size: 45, position: { x: 0.5, y: 0.15 }, tapSound: 'boing', tapAnimation: 'bounce' },
      { id: 'rain', emoji: '🌧️', size: 50, position: { x: 0.3, y: 0.1 }, tapSound: 'whoosh', tapAnimation: 'float' },
      { id: 'rainbow', emoji: '🌈', size: 60, position: { x: 0.7, y: 0.08 }, tapSound: 'sparkle', tapAnimation: 'grow' },
      { id: 'sun', emoji: '☀️', size: 55, position: { x: 0.85, y: 0.2 }, tapSound: 'chime', tapAnimation: 'spin' },
      { id: 'leaf', emoji: '🍃', size: 40, position: { x: 0.15, y: 0.35 }, tapSound: 'pop', tapAnimation: 'wiggle' },
      { id: 'butterfly', emoji: '🦋', size: 45, position: { x: 0.6, y: 0.3 }, tapSound: 'sparkle', tapAnimation: 'float' },
    ],
  },
];
