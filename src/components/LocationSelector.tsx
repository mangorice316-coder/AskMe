import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import Svg, { Circle, Path, Line, Rect, Defs, RadialGradient, Stop } from 'react-native-svg';
import {
  MapPin,
  Navigation,
  Search,
  CheckCircle2,
  Edit2,
  Compass,
} from 'lucide-react-native';
import { THEME } from '../theme/tokens';
import {
  getCurrentDeviceLocation,
  reverseGeocodeCoords,
  searchLocationQuery,
  GeocodedAddress,
  LocationCoordinates,
} from '../services/locationService';
import { soundFx } from '../utils/soundEffects';

interface LocationSelectorProps {
  problemAddress: string;
  problemCity?: string;
  problemDistrict?: string;
  problemState?: string;
  problemCoords?: LocationCoordinates;
  onProblemLocationChange: (loc: {
    address: string;
    city?: string;
    district?: string;
    state?: string;
    coordinates?: LocationCoordinates;
  }) => void;
  senderAddress?: string;
  onSenderAddressChange?: (address: string) => void;
  showSenderAddressField?: boolean;
}

export default function LocationSelector({
  problemAddress,
  problemCity,
  problemDistrict,
  problemState,
  problemCoords,
  onProblemLocationChange,
}: LocationSelectorProps) {
  const [detecting, setDetecting] = useState(false);
  const [isEditingProblem, setIsEditingProblem] = useState(false);
  const [tempAddress, setTempAddress] = useState(problemAddress);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<GeocodedAddress[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const handleUseCurrentLocation = async () => {
    soundFx.playClick();
    try {
      setDetecting(true);
      const coords = await getCurrentDeviceLocation();
      const geocoded = await reverseGeocodeCoords(coords);

      onProblemLocationChange({
        address: geocoded.formattedAddress,
        city: geocoded.city,
        district: geocoded.district,
        state: geocoded.state,
        coordinates: coords,
      });
      setTempAddress(geocoded.formattedAddress);
      setIsEditingProblem(false);
      soundFx.playChime();
    } catch (err: any) {
      Alert.alert(
        'Location Detection',
        err.message || 'Could not fetch current GPS location. Please type the address manually.'
      );
    } finally {
      setDetecting(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    try {
      setIsSearching(true);
      const results = await searchLocationQuery(searchQuery);
      setSearchResults(results);
    } catch {
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const selectSearchResult = (item: GeocodedAddress) => {
    soundFx.playClick();
    onProblemLocationChange({
      address: item.formattedAddress,
      city: item.city,
      district: item.district,
      state: item.state,
      coordinates: item.coordinates,
    });
    setTempAddress(item.formattedAddress);
    setSearchResults([]);
    setSearchQuery('');
    setIsEditingProblem(false);
  };

  const handleSaveManualProblem = () => {
    soundFx.playClick();
    if (!tempAddress.trim()) {
      Alert.alert('Empty Address', 'Please provide a valid location.');
      return;
    }
    onProblemLocationChange({
      address: tempAddress,
      city: problemCity,
      district: problemDistrict,
      state: problemState,
      coordinates: problemCoords,
    });
    setIsEditingProblem(false);
  };

  return (
    <View style={styles.container}>
      {/* Header (from concept1_report_input_and_location.jpg) */}
      <View style={styles.headerRow}>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>Location Detected</Text>
          <Text style={styles.subtitle}>
            We've detected the location of the civic problem.
          </Text>
        </View>

        <TouchableOpacity
          style={styles.gpsButton}
          onPress={handleUseCurrentLocation}
          disabled={detecting}
          accessibilityRole="button"
          accessibilityLabel="Detect current GPS location"
        >
          {detecting ? (
            <ActivityIndicator size="small" color="#F47738" />
          ) : (
            <>
              <Navigation size={13} color="#F47738" />
              <Text style={styles.gpsButtonText}>Auto-Detect GPS</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      {/* Dark GIS Radar Map Preview (concept1_report_input_and_location.jpg right card) */}
      <View style={styles.mapCanvas}>
        <Svg width="100%" height={160} viewBox="0 0 340 160" fill="none">
          <Defs>
            <RadialGradient id="radarGlow" cx="50%" cy="50%" r="50%">
              <Stop offset="0%" stopColor="#F47738" stopOpacity="0.45" />
              <Stop offset="60%" stopColor="#F47738" stopOpacity="0.12" />
              <Stop offset="100%" stopColor="#F47738" stopOpacity="0" />
            </RadialGradient>
          </Defs>

          {/* Dark map terrain lines */}
          <Path
            d="M 10 30 Q 80 50 160 40 T 330 60"
            stroke="#2A2A26"
            strokeWidth="2.5"
            fill="none"
          />
          <Path
            d="M 20 120 Q 120 90 200 110 T 320 80"
            stroke="#2A2A26"
            strokeWidth="2"
            fill="none"
          />
          <Path
            d="M 60 10 Q 100 80 140 150"
            stroke="#2A2A26"
            strokeWidth="1.5"
            fill="none"
          />
          <Path
            d="M 220 10 Q 190 70 240 150"
            stroke="#2A2A26"
            strokeWidth="1.5"
            fill="none"
          />

          {/* Glowing road artery passing through location */}
          <Path
            d="M 40 140 L 170 80 L 300 20"
            stroke="#F47738"
            strokeWidth="1.8"
            strokeOpacity="0.5"
            fill="none"
          />

          {/* Radar Expansion Rings */}
          <Circle cx="170" cy="80" r="54" fill="url(#radarGlow)" />
          <Circle
            cx="170"
            cy="80"
            r="44"
            stroke="#F47738"
            strokeWidth="1.5"
            strokeOpacity="0.6"
            strokeDasharray="4 4"
            fill="none"
          />
          <Circle
            cx="170"
            cy="80"
            r="24"
            stroke="#F47738"
            strokeWidth="1.8"
            strokeOpacity="0.9"
            fill="none"
          />

          {/* Central Location Pin Icon */}
          <Circle cx="170" cy="80" r="10" fill="#F47738" />
          <Circle cx="170" cy="80" r="4" fill="#FFFFFF" />
        </Svg>

        <View style={styles.mapCoordsBadge}>
          <Compass size={11} color="#F47738" />
          <Text style={styles.mapCoordsText}>
            {problemCoords
              ? `${problemCoords.latitude.toFixed(4)}° N, ${problemCoords.longitude.toFixed(4)}° E`
              : 'GPS Geo-Lock Active'}
          </Text>
        </View>
      </View>

      {/* Detected Address Box */}
      {!isEditingProblem ? (
        <View style={styles.addressBox}>
          <View style={styles.addressContent}>
            <View style={styles.pinCircle}>
              <MapPin size={16} color="#F47738" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.addressLabel}>Detected Address</Text>
              <Text style={styles.addressText}>{problemAddress}</Text>
            </View>
          </View>

          <View style={styles.addressFooter}>
            <View style={styles.verifiedTag}>
              <CheckCircle2 size={12} color="#22C55E" />
              <Text style={styles.verifiedTagText}>Verified Location</Text>
            </View>

            <TouchableOpacity
              style={styles.editButton}
              onPress={() => {
                setTempAddress(problemAddress);
                setIsEditingProblem(true);
              }}
            >
              <Edit2 size={12} color="#F47738" />
              <Text style={styles.editButtonText}>Edit Address</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <View style={styles.manualEntryBox}>
          <TextInput
            style={styles.addressInput}
            value={tempAddress}
            onChangeText={setTempAddress}
            placeholder="Type street, landmark, area, city..."
            placeholderTextColor="#77736E"
            multiline
          />
          <View style={styles.manualActions}>
            <TouchableOpacity
              style={styles.saveLocationBtn}
              onPress={handleSaveManualProblem}
            >
              <CheckCircle2 size={14} color="#FFFFFF" />
              <Text style={styles.saveLocationBtnText}>Save Address</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={() => setIsEditingProblem(false)}
            >
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Quick Search */}
      <View style={styles.searchBarWrapper}>
        <View style={styles.searchBar}>
          <Search size={14} color="#77736E" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search landmark or road (e.g., MG Road, Koramangala)..."
            placeholderTextColor="#77736E"
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearch}
          />
          {isSearching ? (
            <ActivityIndicator size="small" color="#F47738" />
          ) : (
            <TouchableOpacity onPress={handleSearch}>
              <Text style={styles.searchButtonText}>Find</Text>
            </TouchableOpacity>
          )}
        </View>

        {searchResults.length > 0 && (
          <View style={styles.searchResultsDropdown}>
            {searchResults.map((item, idx) => (
              <TouchableOpacity
                key={idx}
                style={styles.searchResultItem}
                onPress={() => selectSearchResult(item)}
              >
                <MapPin size={13} color="#F47738" />
                <Text style={styles.searchResultText} numberOfLines={2}>
                  {item.formattedAddress}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#161615',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    padding: 22,
    gap: 16,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
    fontFamily: Platform.OS === 'web' ? 'Sora, sans-serif' : undefined,
  },
  subtitle: {
    fontSize: 12,
    color: '#8E8A83',
    marginTop: 2,
  },
  gpsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(244, 119, 56, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(244, 119, 56, 0.35)',
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: THEME.radii.pill,
  },
  gpsButtonText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#F47738',
    fontFamily: THEME.fonts.mono,
  },
  mapCanvas: {
    height: 160,
    backgroundColor: '#0F0F0E',
    borderRadius: 14,
    overflow: 'hidden',
    position: 'relative',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mapCoordsBadge: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(15, 15, 14, 0.85)',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  mapCoordsText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#A8A49D',
    fontFamily: THEME.fonts.mono,
  },
  addressBox: {
    backgroundColor: '#1E1E1C',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    padding: 16,
    gap: 12,
  },
  addressContent: {
    flexDirection: 'row',
    gap: 12,
  },
  pinCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(244, 119, 56, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(244, 119, 56, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addressLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#8E8A83',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    fontFamily: THEME.fonts.mono,
    marginBottom: 2,
  },
  addressText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    lineHeight: 20,
  },
  addressFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.06)',
  },
  verifiedTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  verifiedTagText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#22C55E',
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  editButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#F47738',
  },
  manualEntryBox: {
    gap: 10,
  },
  addressInput: {
    backgroundColor: '#1E1E1C',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#F47738',
    padding: 12,
    fontSize: 13,
    color: '#FFFFFF',
  },
  manualActions: {
    flexDirection: 'row',
    gap: 10,
  },
  saveLocationBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F47738',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: THEME.radii.pill,
  },
  saveLocationBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  cancelBtn: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    justifyContent: 'center',
  },
  cancelBtnText: {
    fontSize: 12,
    color: '#8E8A83',
  },
  searchBarWrapper: {
    marginTop: 2,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#1E1E1C',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: 12,
    height: 42,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: '#FFFFFF',
  },
  searchButtonText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#F47738',
  },
  searchResultsDropdown: {
    marginTop: 6,
    backgroundColor: '#1E1E1C',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    overflow: 'hidden',
  },
  searchResultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.06)',
  },
  searchResultText: {
    fontSize: 12,
    color: '#FFFFFF',
    flex: 1,
  },
});
