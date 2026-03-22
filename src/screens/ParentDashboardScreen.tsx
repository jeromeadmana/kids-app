import React from 'react';
import {
  View,
  StyleSheet,
  Text,
  Pressable,
  ScrollView,
  StatusBar,
} from 'react-native';
import { useApp } from '../context/AppContext';
import { Colors } from '../utils/colors';

interface Props {
  navigation: any;
}

export function ParentDashboardScreen({ navigation }: Props) {
  const { state, dispatch } = useApp();
  const earnedCount = state.stickers.filter((s) => s.earned).length;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <Pressable
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backText}>Done</Text>
        </Pressable>
        <Text style={styles.title}>Parent Dashboard</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Progress Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Progress</Text>
          <Text style={styles.statNumber}>
            {earnedCount} / {state.stickers.length}
          </Text>
          <Text style={styles.statLabel}>Stickers Earned</Text>
        </View>

        {/* Volume Control */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Volume</Text>
          <View style={styles.volumeRow}>
            {[0.2, 0.4, 0.6, 0.8, 1.0].map((vol) => (
              <Pressable
                key={vol}
                style={[
                  styles.volumeButton,
                  state.volume === vol && styles.volumeButtonActive,
                ]}
                onPress={() => dispatch({ type: 'SET_VOLUME', volume: vol })}
              >
                <Text
                  style={[
                    styles.volumeText,
                    state.volume === vol && styles.volumeTextActive,
                  ]}
                >
                  {Math.round(vol * 100)}%
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Sticker Progress Detail */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Collection Progress</Text>
          {(['space', 'ocean', 'garden', 'animals'] as const).map((theme) => {
            const themeStickers = state.stickers.filter(
              (s) => s.theme === theme
            );
            const themeEarned = themeStickers.filter((s) => s.earned).length;
            const themeLabels = {
              space: 'Space',
              ocean: 'Ocean',
              garden: 'Garden',
              animals: 'Animals',
            };

            return (
              <View key={theme} style={styles.themeRow}>
                <Text style={styles.themeName}>{themeLabels[theme]}</Text>
                <View style={styles.themeBar}>
                  <View
                    style={[
                      styles.themeBarFill,
                      {
                        width: `${(themeEarned / themeStickers.length) * 100}%`,
                      },
                    ]}
                  />
                </View>
                <Text style={styles.themeCount}>
                  {themeEarned}/{themeStickers.length}
                </Text>
              </View>
            );
          })}
        </View>

        {/* Info */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>About</Text>
          <Text style={styles.infoText}>
            This app is designed for toddlers aged 2-5. All interactions
            are safe and child-friendly. No ads, no in-app purchases,
            no external links.
          </Text>
          <Text style={styles.infoText}>
            COPPA compliant. No personal data is collected.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.offWhite,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 16,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.softGray,
  },
  backButton: {
    paddingVertical: 8,
    paddingRight: 16,
  },
  backText: {
    fontSize: 17,
    color: Colors.blue,
    fontWeight: '600',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.darkText,
  },
  content: {
    padding: 20,
    gap: 16,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.darkText,
    marginBottom: 12,
  },
  statNumber: {
    fontSize: 36,
    fontWeight: '800',
    color: Colors.blue,
    textAlign: 'center',
  },
  statLabel: {
    fontSize: 14,
    color: '#636E72',
    textAlign: 'center',
    marginTop: 4,
  },
  volumeRow: {
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
  },
  volumeButton: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: Colors.softGray,
  },
  volumeButtonActive: {
    backgroundColor: Colors.blue,
  },
  volumeText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.darkText,
  },
  volumeTextActive: {
    color: Colors.white,
  },
  themeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    gap: 10,
  },
  themeName: {
    width: 70,
    fontSize: 14,
    color: Colors.darkText,
  },
  themeBar: {
    flex: 1,
    height: 10,
    backgroundColor: Colors.softGray,
    borderRadius: 5,
    overflow: 'hidden',
  },
  themeBarFill: {
    height: '100%',
    backgroundColor: Colors.green,
    borderRadius: 5,
  },
  themeCount: {
    width: 30,
    fontSize: 13,
    color: '#636E72',
    textAlign: 'right',
  },
  infoText: {
    fontSize: 14,
    color: '#636E72',
    lineHeight: 20,
    marginBottom: 8,
  },
});
