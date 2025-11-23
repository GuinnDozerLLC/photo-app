# Development Guide

## Getting Started

### First Time Setup

1. Install Node.js (v14 or later) from [nodejs.org](https://nodejs.org/)
2. Install Expo CLI globally (optional but recommended):
   ```bash
   npm install -g expo-cli
   ```
3. Clone and install dependencies:
   ```bash
   git clone https://github.com/GuinnDozerLLC/photo-app.git
   cd photo-app
   npm install
   ```

### Running the Development Server

```bash
npm start
```

This starts the Expo development server with Metro bundler. You'll see a QR code in the terminal and a browser window will open with additional options.

## Development Workflow

### Testing on Physical Device

1. Install Expo Go app on your device:
   - iOS: [App Store](https://apps.apple.com/app/expo-go/id982107779)
   - Android: [Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent)

2. Scan the QR code from the terminal or browser

3. The app will load on your device with hot-reloading enabled

### Testing on Emulator/Simulator

**iOS Simulator (Mac only):**
```bash
npm run ios
```
Requires Xcode installed.

**Android Emulator:**
```bash
npm run android
```
Requires Android Studio and an AVD (Android Virtual Device) configured.

## Project Architecture

### Main Components

- **App.js**: Main application component containing all UI and logic
  - Photo selection using expo-image-picker
  - Image compression using expo-image-manipulator
  - File operations using expo-file-system
  - Sharing functionality using expo-sharing

### State Management

The app uses React hooks for state management:
- `selectedImage`: URI of the original selected image
- `originalSize`: File size of original image in bytes
- `compressedImage`: URI of the compressed image
- `compressedSize`: File size of compressed image in bytes
- `compressionLevel`: Currently selected compression preset
- `isCompressing`: Loading state during compression

### Compression Presets

Three preset levels are defined with different quality values:
- **High Quality**: 0.9 quality (90%)
- **Balanced**: 0.7 quality (70%)
- **Small File**: 0.5 quality (50%)

The quality value is passed to `expo-image-manipulator`'s `compress` option.

## Key Dependencies

### Core Framework
- **expo**: ~51.0.0 - Expo SDK
- **react**: 18.2.0 - React library
- **react-native**: 0.74.5 - React Native framework

### Expo Modules
- **expo-image-picker**: Photo selection from gallery
- **expo-image-manipulator**: On-device image compression
- **expo-file-system**: File size and info retrieval
- **expo-sharing**: Save/share functionality
- **expo-status-bar**: Status bar styling

## Making Changes

### Adding New Features

1. Create a new branch:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. Make your changes in `App.js` or create new components

3. Test thoroughly on both iOS and Android if possible

4. Commit and push your changes

### Styling

The app uses React Native's StyleSheet API. All styles are defined in the `styles` constant at the bottom of `App.js`.

Color Scheme:
- Primary: #007AFF (iOS blue)
- Success: #34C759 (Green)
- Warning: #FF9500 (Orange)
- Background: #f5f5f5 (Light gray)
- Card Background: #ffffff (White)

### Permissions

The app requires the following permissions:
- **iOS**: Photo Library access (configured in app.json)
- **Android**: READ_EXTERNAL_STORAGE, WRITE_EXTERNAL_STORAGE

Permissions are requested at runtime when the user first attempts to select a photo.

## Debugging

### Common Issues

1. **"Unable to resolve module"**: 
   - Clear cache: `expo start --clear`
   - Reinstall dependencies: `rm -rf node_modules && npm install`

2. **Metro bundler issues**:
   - Kill any running Metro processes
   - Clear watchman: `watchman watch-del-all`

3. **Permission denied on Android**:
   - Check app.json permissions configuration
   - Manually grant permissions in device settings

### Debug Tools

- Use React Native Debugger or Chrome DevTools
- Enable "Debug Remote JS" in Expo Go app
- Use console.log() for simple debugging
- Use React DevTools for component inspection

## Testing Compression

To test the compression functionality:

1. Select a high-resolution photo (> 2MB recommended)
2. Try each compression level
3. Verify file size reduction
4. Check image quality visually
5. Test save/share functionality

Expected Results:
- High Quality: 10-30% reduction
- Balanced: 40-60% reduction  
- Small File: 60-80% reduction

Actual results will vary based on the original image format and content.

## Building for Production

### Development Build
```bash
expo build:android
expo build:ios
```

### EAS Build (Recommended)
```bash
npm install -g eas-cli
eas build --platform android
eas build --platform ios
```

See [Expo EAS Build documentation](https://docs.expo.dev/build/introduction/) for more details.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## Resources

- [Expo Documentation](https://docs.expo.dev/)
- [React Native Documentation](https://reactnative.dev/)
- [expo-image-picker API](https://docs.expo.dev/versions/latest/sdk/imagepicker/)
- [expo-image-manipulator API](https://docs.expo.dev/versions/latest/sdk/imagemanipulator/)
