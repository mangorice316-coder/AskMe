import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  ActivityIndicator,
  Platform,
  Alert,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Camera, UploadCloud, X, MapPin, CheckCircle2 } from 'lucide-react-native';
import { THEME } from '../theme/tokens';
import { extractExifGps, reverseGeocodeCoords, LocationCoordinates } from '../services/locationService';

export interface PhotoItem {
  uri: string;
  base64?: string;
  isFromCamera?: boolean;
  detectedGps?: LocationCoordinates;
  exifAddress?: string;
}

interface PhotoUploaderProps {
  photos: PhotoItem[];
  onPhotosChange: (photos: PhotoItem[]) => void;
  onGpsDiscovered?: (coords: LocationCoordinates, address: string) => void;
}

export default function PhotoUploader({
  photos,
  onPhotosChange,
  onGpsDiscovered,
}: PhotoUploaderProps) {
  const [processing, setProcessing] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const handlePickImage = async () => {
    try {
      setProcessing(true);
      setStatusMessage('Selecting images...');

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsMultipleSelection: true,
        quality: 0.8,
        base64: true,
      });

      if (!result.canceled && result.assets) {
        processAssets(result.assets, false);
      }
    } catch (err: any) {
      Alert.alert('Image Selection Error', err.message || 'Could not pick image.');
    } finally {
      setProcessing(false);
      setStatusMessage(null);
    }
  };

  const handleCameraCapture = async () => {
    try {
      setProcessing(true);
      setStatusMessage('Opening camera...');

      const perm = await ImagePicker.requestCameraPermissionsAsync();
      if (!perm.granted) {
        Alert.alert('Camera Permission Required', 'Please enable camera access to take a photo of the civic issue.');
        setProcessing(false);
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        quality: 0.8,
        base64: true,
      });

      if (!result.canceled && result.assets) {
        processAssets(result.assets, true);
      }
    } catch (err: any) {
      Alert.alert('Camera Error', err.message || 'Could not launch camera.');
    } finally {
      setProcessing(false);
      setStatusMessage(null);
    }
  };

  const processAssets = async (assets: ImagePicker.ImagePickerAsset[], isFromCamera: boolean) => {
    const newItems: PhotoItem[] = [];

    for (const asset of assets) {
      let gpsCoords: LocationCoordinates | null = null;
      let exifAddress: string | undefined = undefined;

      // Extract EXIF GPS on Web via binary array buffer
      if (Platform.OS === 'web' && asset.uri) {
        try {
          const res = await fetch(asset.uri);
          const buf = await res.arrayBuffer();
          gpsCoords = extractExifGps(buf);
          if (gpsCoords) {
            const geocoded = await reverseGeocodeCoords(gpsCoords);
            exifAddress = geocoded.formattedAddress;
            if (onGpsDiscovered) {
              onGpsDiscovered(gpsCoords, geocoded.formattedAddress);
            }
          }
        } catch {
          // EXIF reading skipped
        }
      }

      newItems.push({
        uri: asset.uri,
        base64: asset.base64 || undefined,
        isFromCamera,
        detectedGps: gpsCoords || undefined,
        exifAddress,
      });
    }

    onPhotosChange([...photos, ...newItems]);
  };

  const handleRemovePhoto = (index: number) => {
    const next = [...photos];
    next.splice(index, 1);
    onPhotosChange(next);
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerBlock}>
        <Text style={styles.componentLabel}>Upload a Photo</Text>
        <Text style={styles.componentSub}>Show us what happened.</Text>
      </View>

      {/* Upload action triggers */}
      <View style={styles.actionRow}>
        <TouchableOpacity
          style={styles.uploadCard}
          onPress={handlePickImage}
          disabled={processing}
          accessibilityRole="button"
          accessibilityLabel="Upload photo evidence from device"
        >
          <View style={styles.iconCircle}>
            <UploadCloud size={22} color={THEME.colors.brandOrange} />
          </View>
          <Text style={styles.cardTitle}>Choose Images</Text>
          <Text style={styles.cardSubtitle}>JPG, PNG, or WEBP from device</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.uploadCard, styles.cameraCard]}
          onPress={handleCameraCapture}
          disabled={processing}
          accessibilityRole="button"
          accessibilityLabel="Capture photo with camera"
        >
          <View style={[styles.iconCircle, { backgroundColor: THEME.colors.softOrange }]}>
            <Camera size={22} color={THEME.colors.brandOrange} />
          </View>
          <Text style={styles.cardTitle}>Live Camera</Text>
          <Text style={styles.cardSubtitle}>Take a photo right now</Text>
        </TouchableOpacity>
      </View>

      {processing && (
        <View style={styles.statusRow}>
          <ActivityIndicator size="small" color={THEME.colors.brandOrange} />
          <Text style={styles.statusText}>{statusMessage || 'Processing...'}</Text>
        </View>
      )}

      {/* Thumbnails preview list */}
      {photos.length > 0 && (
        <View style={styles.previewContainer}>
          <Text style={styles.previewHeader}>
            Attached Evidence ({photos.length})
          </Text>
          <View style={styles.grid}>
            {photos.map((item, idx) => (
              <View key={`${item.uri}-${idx}`} style={styles.thumbnailWrapper}>
                <Image source={{ uri: item.uri }} style={styles.thumbnail} />
                <TouchableOpacity
                  style={styles.removeBtn}
                  onPress={() => handleRemovePhoto(idx)}
                  accessibilityRole="button"
                  accessibilityLabel="Remove photo"
                >
                  <X size={14} color="#FFFFFF" />
                </TouchableOpacity>

                {item.detectedGps && (
                  <View style={styles.exifBadge}>
                    <MapPin size={9} color="#FFFFFF" />
                    <Text style={styles.exifBadgeText}>EXIF GPS</Text>
                  </View>
                )}
              </View>
            ))}
          </View>

          {photos.some((p) => p.detectedGps) && (
            <View style={styles.exifNotice}>
              <CheckCircle2 size={15} color={THEME.colors.success} />
              <Text style={styles.exifNoticeText}>
                GPS coordinates found in photograph EXIF metadata.
              </Text>
            </View>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#161615',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: THEME.radii.lg,
    padding: 18,
  },
  headerBlock: {
    marginBottom: 14,
  },
  componentLabel: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
    fontFamily: Platform.OS === 'web' ? 'Sora, sans-serif' : undefined,
  },
  componentSub: {
    fontSize: 12,
    color: '#8E8A83',
    marginTop: 1,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 12,
  },
  uploadCard: {
    flex: 1,
    backgroundColor: '#1E1E1C',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    borderStyle: 'dashed',
    borderRadius: THEME.radii.md,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 110,
  },
  cameraCard: {
    borderStyle: 'solid',
    borderColor: 'rgba(244, 119, 56, 0.35)',
    backgroundColor: '#221D18',
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(244, 119, 56, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  cardSubtitle: {
    fontSize: 11,
    color: '#8E8A83',
    textAlign: 'center',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 10,
  },
  statusText: {
    fontSize: 12,
    color: '#A8A49D',
  },
  previewContainer: {
    marginTop: 16,
    backgroundColor: '#1E1E1C',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: THEME.radii.md,
    padding: 12,
  },
  previewHeader: {
    fontSize: 11,
    fontWeight: '700',
    color: '#8E8A83',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 10,
    fontFamily: THEME.fonts.mono,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  thumbnailWrapper: {
    width: 80,
    height: 80,
    borderRadius: 8,
    overflow: 'hidden',
    position: 'relative',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  thumbnail: {
    width: '100%',
    height: '100%',
  },
  removeBtn: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  exifBadge: {
    position: 'absolute',
    bottom: 4,
    left: 4,
    backgroundColor: '#F47738',
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 3,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  exifBadgeText: {
    fontSize: 8,
    fontWeight: '800',
    color: '#FFFFFF',
    fontFamily: THEME.fonts.mono,
  },
  exifNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.06)',
  },
  exifNoticeText: {
    fontSize: 12,
    color: '#22C55E',
    fontWeight: '600',
  },
});
