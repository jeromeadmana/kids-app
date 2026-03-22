import React, { useState, useRef } from 'react';
import {
  View,
  StyleSheet,
  Text,
  Dimensions,
  PanResponder,
  Animated as RNAnimated,
} from 'react-native';
import { Colors } from '../utils/colors';

const { width: SCREEN_W } = Dimensions.get('window');
const SLIDE_TRACK_WIDTH = SCREEN_W * 0.6;
const SLIDER_SIZE = 56;
const SLIDE_THRESHOLD = SLIDE_TRACK_WIDTH - SLIDER_SIZE - 10;

interface Props {
  visible: boolean;
  onSuccess: () => void;
  onCancel: () => void;
}

/**
 * Parental Gate — Hold + Slide dual-action
 *
 * Requires two-finger coordination that toddlers (2–5) cannot perform:
 * 1. Hold the lock icon with one finger
 * 2. Slide the arrow to the right with another finger simultaneously
 */
export function ParentalGate({ visible, onSuccess, onCancel }: Props) {
  const [isHoldingLock, setIsHoldingLock] = useState(false);
  const slideX = useRef(new RNAnimated.Value(0)).current;
  const holdScale = useRef(new RNAnimated.Value(1)).current;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: (_, gesture) => {
        if (isHoldingLock) {
          const newX = Math.max(0, Math.min(gesture.dx, SLIDE_THRESHOLD));
          slideX.setValue(newX);
        }
      },
      onPanResponderRelease: (_, gesture) => {
        if (isHoldingLock && gesture.dx >= SLIDE_THRESHOLD) {
          onSuccess();
        }
        RNAnimated.spring(slideX, {
          toValue: 0,
          useNativeDriver: true,
        }).start();
      },
    })
  ).current;

  const handleLockPressIn = () => {
    setIsHoldingLock(true);
    RNAnimated.spring(holdScale, {
      toValue: 0.9,
      useNativeDriver: true,
    }).start();
  };

  const handleLockPressOut = () => {
    setIsHoldingLock(false);
    RNAnimated.spring(holdScale, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
    RNAnimated.spring(slideX, {
      toValue: 0,
      useNativeDriver: true,
    }).start();
  };

  if (!visible) return null;

  return (
    <View style={styles.overlay}>
      <View style={styles.modal}>
        <Text style={styles.title}>Parent Access</Text>
        <Text style={styles.instruction}>
          Hold the lock with one finger,{'\n'}slide the arrow with another
        </Text>

        <View style={styles.gateContainer}>
          {/* Lock icon — must be held */}
          <RNAnimated.View style={{ transform: [{ scale: holdScale }] }}>
            <View
              style={[
                styles.lockButton,
                isHoldingLock && styles.lockButtonActive,
              ]}
              onTouchStart={handleLockPressIn}
              onTouchEnd={handleLockPressOut}
            >
              <Text style={styles.lockEmoji}>{isHoldingLock ? '🔓' : '🔒'}</Text>
            </View>
          </RNAnimated.View>

          {/* Slide track */}
          <View style={styles.slideTrack}>
            <RNAnimated.View
              style={[
                styles.slider,
                {
                  transform: [{ translateX: slideX }],
                  opacity: isHoldingLock ? 1 : 0.4,
                },
              ]}
              {...panResponder.panHandlers}
            >
              <Text style={styles.sliderArrow}>→</Text>
            </RNAnimated.View>
            <View style={styles.slideEnd}>
              <Text style={styles.lockEmoji}>🔓</Text>
            </View>
          </View>
        </View>

        <Text
          style={styles.cancelText}
          onPress={onCancel}
        >
          Cancel
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 5000,
  },
  modal: {
    backgroundColor: Colors.white,
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    width: SCREEN_W * 0.85,
    maxWidth: 400,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.darkText,
    marginBottom: 8,
  },
  instruction: {
    fontSize: 15,
    color: '#636E72',
    textAlign: 'center',
    marginBottom: 28,
    lineHeight: 22,
  },
  gateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  lockButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.softGray,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#B2BEC3',
  },
  lockButtonActive: {
    backgroundColor: Colors.green,
    borderColor: Colors.green,
  },
  lockEmoji: {
    fontSize: 28,
  },
  slideTrack: {
    width: SLIDE_TRACK_WIDTH,
    height: 56,
    backgroundColor: Colors.softGray,
    borderRadius: 28,
    justifyContent: 'center',
    position: 'relative',
  },
  slider: {
    width: SLIDER_SIZE,
    height: SLIDER_SIZE,
    borderRadius: SLIDER_SIZE / 2,
    backgroundColor: Colors.blue,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    left: 3,
    zIndex: 2,
  },
  sliderArrow: {
    fontSize: 24,
    color: Colors.white,
    fontWeight: '700',
  },
  slideEnd: {
    position: 'absolute',
    right: 8,
  },
  cancelText: {
    marginTop: 24,
    fontSize: 16,
    color: '#636E72',
  },
});
