import React, { createContext, useContext, useReducer, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Sticker {
  id: string;
  theme: 'ocean' | 'space' | 'garden' | 'animals' | 'learning' | 'music';
  earned: boolean;
  earnedAt?: number;
}

interface AppState {
  stickers: Sticker[];
  currentSong: string | null;
  isParentMode: boolean;
  volume: number;
}

type Action =
  | { type: 'EARN_STICKER'; stickerId: string }
  | { type: 'SET_SONG'; songId: string | null }
  | { type: 'TOGGLE_PARENT_MODE'; enabled: boolean }
  | { type: 'SET_VOLUME'; volume: number }
  | { type: 'LOAD_STATE'; state: Partial<AppState> };

const DEFAULT_STICKERS: Sticker[] = [
  { id: 'star-1', theme: 'space', earned: false },
  { id: 'star-2', theme: 'space', earned: false },
  { id: 'rocket-1', theme: 'space', earned: false },
  { id: 'moon-1', theme: 'space', earned: false },
  { id: 'fish-1', theme: 'ocean', earned: false },
  { id: 'whale-1', theme: 'ocean', earned: false },
  { id: 'shell-1', theme: 'ocean', earned: false },
  { id: 'crab-1', theme: 'ocean', earned: false },
  { id: 'flower-1', theme: 'garden', earned: false },
  { id: 'tree-1', theme: 'garden', earned: false },
  { id: 'sun-1', theme: 'garden', earned: false },
  { id: 'butterfly-1', theme: 'garden', earned: false },
  { id: 'cat-1', theme: 'animals', earned: false },
  { id: 'dog-1', theme: 'animals', earned: false },
  { id: 'bird-1', theme: 'animals', earned: false },
  { id: 'bunny-1', theme: 'animals', earned: false },
  // Learning theme (ABC, Numbers, Shapes)
  { id: 'abc-1', theme: 'learning', earned: false },
  { id: 'abc-2', theme: 'learning', earned: false },
  { id: 'numbers-1', theme: 'learning', earned: false },
  { id: 'numbers-2', theme: 'learning', earned: false },
  { id: 'shapes-1', theme: 'learning', earned: false },
  { id: 'shapes-2', theme: 'learning', earned: false },
  // Music theme (Memory, Instruments)
  { id: 'memory-1', theme: 'music', earned: false },
  { id: 'memory-2', theme: 'music', earned: false },
  { id: 'instruments-1', theme: 'music', earned: false },
  { id: 'instruments-2', theme: 'music', earned: false },
];

const initialState: AppState = {
  stickers: DEFAULT_STICKERS,
  currentSong: null,
  isParentMode: false,
  volume: 0.8,
};

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'EARN_STICKER':
      return {
        ...state,
        stickers: state.stickers.map((s) =>
          s.id === action.stickerId
            ? { ...s, earned: true, earnedAt: Date.now() }
            : s
        ),
      };
    case 'SET_SONG':
      return { ...state, currentSong: action.songId };
    case 'TOGGLE_PARENT_MODE':
      return { ...state, isParentMode: action.enabled };
    case 'SET_VOLUME':
      return { ...state, volume: action.volume };
    case 'LOAD_STATE': {
      const loaded = action.state;
      // Merge stickers: keep earned status from persisted data, add any new defaults
      let mergedStickers = state.stickers;
      if (loaded.stickers) {
        const persistedMap = new Map(loaded.stickers.map((s) => [s.id, s]));
        mergedStickers = DEFAULT_STICKERS.map((def) => persistedMap.get(def.id) || def);
      }
      return { ...state, ...loaded, stickers: mergedStickers };
    }
    default:
      return state;
  }
}

const AppContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<Action>;
}>({ state: initialState, dispatch: () => {} });

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    AsyncStorage.getItem('app_state').then((data) => {
      if (data) {
        const parsed = JSON.parse(data);
        dispatch({ type: 'LOAD_STATE', state: parsed });
      }
    });
  }, []);

  useEffect(() => {
    const { stickers, volume } = state;
    AsyncStorage.setItem('app_state', JSON.stringify({ stickers, volume }));
  }, [state.stickers, state.volume]);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);
