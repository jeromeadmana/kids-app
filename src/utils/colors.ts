/** Bright, high-contrast toddler-friendly color palette */
export const Colors = {
  // Primary action colors
  red: '#FF4757',
  blue: '#3742FA',
  yellow: '#FFC312',
  green: '#2ED573',
  orange: '#FF6348',
  purple: '#A855F7',
  pink: '#FF6B9D',
  cyan: '#00D2D3',

  // Backgrounds
  skyBlue: '#74B9FF',
  skyPink: '#FD79A8',
  skyPurple: '#A29BFE',
  nightBlue: '#2C3E50',
  grassGreen: '#00B894',

  // UI
  white: '#FFFFFF',
  offWhite: '#F8F9FA',
  softGray: '#DFE6E9',
  darkText: '#2D3436',

  // Gradients (start, end)
  gradients: {
    daySky: ['#74B9FF', '#0984E3'],
    sunset: ['#FD79A8', '#E17055'],
    night: ['#2C3E50', '#3742FA'],
    rainbow: ['#FF4757', '#FFC312', '#2ED573', '#3742FA', '#A855F7'],
    ocean: ['#00D2D3', '#0984E3'],
    garden: ['#00B894', '#2ED573'],
  },
} as const;
