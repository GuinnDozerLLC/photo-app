# QuickShrink - Photo Compressor ⚡

A React Native mobile app for compressing photos on-device with professional-grade features designed for App Store success.

## 🌟 Stand-Out Features

### ⚡ 1-Tap Auto Shrink
Skip the menus—just tap "Auto Shrink" for instant compression with optimal settings.

### 📊 Clear Before/After Comparison
See exactly what you're getting:
- Side-by-side image preview
- Clear file size display
- Percentage and bytes saved

### 📱 Social Media Presets
One-tap resize for popular platforms:
- Instagram Square (1080x1080)
- Instagram Story (1080x1920)
- Facebook Post (1200x630)
- TikTok Video (1080x1920)

### 🎨 Four Compression Levels
- **High Quality** (90%) - Minimal compression, best for printing
- **Balanced** (70%) - Recommended for most uses
- **Small File** (50%) - Maximum compression
- **Super Small** (30%) - Ultra compression for messaging & sharing

### 🔥 Premium Features (Pro Version)
- **Batch Mode**: Compress multiple photos at once
- **Ad-Free Experience**: No interruptions
- **Priority Support**: Get help when you need it

### 💡 What Makes Us Different
- ✅ **No Watermarks Ever** - Your photos stay yours
- ✅ **100% Offline** - No cloud upload, no account required
- ✅ **Lightning Fast** - Compress photos in under 1 second
- ✅ **Private & Secure** - All processing on your device
- ✅ **Dark Mode** - Easy on the eyes
- ✅ **Modern UI** - Clean, minimalist design

## Tech Stack

- React Native with Expo
- expo-image-picker - For selecting photos from gallery
- expo-image-manipulator - For on-device image compression
- expo-file-system - For file size information
- expo-sharing - For saving/sharing compressed photos

## Prerequisites

- Node.js (v14 or later)
- npm or yarn
- Expo CLI (optional, but recommended)
- iOS Simulator / Android Emulator or physical device

## Installation

1. Clone the repository:
```bash
git clone https://github.com/GuinnDozerLLC/photo-app.git
cd photo-app
```

2. Install dependencies:
```bash
npm install
```

## Running the App

### Start the development server:
```bash
npm start
```

This will start the Expo development server. You can then:

- Press `i` to open in iOS Simulator (Mac only)
- Press `a` to open in Android Emulator
- Scan the QR code with the Expo Go app on your physical device

### Run on specific platforms:
```bash
npm run android  # Run on Android
npm run ios      # Run on iOS (Mac only)
npm run web      # Run in web browser
```

## How to Use

1. **Select a Photo**: Tap "Select Photo from Gallery" to choose a photo
2. **Choose Compression Level**: Select one of the three compression presets:
   - High Quality: Best quality, least compression
   - Balanced: Good balance between quality and file size
   - Small File: Smallest file size, most compression
3. **Compress**: Tap "Compress Photo" to compress the image
4. **Review**: See the compressed image and file size savings
5. **Save/Share**: Tap "Save / Share" to save or share your compressed photo

## Project Structure

```
photo-app/
├── App.js              # Main application component
├── app.json            # Expo configuration
├── package.json        # Dependencies and scripts
├── assets/             # App assets (icons, splash screens)
└── README.md           # This file
```

## Building for Production

### Android APK:
```bash
expo build:android
```

### iOS IPA:
```bash
expo build:ios
```

For more information on building standalone apps, see the [Expo documentation](https://docs.expo.dev/build/setup/).

## Future Enhancements (Potential v2 Features)

- Video compression support
- Batch photo compression
- Custom compression settings
- Before/after image comparison slider
- Compression history
- More output formats (PNG, WebP)

## License

ISC

## Support

For issues, questions, or contributions, please open an issue on GitHub.
