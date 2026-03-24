# KidSing — Feature Roadmap

## Current Features (v1.0)
- [x] Home screen with icon-only navigation
- [x] Sing-along mode with 4 songs and reactive backgrounds
- [x] Coloring activity with 4 pictures and 8-color palette
- [x] Animal sounds grid with 12 animals
- [x] Sticker book with 16 collectible stickers (4 themes)
- [x] Celebration overlay with confetti and haptics
- [x] Parental gate (hold + slide)
- [x] Parent dashboard with progress and volume controls
- [x] Sound effects on all interactions
- [x] Toddler-safe navigation (no accidental exits)

---

## Phase 2 — Core Activities

### ABC Letters
- Tap letters to hear their name + associated word (A = Apple)
- Drag letter to matching object
- Alphabet song integration
- Uppercase and lowercase modes

### 123 Numbers
- Count objects on screen (1–10)
- Tap the correct number to match the count
- Visual number tracing
- Simple addition with objects (1 apple + 1 apple = ?)

### Shape Matching
- Drag circles, squares, triangles into matching holes
- Shapes animate and celebrate when placed correctly
- Increasing difficulty (3 shapes → 6 shapes)
- Color + shape combinations

### Memory Game
- Flip cards to find matching pairs
- Themed decks: animals, fruits, vehicles, emojis
- 2x2 grid for beginners, up to 3x4 for older toddlers
- No fail state — mismatched cards flip back gently

### Musical Instruments
- Tap drums, piano keys, xylophone bars
- Each instrument produces real tones
- Free play mode — make your own music
- Follow-along mode — repeat the pattern shown

---

## Phase 3 — Polish & Engagement

### Character Selection
- Choose a dancing buddy: bear, bunny, cat, penguin, dinosaur
- Selected character appears in sing-alongs and celebrations
- Each character has unique dance moves
- Persisted per child profile

### Day/Night Themes ✅
- Auto-switch home screen background based on time of day
- Morning: sunny sky with birds
- Afternoon: warm sunset colors
- Night: stars and moon with softer sounds

### Engagement Recovery
- If no touch detected for 8 seconds during an activity:
  - 4s: character peeks from edge and waves
  - 6s: interactive element pulses more prominently
  - 8s: character taps the element itself, demonstrating what to do
  - 12s: audio prompt with arrow animation
  - 20s: transition to simpler, more stimulating mode

### Better Audio
- Replace generated WAV melodies with multi-instrument tracks
- Add vocal lyrics to sing-along songs
- Layer background ambient sounds per theme
- Beat-synced bonus effects when tapping on rhythm

### Animated Transitions
- Stars wipe between screens
- Bubble pop reveal for new activities
- Curtain reveal for sing-along stage
- Rainbow slide for returning home

---

## Phase 4 — Quick Content Additions

### More Songs (target: 12 total)
- Wheels on the Bus
- Head Shoulders Knees and Toes
- If You're Happy and You Know It
- Row Row Row Your Boat
- Baa Baa Black Sheep
- Mary Had a Little Lamb
- Hickory Dickory Dock
- London Bridge

### More Animals (target: 24 total)
- Farm: horse, sheep, goat, rooster
- Jungle: elephant, giraffe, tiger, parrot
- Ocean: dolphin, turtle, jellyfish, seahorse

### More Coloring Pictures (target: 12 total)
- Rocket, house, car, rainbow, sun, tree, cat, dinosaur

### Sticker Book Sounds
- Each earned sticker plays a unique sound when tapped
- Completed collections trigger a special group animation

---

## Phase 5 — Safety & Parent Features

### Screen Time Timer
- Parental configurable auto-pause (15 / 30 / 60 minutes)
- Gentle "time for a break!" animation with sleepy character
- Resume after parent confirms
- Daily usage tracking in parent dashboard

### Multi-Child Profiles
- Up to 4 child profiles with separate sticker progress
- Profile selection behind parental gate
- Per-child activity history
- Age-appropriate difficulty per profile

### Progress Reports
- Weekly summary of activities completed
- Most-played songs and activities
- Stickers earned this week
- Accessible from parent dashboard

---

## Technical Debt & Infrastructure

- [ ] Add unit tests for touch handler and sound manager
- [ ] Add E2E tests for core navigation flows
- [ ] Set up CI/CD pipeline for builds
- [ ] Optimize sound file sizes (compress WAVs or convert to AAC)
- [ ] Add offline support for all assets
- [ ] Performance profiling on lower-end devices
- [ ] Accessibility audit (VoiceOver / TalkBack support)
- [ ] Localization support (multiple languages for audio cues)
