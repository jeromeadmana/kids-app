# KidSing

An interactive sing-along educational app for toddlers (ages 2–5). Built with React Native and Expo.

## Features

- **Icon-Only Interface** — No text, fully navigable through icons and audio cues
- **Sing-Along Mode** — 4 themed songs (Space, Animals, Ocean, Garden) with interactive backgrounds
- **Reactive Elements** — Tap stars, animals, clouds and more while music plays — each responds with unique animations (spin, bounce, grow, wiggle, float)
- **Sticker Book** — 16 collectible stickers across 4 themes, earned by completing songs
- **Celebration System** — Confetti, animations, and haptic feedback for rewards
- **Parental Gate** — Hold + slide two-finger mechanism that toddlers cannot bypass
- **Parent Dashboard** — Progress tracking and volume controls behind the parental gate
- **Toddler-Safe Navigation** — No swipe-back, edge dead zones, no accidental exits

## Tech Stack

- React Native + Expo (SDK 54)
- TypeScript
- React Navigation (native stack)
- Reanimated for 60fps animations
- Expo Haptics for touch feedback
- AsyncStorage for sticker persistence

## Getting Started

```bash
# Install dependencies
npm install

# Start the development server
npx expo start

# Run on specific platform
npx expo start --android
npx expo start --ios
npx expo start --web
```

Scan the QR code with [Expo Go](https://expo.dev/go) on your phone to run the app.

## Project Structure

```
src/
├── components/
│   ├── AnimatedIcon.tsx         # Pulsing, bouncing tap targets
│   ├── CelebrationOverlay.tsx   # Confetti + flash celebration
│   ├── ParentalGate.tsx         # Hold+slide two-finger gate
│   └── Particles.tsx            # Sparkle particle system
├── context/
│   └── AppContext.tsx            # App state + sticker persistence
├── screens/
│   ├── HomeScreen.tsx            # Main menu with animated icons
│   ├── SongSelectScreen.tsx      # Song picker with 4 themed cards
│   ├── SingAlongScreen.tsx       # Interactive sing-along experience
│   ├── StickerBookScreen.tsx     # Collectible sticker gallery
│   └── ParentDashboardScreen.tsx # Parent settings and progress
└── utils/
    ├── ToddlerTouchHandler.ts    # 4-phase touch state machine
    ├── haptics.ts                # Tiered haptic feedback patterns
    ├── colors.ts                 # Toddler-friendly color palette
    └── songs.ts                  # Song data and background elements
```

## Design Principles

- **No fail states** — Every tap produces a delightful response
- **Active engagement** — 70% touch interaction, 30% watching
- **Large touch targets** — Minimum 72dp, recommended 96dp
- **No timers or scores** — Children work at their own pace
- **Progress only goes forward** — Stickers are never lost

## Privacy

- COPPA compliant
- No personal data collection
- No ads or in-app purchases
- No external links from child-facing UI
