import { useState } from 'react';
import { StyleSheet, Text, View, Image, TouchableOpacity, ScrollView, Alert, ActivityIndicator, useColorScheme, Switch } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

export default function App() {
  const systemColorScheme = useColorScheme();
  const [selectedImages, setSelectedImages] = useState([]);
  const [originalSize, setOriginalSize] = useState(null);
  const [compressedImages, setCompressedImages] = useState([]);
  const [compressedSize, setCompressedSize] = useState(null);
  const [compressionLevel, setCompressionLevel] = useState('balanced');
  const [isCompressing, setIsCompressing] = useState(false);
  const [batchMode, setBatchMode] = useState(false);
  const [isPremium, setIsPremium] = useState(false); // In real app, this would be from purchases
  const [darkMode, setDarkMode] = useState(systemColorScheme === 'dark');
  const [socialPreset, setSocialPreset] = useState(null);

  // Enhanced compression presets with Super Small mode
  const compressionPresets = {
    highQuality: { quality: 0.9, label: 'High Quality', description: 'Minimal compression', icon: '🟢' },
    balanced: { quality: 0.7, label: 'Balanced', description: 'Good quality, smaller size', icon: '🟡' },
    smallFile: { quality: 0.5, label: 'Small File', description: 'Maximum compression', icon: '🔴' },
    superSmall: { quality: 0.3, label: 'Super Small', description: 'Ultra compression for sharing', icon: '⚡' }
  };

  // Social media presets
  const socialPresets = {
    instagram: { width: 1080, height: 1080, label: 'Instagram Square', icon: '📷' },
    instagramStory: { width: 1080, height: 1920, label: 'Instagram Story', icon: '📱' },
    facebook: { width: 1200, height: 630, label: 'Facebook Post', icon: '👍' },
    tiktok: { width: 1080, height: 1920, label: 'TikTok Video', icon: '🎵' }
  };

  // Format file size for display
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  // Calculate savings percentage
  const calculateSavings = () => {
    if (originalSize && compressedSize && originalSize > 0) {
      const savings = ((originalSize - compressedSize) / originalSize * 100).toFixed(1);
      return savings;
    }
    return 0;
  };
  
  // Calculate actual savings in bytes
  const getSavingsBytes = () => {
    if (originalSize && compressedSize && originalSize >= compressedSize) {
      return originalSize - compressedSize;
    }
    return 0;
  };

  // Pick image from gallery with batch support
  const pickImage = async () => {
    try {
      // Check batch mode permission
      if (batchMode && !isPremium) {
        Alert.alert(
          'Premium Feature',
          'Batch mode is available in Pro version. Upgrade to compress multiple photos at once!',
          [
            { text: 'Maybe Later', style: 'cancel' },
            { text: 'Upgrade to Pro ($2.99)', onPress: () => handleUpgrade() }
          ]
        );
        return;
      }

      // Request permission
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Sorry, we need camera roll permissions to select photos.');
        return;
      }

      // Launch image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        quality: 1,
        allowsMultipleSelection: batchMode && isPremium,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const images = result.assets.map(asset => asset.uri);
        setSelectedImages(images);
        setCompressedImages([]);
        setCompressedSize(null);
        
        // Calculate total original size
        let totalSize = 0;
        for (const asset of result.assets) {
          const fileInfo = await FileSystem.getInfoAsync(asset.uri);
          totalSize += fileInfo.size;
        }
        setOriginalSize(totalSize);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image. Please try again.');
    }
  };

  // Handle upgrade to premium
  const handleUpgrade = () => {
    // In real app, this would trigger in-app purchase
    Alert.alert('Demo Mode', 'In production, this would open the purchase flow. For demo, premium is now enabled!');
    setIsPremium(true);
  };

  // Auto Shrink - 1-tap compression with best settings
  const autoShrink = async () => {
    if (selectedImages.length === 0) {
      Alert.alert('No Image', 'Please select an image first.');
      return;
    }

    // Auto-select balanced compression for best results
    setCompressionLevel('balanced');
    await compressImages();
  };

  // Compress the selected images
  const compressImages = async () => {
    if (selectedImages.length === 0) {
      Alert.alert('No Image', 'Please select an image first.');
      return;
    }

    setIsCompressing(true);
    try {
      const preset = compressionPresets[compressionLevel];
      const compressed = [];
      let totalCompressedSize = 0;
      
      for (const imageUri of selectedImages) {
        // Prepare resize actions if social preset is selected
        const actions = [];
        if (socialPreset && socialPresets[socialPreset]) {
          const { width, height } = socialPresets[socialPreset];
          actions.push({ resize: { width, height } });
        }

        // Compress image using ImageManipulator
        const manipulatedImage = await ImageManipulator.manipulateAsync(
          imageUri,
          actions,
          {
            compress: preset.quality,
            format: ImageManipulator.SaveFormat.JPEG
          }
        );

        compressed.push(manipulatedImage.uri);
        
        // Get compressed file size
        const fileInfo = await FileSystem.getInfoAsync(manipulatedImage.uri);
        totalCompressedSize += fileInfo.size;
      }

      setCompressedImages(compressed);
      setCompressedSize(totalCompressedSize);
    } catch (error) {
      console.error('Error compressing image:', error);
      Alert.alert('Error', 'Failed to compress image. Please try again.');
    } finally {
      setIsCompressing(false);
    }
  };

  // Save compressed images
  const saveImages = async () => {
    if (compressedImages.length === 0) {
      Alert.alert('No Compressed Image', 'Please compress an image first.');
      return;
    }

    try {
      // Check if sharing is available
      const isAvailable = await Sharing.isAvailableAsync();
      if (isAvailable) {
        // Share first image (in real app, could share all)
        await Sharing.shareAsync(compressedImages[0], {
          mimeType: 'image/jpeg',
          dialogTitle: 'Save or Share Your Compressed Image'
        });
      } else {
        Alert.alert('Success', 'Images have been compressed and are ready to use!');
      }
    } catch (error) {
      console.error('Error sharing image:', error);
      Alert.alert('Error', 'Failed to save/share image.');
    }
  };

  const selectedImage = selectedImages.length > 0 ? selectedImages[0] : null;
  const compressedImage = compressedImages.length > 0 ? compressedImages[0] : null;
  const theme = darkMode ? darkTheme : lightTheme;

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar style={darkMode ? "light" : "dark"} />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <View style={styles.headerRow}>
            <View>
              <Text style={[styles.title, { color: theme.text }]}>QuickShrink</Text>
              <Text style={[styles.subtitle, { color: theme.textSecondary }]}>Photo Compressor</Text>
            </View>
            <View style={styles.headerControls}>
              <View style={styles.darkModeToggle}>
                <Text style={[styles.toggleLabel, { color: theme.textSecondary }]}>🌙</Text>
                <Switch
                  value={darkMode}
                  onValueChange={setDarkMode}
                  trackColor={{ false: '#767577', true: '#007AFF' }}
                  thumbColor={darkMode ? '#f4f3f4' : '#f4f3f4'}
                />
              </View>
              {isPremium && (
                <View style={styles.premiumBadge}>
                  <Text style={styles.premiumBadgeText}>✨ PRO</Text>
                </View>
              )}
            </View>
          </View>
        </View>

        {/* Batch Mode Toggle */}
        {!selectedImage && (
          <View style={[styles.batchModeSection, { backgroundColor: theme.card }]}>
            <View style={styles.batchModeContent}>
              <Text style={[styles.batchModeLabel, { color: theme.text }]}>
                Batch Mode {!isPremium && '(Pro)'}
              </Text>
              <Text style={[styles.batchModeDescription, { color: theme.textSecondary }]}>
                {isPremium ? 'Compress multiple photos at once' : 'Upgrade to compress multiple photos'}
              </Text>
            </View>
            <Switch
              value={batchMode}
              onValueChange={setBatchMode}
              trackColor={{ false: '#767577', true: '#34C759' }}
              thumbColor={batchMode ? '#f4f3f4' : '#f4f3f4'}
            />
          </View>
        )}

        {/* Select Image Button */}
        <TouchableOpacity style={styles.primaryButton} onPress={pickImage}>
          <Text style={styles.primaryButtonText}>
            {selectedImage ? 'Choose Different Photo' : `Select Photo${batchMode ? 's' : ''} from Gallery`}
          </Text>
        </TouchableOpacity>

        {/* Auto Shrink Button - 1-Tap Compression */}
        {selectedImage && !compressedImage && (
          <TouchableOpacity 
            style={[styles.autoShrinkButton, isCompressing && styles.autoShrinkButtonDisabled]}
            onPress={autoShrink}
            disabled={isCompressing}
          >
            {isCompressing ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Text style={styles.autoShrinkButtonIcon}>⚡</Text>
                <Text style={styles.autoShrinkButtonText}>Auto Shrink (1-Tap)</Text>
              </>
            )}
          </TouchableOpacity>
        )}

        {/* Display Selected Image */}
        {selectedImage && (
          <View style={[styles.imageSection, { backgroundColor: theme.card }]}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              Original Image{selectedImages.length > 1 ? ` (${selectedImages.length} photos)` : ''}
            </Text>
            <Image source={{ uri: selectedImage }} style={styles.imagePreview} />
            <View style={[styles.fileSizeBox, { backgroundColor: theme.background }]}>
              <Text style={[styles.fileSizeLabel, { color: theme.textSecondary }]}>Original Size:</Text>
              <Text style={[styles.fileSizeValue, { color: theme.text }]}>{formatFileSize(originalSize)}</Text>
            </View>
          </View>
        )}

        {/* Social Media Presets */}
        {selectedImage && !compressedImage && (
          <View style={[styles.compressionSection, { backgroundColor: theme.card }]}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Social Media Presets (Optional)</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.socialPresetsScroll}>
              <TouchableOpacity
                style={[styles.socialPresetButton, !socialPreset && styles.socialPresetButtonSelected]}
                onPress={() => setSocialPreset(null)}
              >
                <Text style={styles.socialPresetIcon}>📐</Text>
                <Text style={[styles.socialPresetLabel, !socialPreset && styles.socialPresetLabelSelected]}>
                  Original Size
                </Text>
              </TouchableOpacity>
              {Object.entries(socialPresets).map(([key, preset]) => (
                <TouchableOpacity
                  key={key}
                  style={[
                    styles.socialPresetButton,
                    socialPreset === key && styles.socialPresetButtonSelected
                  ]}
                  onPress={() => setSocialPreset(key)}
                >
                  <Text style={styles.socialPresetIcon}>{preset.icon}</Text>
                  <Text style={[styles.socialPresetLabel, socialPreset === key && styles.socialPresetLabelSelected]}>
                    {preset.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Compression Level Selection */}
        {selectedImage && !compressedImage && (
          <View style={[styles.compressionSection, { backgroundColor: theme.card }]}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Choose Compression Level</Text>
            
            {Object.entries(compressionPresets).map(([key, preset]) => (
              <TouchableOpacity
                key={key}
                style={[
                  styles.compressionOption,
                  { backgroundColor: theme.background, borderColor: theme.border },
                  compressionLevel === key && styles.compressionOptionSelected
                ]}
                onPress={() => setCompressionLevel(key)}
              >
                <View style={styles.compressionOptionContent}>
                  <Text style={styles.compressionOptionIcon}>{preset.icon}</Text>
                  <View style={styles.compressionOptionTextContent}>
                    <Text style={[
                      styles.compressionOptionTitle,
                      { color: theme.text },
                      compressionLevel === key && styles.compressionOptionTitleSelected
                    ]}>
                      {preset.label}
                    </Text>
                    <Text style={[
                      styles.compressionOptionDescription,
                      { color: theme.textSecondary },
                      compressionLevel === key && styles.compressionOptionDescriptionSelected
                    ]}>
                      {preset.description}
                    </Text>
                  </View>
                </View>
                {compressionLevel === key && (
                  <View style={styles.selectedIndicator}>
                    <Text style={styles.selectedIndicatorText}>✓</Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}

            {/* Compress Button */}
            <TouchableOpacity
              style={[styles.compressButton, isCompressing && styles.compressButtonDisabled]}
              onPress={compressImages}
              disabled={isCompressing}
            >
              {isCompressing ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.compressButtonText}>
                  Compress Photo{selectedImages.length > 1 ? 's' : ''}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        )}

        {/* Display Compressed Image with Enhanced Before/After */}
        {compressedImage && (
          <View style={[styles.imageSection, { backgroundColor: theme.card }]}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              Compressed Image{compressedImages.length > 1 ? ` (${compressedImages.length} photos)` : ''}
            </Text>
            
            {/* Before/After Comparison */}
            <View style={styles.comparisonContainer}>
              <View style={styles.comparisonColumn}>
                <Text style={[styles.comparisonLabel, { color: theme.textSecondary }]}>Before</Text>
                <Image source={{ uri: selectedImage }} style={styles.comparisonImage} />
                <View style={[styles.comparisonSizeBox, { backgroundColor: '#FF3B30' }]}>
                  <Text style={styles.comparisonSizeText}>{formatFileSize(originalSize)}</Text>
                </View>
              </View>
              <View style={styles.comparisonArrow}>
                <Text style={styles.comparisonArrowText}>→</Text>
              </View>
              <View style={styles.comparisonColumn}>
                <Text style={[styles.comparisonLabel, { color: theme.textSecondary }]}>After</Text>
                <Image source={{ uri: compressedImage }} style={styles.comparisonImage} />
                <View style={[styles.comparisonSizeBox, { backgroundColor: '#34C759' }]}>
                  <Text style={styles.comparisonSizeText}>{formatFileSize(compressedSize)}</Text>
                </View>
              </View>
            </View>

            {/* Enhanced Savings Display */}
            <View style={styles.savingsBoxEnhanced}>
              <Text style={styles.savingsPercentage}>{calculateSavings()}%</Text>
              <Text style={styles.savingsLabel}>SAVED</Text>
              <Text style={styles.savingsBytesText}>
                {formatFileSize(getSavingsBytes())} smaller
              </Text>
            </View>

            {/* Save/Share Button */}
            <TouchableOpacity style={styles.saveButton} onPress={saveImages}>
              <Text style={styles.saveButtonText}>💾 Save / Share</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Instructions & Features */}
        {!selectedImage && (
          <View style={[styles.instructions, { backgroundColor: theme.card }]}>
            <Text style={[styles.instructionsTitle, { color: theme.text }]}>✨ Features:</Text>
            <Text style={[styles.instructionsText, { color: theme.textSecondary }]}>
              ⚡ 1-Tap "Auto Shrink" for instant compression
            </Text>
            <Text style={[styles.instructionsText, { color: theme.textSecondary }]}>
              📊 Clear before/after comparison
            </Text>
            <Text style={[styles.instructionsText, { color: theme.textSecondary }]}>
              📱 Social media presets (Instagram, TikTok, Facebook)
            </Text>
            <Text style={[styles.instructionsText, { color: theme.textSecondary }]}>
              🚀 Super fast, on-device compression
            </Text>
            <Text style={[styles.instructionsText, { color: theme.textSecondary }]}>
              🔒 100% private - no cloud upload
            </Text>
            <Text style={[styles.instructionsText, { color: theme.textSecondary }]}>
              ✅ No watermarks, ever
            </Text>
            {!isPremium && (
              <TouchableOpacity 
                style={styles.upgradeButtonInstructions}
                onPress={handleUpgrade}
              >
                <Text style={styles.upgradeButtonText}>
                  ✨ Upgrade to Pro - Unlock Batch Mode ($2.99)
                </Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Ad Banner Placeholder (for non-premium) */}
        {!isPremium && (
          <View style={[styles.adBanner, { backgroundColor: theme.border }]}>
            <Text style={[styles.adBannerText, { color: theme.textSecondary }]}>
              📢 Ad Space - Remove with Pro
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

// Theme definitions
const lightTheme = {
  background: '#f5f5f5',
  card: '#ffffff',
  text: '#333333',
  textSecondary: '#666666',
  border: '#e0e0e0',
  primary: '#007AFF'
};

const darkTheme = {
  background: '#000000',
  card: '#1C1C1E',
  text: '#FFFFFF',
  textSecondary: '#8E8E93',
  border: '#38383A',
  primary: '#0A84FF'
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingTop: 60,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 24,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  darkModeToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  toggleLabel: {
    fontSize: 18,
  },
  premiumBadge: {
    backgroundColor: '#FFD700',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  premiumBadgeText: {
    color: '#000',
    fontSize: 12,
    fontWeight: 'bold',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 16,
    marginTop: 4,
  },
  batchModeSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  batchModeContent: {
    flex: 1,
  },
  batchModeLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  batchModeDescription: {
    fontSize: 13,
  },
  primaryButton: {
    backgroundColor: '#007AFF',
    padding: 18,
    borderRadius: 14,
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
  },
  autoShrinkButton: {
    backgroundColor: '#FF2D55',
    padding: 18,
    borderRadius: 14,
    alignItems: 'center',
    marginBottom: 20,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
    shadowColor: '#FF2D55',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 5,
  },
  autoShrinkButtonDisabled: {
    backgroundColor: '#FF8FA3',
  },
  autoShrinkButtonIcon: {
    fontSize: 24,
  },
  autoShrinkButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  imageSection: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 16,
  },
  imagePreview: {
    width: '100%',
    height: 280,
    borderRadius: 12,
    backgroundColor: '#f0f0f0',
    resizeMode: 'contain',
  },
  fileSizeBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 8,
    marginTop: 12,
  },
  fileSizeLabel: {
    fontSize: 15,
    fontWeight: '500',
  },
  fileSizeValue: {
    fontSize: 15,
    fontWeight: '700',
  },
  socialPresetsScroll: {
    marginTop: 8,
  },
  socialPresetButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    marginRight: 10,
    alignItems: 'center',
    minWidth: 120,
    borderWidth: 2,
    borderColor: '#f0f0f0',
  },
  socialPresetButtonSelected: {
    backgroundColor: '#E8F4FF',
    borderColor: '#007AFF',
  },
  socialPresetIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  socialPresetLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    textAlign: 'center',
  },
  socialPresetLabelSelected: {
    color: '#007AFF',
  },
  compressionSection: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  compressionOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 2,
  },
  compressionOptionSelected: {
    borderColor: '#007AFF',
  },
  compressionOptionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  compressionOptionIcon: {
    fontSize: 28,
  },
  compressionOptionTextContent: {
    flex: 1,
  },
  compressionOptionTitle: {
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 4,
  },
  compressionOptionTitleSelected: {
    color: '#007AFF',
  },
  compressionOptionDescription: {
    fontSize: 13,
  },
  compressionOptionDescriptionSelected: {
    color: '#0055CC',
  },
  selectedIndicator: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#007AFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedIndicatorText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  compressButton: {
    backgroundColor: '#34C759',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 16,
    shadowColor: '#34C759',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  compressButtonDisabled: {
    backgroundColor: '#A8E6B8',
  },
  compressButtonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
  },
  comparisonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  comparisonColumn: {
    flex: 1,
    alignItems: 'center',
  },
  comparisonLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  comparisonImage: {
    width: '100%',
    height: 140,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
    resizeMode: 'contain',
  },
  comparisonSizeBox: {
    marginTop: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  comparisonSizeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  comparisonArrow: {
    paddingHorizontal: 8,
  },
  comparisonArrowText: {
    fontSize: 24,
    color: '#007AFF',
    fontWeight: 'bold',
  },
  savingsBoxEnhanced: {
    backgroundColor: '#34C759',
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  savingsPercentage: {
    color: '#fff',
    fontSize: 48,
    fontWeight: 'bold',
  },
  savingsLabel: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 2,
    marginTop: 4,
  },
  savingsBytesText: {
    color: '#fff',
    fontSize: 14,
    opacity: 0.9,
    marginTop: 8,
  },
  saveButton: {
    backgroundColor: '#FF9500',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#FF9500',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
  },
  instructions: {
    borderRadius: 16,
    padding: 24,
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  instructionsTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 16,
  },
  instructionsText: {
    fontSize: 15,
    marginBottom: 10,
    lineHeight: 22,
  },
  upgradeButtonInstructions: {
    backgroundColor: '#FFD700',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 16,
  },
  upgradeButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: '700',
  },
  adBanner: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 20,
  },
  adBannerText: {
    fontSize: 13,
    fontWeight: '600',
  },
});
