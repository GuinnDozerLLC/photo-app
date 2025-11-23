import { useState } from 'react';
import { StyleSheet, Text, View, Image, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

export default function App() {
  const [selectedImage, setSelectedImage] = useState(null);
  const [originalSize, setOriginalSize] = useState(null);
  const [compressedImage, setCompressedImage] = useState(null);
  const [compressedSize, setCompressedSize] = useState(null);
  const [compressionLevel, setCompressionLevel] = useState('balanced');
  const [isCompressing, setIsCompressing] = useState(false);

  // Compression presets
  const compressionPresets = {
    highQuality: { quality: 0.9, label: 'High Quality', description: 'Minimal compression' },
    balanced: { quality: 0.7, label: 'Balanced', description: 'Good quality, smaller size' },
    smallFile: { quality: 0.5, label: 'Small File', description: 'Maximum compression' }
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
    if (originalSize && compressedSize) {
      const savings = ((originalSize - compressedSize) / originalSize * 100).toFixed(1);
      return savings;
    }
    return 0;
  };

  // Pick image from gallery
  const pickImage = async () => {
    try {
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
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        const asset = result.assets[0];
        setSelectedImage(asset.uri);
        setCompressedImage(null);
        setCompressedSize(null);
        
        // Get original file size
        const fileInfo = await FileSystem.getInfoAsync(asset.uri);
        setOriginalSize(fileInfo.size);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image. Please try again.');
    }
  };

  // Compress the selected image
  const compressImage = async () => {
    if (!selectedImage) {
      Alert.alert('No Image', 'Please select an image first.');
      return;
    }

    setIsCompressing(true);
    try {
      const preset = compressionPresets[compressionLevel];
      
      // Compress image using ImageManipulator
      const manipulatedImage = await ImageManipulator.manipulateAsync(
        selectedImage,
        [], // No transformations, just compression
        {
          compress: preset.quality,
          format: ImageManipulator.SaveFormat.JPEG
        }
      );

      setCompressedImage(manipulatedImage.uri);
      
      // Get compressed file size
      const fileInfo = await FileSystem.getInfoAsync(manipulatedImage.uri);
      setCompressedSize(fileInfo.size);
    } catch (error) {
      console.error('Error compressing image:', error);
      Alert.alert('Error', 'Failed to compress image. Please try again.');
    } finally {
      setIsCompressing(false);
    }
  };

  // Save compressed image
  const saveImage = async () => {
    if (!compressedImage) {
      Alert.alert('No Compressed Image', 'Please compress an image first.');
      return;
    }

    try {
      // Check if sharing is available
      const isAvailable = await Sharing.isAvailableAsync();
      if (isAvailable) {
        await Sharing.shareAsync(compressedImage, {
          mimeType: 'image/jpeg',
          dialogTitle: 'Save or Share Your Compressed Image'
        });
      } else {
        Alert.alert('Success', 'Image has been compressed and is ready to use!');
      }
    } catch (error) {
      console.error('Error sharing image:', error);
      Alert.alert('Error', 'Failed to save/share image.');
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="auto" />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>QuickShrink</Text>
          <Text style={styles.subtitle}>Photo Compressor</Text>
        </View>

        {/* Select Image Button */}
        <TouchableOpacity style={styles.primaryButton} onPress={pickImage}>
          <Text style={styles.primaryButtonText}>
            {selectedImage ? 'Choose Different Photo' : 'Select Photo from Gallery'}
          </Text>
        </TouchableOpacity>

        {/* Display Selected Image */}
        {selectedImage && (
          <View style={styles.imageSection}>
            <Text style={styles.sectionTitle}>Original Image</Text>
            <Image source={{ uri: selectedImage }} style={styles.imagePreview} />
            <Text style={styles.fileSize}>File Size: {formatFileSize(originalSize)}</Text>
          </View>
        )}

        {/* Compression Level Selection */}
        {selectedImage && (
          <View style={styles.compressionSection}>
            <Text style={styles.sectionTitle}>Choose Compression Level</Text>
            
            {Object.entries(compressionPresets).map(([key, preset]) => (
              <TouchableOpacity
                key={key}
                style={[
                  styles.compressionOption,
                  compressionLevel === key && styles.compressionOptionSelected
                ]}
                onPress={() => setCompressionLevel(key)}
              >
                <View style={styles.compressionOptionContent}>
                  <Text style={[
                    styles.compressionOptionTitle,
                    compressionLevel === key && styles.compressionOptionTitleSelected
                  ]}>
                    {preset.label}
                  </Text>
                  <Text style={[
                    styles.compressionOptionDescription,
                    compressionLevel === key && styles.compressionOptionDescriptionSelected
                  ]}>
                    {preset.description}
                  </Text>
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
              onPress={compressImage}
              disabled={isCompressing}
            >
              {isCompressing ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.compressButtonText}>Compress Photo</Text>
              )}
            </TouchableOpacity>
          </View>
        )}

        {/* Display Compressed Image */}
        {compressedImage && (
          <View style={styles.imageSection}>
            <Text style={styles.sectionTitle}>Compressed Image</Text>
            <Image source={{ uri: compressedImage }} style={styles.imagePreview} />
            <Text style={styles.fileSize}>File Size: {formatFileSize(compressedSize)}</Text>
            <View style={styles.savingsBox}>
              <Text style={styles.savingsText}>
                Saved {calculateSavings()}% ({formatFileSize(originalSize - compressedSize)})
              </Text>
            </View>

            {/* Save/Share Button */}
            <TouchableOpacity style={styles.saveButton} onPress={saveImage}>
              <Text style={styles.saveButtonText}>Save / Share</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Instructions */}
        {!selectedImage && (
          <View style={styles.instructions}>
            <Text style={styles.instructionsTitle}>How to use:</Text>
            <Text style={styles.instructionsText}>1. Select a photo from your gallery</Text>
            <Text style={styles.instructionsText}>2. Choose compression level</Text>
            <Text style={styles.instructionsText}>3. Compress the photo</Text>
            <Text style={styles.instructionsText}>4. Save or share the smaller version</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContent: {
    padding: 20,
    paddingTop: 60,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
  },
  subtitle: {
    fontSize: 18,
    color: '#666',
    marginTop: 5,
  },
  primaryButton: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 20,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  imageSection: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  imagePreview: {
    width: '100%',
    height: 300,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
    resizeMode: 'contain',
  },
  fileSize: {
    fontSize: 16,
    color: '#666',
    marginTop: 12,
    textAlign: 'center',
  },
  compressionSection: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  compressionOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 8,
    backgroundColor: '#f9f9f9',
    marginBottom: 10,
    borderWidth: 2,
    borderColor: '#f9f9f9',
  },
  compressionOptionSelected: {
    backgroundColor: '#E8F4FF',
    borderColor: '#007AFF',
  },
  compressionOptionContent: {
    flex: 1,
  },
  compressionOptionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  compressionOptionTitleSelected: {
    color: '#007AFF',
  },
  compressionOptionDescription: {
    fontSize: 14,
    color: '#666',
  },
  compressionOptionDescriptionSelected: {
    color: '#0055CC',
  },
  selectedIndicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#007AFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedIndicatorText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  compressButton: {
    backgroundColor: '#34C759',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  compressButtonDisabled: {
    backgroundColor: '#A8E6B8',
  },
  compressButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  savingsBox: {
    backgroundColor: '#34C759',
    padding: 12,
    borderRadius: 8,
    marginTop: 12,
    alignItems: 'center',
  },
  savingsText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  saveButton: {
    backgroundColor: '#FF9500',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  instructions: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginTop: 20,
  },
  instructionsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  instructionsText: {
    fontSize: 15,
    color: '#666',
    marginBottom: 8,
    paddingLeft: 10,
  },
});
