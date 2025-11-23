# QuickShrink - Quick Start Guide

## 🚀 Get Started in 3 Steps

### 1. Install Dependencies
```bash
npm install
```

### 2. Start the App
```bash
npm start
```

### 3. Open on Your Device
- **Mobile Device**: Install "Expo Go" app and scan the QR code
- **Android Emulator**: Press `a` in the terminal
- **iOS Simulator**: Press `i` in the terminal (Mac only)

## 📱 Using the App

### ⚡ Quick Mode (Recommended)
1. **Select Photo**: Tap "Select Photo from Gallery"
2. **Auto Shrink**: Tap the big red "Auto Shrink (1-Tap)" button
3. **Save/Share**: Done! Save or share your compressed photo

### 🎯 Advanced Mode
1. **Select Photo**: Tap "Select Photo from Gallery"
2. **Social Preset** (Optional): Choose Instagram, TikTok, etc.
3. **Choose Quality**: Select compression level:
   - 🟢 **High Quality** - Best quality (10-30% smaller)
   - 🟡 **Balanced** - Good balance (40-60% smaller)
   - 🔴 **Small File** - Maximum compression (60-80% smaller)
   - ⚡ **Super Small** - Ultra compression (80-90% smaller)
4. **Compress**: Tap "Compress Photo" button
5. **Save/Share**: Save or share your compressed photo

### 💎 Pro Features
- **Batch Mode**: Enable in settings to compress multiple photos at once
- **No Ads**: Upgrade to Pro to remove all advertisements
- **Demo**: Premium features are enabled in demo mode for testing

## 💡 Tips

- Use larger photos (>2MB) to see better compression results
- PNG files typically compress more than JPEGs
- "High Quality" is recommended for photos you want to print
- "Small File" is great for sharing on social media
- Compression is instant and happens on your device

## 🔧 Troubleshooting

### App won't start?
```bash
# Clear cache and reinstall
rm -rf node_modules
npm install
npm start -- --clear
```

### Can't select photos?
- Make sure you granted photo library permissions
- Check device settings if permission was denied

### Compilation errors?
- Make sure you have Node.js 14+ installed: `node --version`
- Try: `npm install expo@~51.0.0 --save`

## 📚 More Information

- **Full Documentation**: See `README.md`
- **Development Guide**: See `DEVELOPMENT.md`
- **Technical Details**: See `PROJECT_SUMMARY.md`

## 🎉 That's It!

You're ready to compress photos! Enjoy using QuickShrink!

---

**Need Help?** Open an issue on GitHub or check the documentation files.
