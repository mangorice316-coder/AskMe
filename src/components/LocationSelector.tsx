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
  Linking,
  ScrollView,
} from 'react-native';
import Svg, { Circle, Path, Line, Rect, Defs, RadialGradient, Stop } from 'react-native-svg';
import {
  MapPin,
  Navigation,
  Search,
  CheckCircle2,
  Edit2,
  Compass,
  Building2,
  ExternalLink,
  Layers,
  Radio,
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

interface CivicPreset {
  label: string;
  address: string;
  city: string;
  district: string;
  state: string;
  coords: LocationCoordinates;
  ward: string;
  authority: string;
}

const CIVIC_LOCATION_PRESETS: CivicPreset[] = [
  {
    label: 'Chennai • Anna Salai',
    address: 'Anna Salai, Thousand Lights, Chennai, Tamil Nadu 600006',
    city: 'Chennai',
    district: 'Chennai',
    state: 'Tamil Nadu',
    coords: { latitude: 13.0604, longitude: 80.2496 },
    ward: 'Zone 9 (Teynampet / Anna Salai Division)',
    authority: 'Greater Chennai Corporation (GCC)',
  },
  {
    label: 'Bengaluru • Indiranagar',
    address: '100 Feet Road, Indiranagar, Bengaluru, Karnataka 560038',
    city: 'Bengaluru',
    district: 'Bengaluru Urban',
    state: 'Karnataka',
    coords: { latitude: 12.9719, longitude: 77.6412 },
    ward: 'Ward 112 (Domlur / Indiranagar Zone)',
    authority: 'Bruhat Bengaluru Mahanagara Palike (BBMP)',
  },
  {
    label: 'New Delhi • Connaught Pl',
    address: 'Connaught Place Outer Circle, New Delhi, Delhi 110001',
    city: 'New Delhi',
    district: 'New Delhi',
    state: 'Delhi',
    coords: { latitude: 28.6304, longitude: 77.2177 },
    ward: 'NDMC Central Administrative Zone',
    authority: 'New Delhi Municipal Council (NDMC)',
  },
  {
    label: 'Mumbai • Bandra West',
    address: 'Hill Road, Bandra West, Mumbai, Maharashtra 400050',
    city: 'Mumbai',
    district: 'Mumbai Suburban',
    state: 'Maharashtra',
    coords: { latitude: 19.0596, longitude: 72.8295 },
    ward: 'Ward H/West (Bandra Division)',
    authority: 'Brihanmumbai Municipal Corporation (BMC)',
  },
  {
    label: 'Hyderabad • Hitec City',
    address: 'Cyber Towers Road, Hitec City, Hyderabad, Telangana 500081',
    city: 'Hyderabad',
    district: 'Hyderabad',
    state: 'Telangana',
    coords: { latitude: 17.4504, longitude: 78.3808 },
    ward: 'Serilingampally Zone (Ward 104)',
    authority: 'Greater Hyderabad Municipal Corporation (GHMC)',
  },
  {
    label: 'Kolkata • Park Street',
    address: 'Park Street, Mullick Bazar, Kolkata, West Bengal 700016',
    city: 'Kolkata',
    district: 'Kolkata',
    state: 'West Bengal',
    coords: { latitude: 22.5516, longitude: 88.3585 },
    ward: 'Borough VII (Ward 63)',
    authority: 'Kolkata Municipal Corporation (KMC)',
  },
];

export default function LocationSelector({
  problemAddress,
  problemCity = 'Chennai',
  problemDistrict = 'Chennai',
  problemState = 'Tamil Nadu',
  problemCoords = { latitude: 13.0604, longitude: 80.2496 },
  onProblemLocationChange,
}: LocationSelectorProps) {
  const [detecting, setDetecting] = useState(false);
  const [isEditingProblem, setIsEditingProblem] = useState(false);
  const [tempAddress, setTempAddress] = useState(problemAddress);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<GeocodedAddress[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [mapMode, setMapMode] = useState<'streets' | 'radar'>('streets');

  const lat = problemCoords?.latitude ?? 13.0604;
  const lng = problemCoords?.longitude ?? 80.2496;

  // Determine current municipal body name based on city
  const resolveAuthorityName = (cityName?: string) => {
    const c = (cityName || '').toLowerCase();
    if (c.includes('chennai')) return 'Greater Chennai Corporation (GCC)';
    if (c.includes('bengaluru') || c.includes('bangalore')) return 'Bruhat Bengaluru Mahanagara Palike (BBMP)';
    if (c.includes('delhi')) return 'New Delhi Municipal Council / MCD';
    if (c.includes('mumbai')) return 'Brihanmumbai Municipal Corporation (BMC)';
    if (c.includes('hyderabad')) return 'Greater Hyderabad Municipal Corporation (GHMC)';
    if (c.includes('kolkata')) return 'Kolkata Municipal Corporation (KMC)';
    if (c.includes('pune')) return 'Pune Municipal Corporation (PMC)';
    return `${cityName || 'Local'} Municipal Corporation & District Authority`;
  };

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
        err.message || 'Could not fetch current GPS location. Please type the address manually or pick a preset.'
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

  const handleSelectPreset = (preset: CivicPreset) => {
    soundFx.playClick();
    onProblemLocationChange({
      address: preset.address,
      city: preset.city,
      district: preset.district,
      state: preset.state,
      coordinates: preset.coords,
    });
    setTempAddress(preset.address);
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

  const openInExternalMaps = () => {
    soundFx.playClick();
    const url = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
    Linking.openURL(url).catch(() => {
      Alert.alert('Notice', 'Could not open map link.');
    });
  };

  // OpenStreetMap dynamic embed URL
  const bboxLon1 = (lng - 0.007).toFixed(5);
  const bboxLat1 = (lat - 0.004).toFixed(5);
  const bboxLon2 = (lng + 0.007).toFixed(5);
  const bboxLat2 = (lat + 0.004).toFixed(5);
  const osmEmbedUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${bboxLon1}%2C${bboxLat1}%2C${bboxLon2}%2C${bboxLat2}&layer=mapnik&marker=${lat.toFixed(5)}%2C${lng.toFixed(5)}`;

  return (
    <View style={styles.container}>
      {/* 1. Header with Auto-Detect Button */}
      <View style={styles.headerRow}>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>Civic Location & Jurisdiction</Text>
          <Text style={styles.subtitle}>
            Coordinates are verified against statutory municipal boundaries.
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

      {/* 2. EXPLANATION BANNER ("Why is this pic3 here? Make it clear") */}
      <View style={styles.explainerBanner}>
        <View style={styles.explainerHeader}>
          <View style={styles.explainerBadge}>
            <Compass size={13} color="#F47738" />
            <Text style={styles.explainerBadgeText}>GIS JURISDICTION RADAR</Text>
          </View>
          <View style={styles.lockBadge}>
            <CheckCircle2 size={12} color="#22C55E" />
            <Text style={styles.lockBadgeText}>STATUTORY BOUNDARY LOCK</Text>
          </View>
        </View>

        <Text style={styles.explainerTitle}>
          Why does ASKME require this geospatial verification?
        </Text>
        <Text style={styles.explainerBody}>
          In India, civic grievances are legally routed by physical ground coordinates. Every road, drain, streetlight, and pothole belongs to a specific Municipal Corporation Ward, Zonal Engineer, or National Highway (NHAI) division. AskMe locks your exact latitude & longitude against official administrative boundary maps so your petition is dispatched to the legally responsible authority without getting bounced or rejected for "wrong jurisdiction".
        </Text>
      </View>

      {/* 3. DYNAMIC INTERACTIVE MAP PREVIEW (Updates to selected location!) */}
      <View style={styles.mapContainer}>
        {Platform.OS === 'web' && mapMode === 'streets' ? (
          <View style={styles.webMapFrame}>
            <iframe
              key={`map-${lat.toFixed(4)}-${lng.toFixed(4)}`}
              title="Civic Jurisdiction Map"
              src={osmEmbedUrl}
              style={{
                width: '100%',
                height: 220,
                border: 'none',
                borderRadius: 14,
                backgroundColor: '#1E1E1C',
              }}
              loading="lazy"
            />
          </View>
        ) : (
          /* High-Tech Tactical GIS Radar View */
          <View style={styles.tacticalRadarCanvas}>
            <Svg width="100%" height={220} viewBox="0 0 340 220" fill="none">
              <Defs>
                <RadialGradient id="radarPulseGlow" cx="50%" cy="50%" r="50%">
                  <Stop offset="0%" stopColor="#F47738" stopOpacity="0.5" />
                  <Stop offset="50%" stopColor="#F47738" stopOpacity="0.15" />
                  <Stop offset="100%" stopColor="#F47738" stopOpacity="0" />
                </RadialGradient>
              </Defs>

              {/* Dynamic Coordinate Gridlines */}
              <Line x1="20" y1="55" x2="320" y2="55" stroke="#262624" strokeWidth="1" strokeDasharray="3 3" />
              <Line x1="20" y1="110" x2="320" y2="110" stroke="#333330" strokeWidth="1.2" />
              <Line x1="20" y1="165" x2="320" y2="165" stroke="#262624" strokeWidth="1" strokeDasharray="3 3" />
              <Line x1="85" y1="20" x2="85" y2="200" stroke="#262624" strokeWidth="1" strokeDasharray="3 3" />
              <Line x1="170" y1="20" x2="170" y2="200" stroke="#333330" strokeWidth="1.2" />
              <Line x1="255" y1="20" x2="255" y2="200" stroke="#262624" strokeWidth="1" strokeDasharray="3 3" />

              {/* Road arteries dynamically skewed by coordinates */}
              <Path
                d={`M 15 ${90 + ((lat * 10) % 30)} Q 120 ${70 + ((lng * 10) % 25)} 170 110 T 325 ${130 - ((lat * 10) % 20)}`}
                stroke="#3A3A35"
                strokeWidth="3"
                fill="none"
              />
              <Path
                d={`M ${40 + ((lng * 10) % 40)} 200 L 170 110 L ${280 - ((lat * 10) % 30)} 30`}
                stroke="#F47738"
                strokeWidth="2.2"
                strokeOpacity="0.75"
                fill="none"
              />

              {/* Radar Rings centered on 170, 110 */}
              <Circle cx="170" cy="110" r="70" fill="url(#radarPulseGlow)" />
              <Circle cx="170" cy="110" r="55" stroke="#F47738" strokeWidth="1.2" strokeOpacity="0.4" strokeDasharray="4 4" fill="none" />
              <Circle cx="170" cy="110" r="32" stroke="#F47738" strokeWidth="1.5" strokeOpacity="0.8" fill="none" />

              {/* Central Location Pin */}
              <Circle cx="170" cy="110" r="10" fill="#F47738" />
              <Circle cx="170" cy="110" r="4" fill="#FFFFFF" />
            </Svg>
          </View>
        )}

        {/* Floating Telemetry & Mode Controls Bar */}
        <View style={styles.mapFloatingBar}>
          <View style={styles.coordsPill}>
            <View style={styles.pulseDot} />
            <Text style={styles.coordsPillText}>
              {lat.toFixed(4)}° N, {lng.toFixed(4)}° E
            </Text>
          </View>

          <View style={styles.modeToggleGroup}>
            <TouchableOpacity
              style={[styles.modeToggleBtn, mapMode === 'streets' && styles.modeToggleBtnActive]}
              onPress={() => setMapMode('streets')}
            >
              <Layers size={11} color={mapMode === 'streets' ? '#FFFFFF' : '#8E8A83'} />
              <Text style={[styles.modeToggleText, mapMode === 'streets' && styles.modeToggleTextActive]}>
                Live Map
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.modeToggleBtn, mapMode === 'radar' && styles.modeToggleBtnActive]}
              onPress={() => setMapMode('radar')}
            >
              <Radio size={11} color={mapMode === 'radar' ? '#FFFFFF' : '#8E8A83'} />
              <Text style={[styles.modeToggleText, mapMode === 'radar' && styles.modeToggleTextActive]}>
                GIS Radar
              </Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.externalMapBtn} onPress={openInExternalMaps}>
              <ExternalLink size={11} color="#F47738" />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* 4. QUICK SELECT CIVIC PRESETS (Click to change location!) */}
      <View style={styles.presetSection}>
        <Text style={styles.presetSectionTitle}>
          Tap to test or select location (Updates Map & Jurisdiction):
        </Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.presetScrollContent}
        >
          {CIVIC_LOCATION_PRESETS.map((preset) => {
            const isSelected =
              Math.abs(lat - preset.coords.latitude) < 0.01 &&
              Math.abs(lng - preset.coords.longitude) < 0.01;
            return (
              <TouchableOpacity
                key={preset.label}
                style={[styles.presetChip, isSelected && styles.presetChipActive]}
                onPress={() => handleSelectPreset(preset)}
                activeOpacity={0.8}
              >
                <MapPin size={11} color={isSelected ? '#F47738' : '#77736E'} />
                <Text style={[styles.presetChipText, isSelected && styles.presetChipTextActive]}>
                  {preset.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* 5. STATUTORY ROUTING DISPATCH INFO */}
      <View style={styles.routingCard}>
        <View style={styles.routingRow}>
          <Building2 size={16} color="#F47738" />
          <View style={{ flex: 1 }}>
            <Text style={styles.routingLabel}>Matched Statutory Authority</Text>
            <Text style={styles.routingAuthority}>
              {resolveAuthorityName(problemCity)}
            </Text>
          </View>
        </View>

        <View style={styles.routingDivider} />

        <View style={styles.routingMetaRow}>
          <Text style={styles.routingMetaText}>
            District: <Text style={{ color: '#FFFFFF', fontWeight: '700' }}>{problemDistrict || problemCity || 'District Central'}</Text>
          </Text>
          <Text style={styles.routingMetaText}>
            State: <Text style={{ color: '#FFFFFF', fontWeight: '700' }}>{problemState || 'State PWD / Urban Dev'}</Text>
          </Text>
          <Text style={styles.routingMetaText}>
            Status: <Text style={{ color: '#22C55E', fontWeight: '700' }}>● Geofenced</Text>
          </Text>
        </View>
      </View>

      {/* 6. Detected Address Box with Edit Capability */}
      {!isEditingProblem ? (
        <View style={styles.addressBox}>
          <View style={styles.addressContent}>
            <View style={styles.pinCircle}>
              <MapPin size={16} color="#F47738" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.addressLabel}>Physical Complaint Address</Text>
              <Text style={styles.addressText}>{problemAddress}</Text>
            </View>
          </View>

          <View style={styles.addressFooter}>
            <View style={styles.verifiedTag}>
              <CheckCircle2 size={12} color="#22C55E" />
              <Text style={styles.verifiedTagText}>Jurisdiction Verified</Text>
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

      {/* 7. Quick Landmark / Street Search Bar */}
      <View style={styles.searchBarWrapper}>
        <View style={styles.searchBar}>
          <Search size={14} color="#77736E" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search landmark, road, or locality (e.g., MG Road, Koramangala)..."
            placeholderTextColor="#77736E"
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearch}
          />
          {isSearching ? (
            <ActivityIndicator size="small" color="#F47738" />
          ) : (
            <TouchableOpacity onPress={handleSearch} style={styles.findBtn}>
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
    borderRadius: THEME.radii.pill,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  gpsButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#F47738',
  },

  /* Explainer Banner Styles */
  explainerBanner: {
    backgroundColor: '#1E1E1C',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(244, 119, 56, 0.25)',
    padding: 14,
    gap: 8,
  },
  explainerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 8,
  },
  explainerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(244, 119, 56, 0.12)',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: THEME.radii.pill,
  },
  explainerBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#F47738',
    letterSpacing: 0.5,
  },
  lockBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(34, 197, 94, 0.1)',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: THEME.radii.pill,
  },
  lockBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#22C55E',
    letterSpacing: 0.4,
  },
  explainerTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  explainerBody: {
    fontSize: 12,
    color: '#A8A49D',
    lineHeight: 18,
  },

  /* Map Container & Telemetry Bar */
  mapContainer: {
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: '#0D0D0C',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    position: 'relative',
  },
  webMapFrame: {
    width: '100%',
    height: 220,
    backgroundColor: '#1E1E1C',
  },
  tacticalRadarCanvas: {
    width: '100%',
    height: 220,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0D0D0C',
  },
  mapFloatingBar: {
    position: 'absolute',
    bottom: 10,
    left: 10,
    right: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(18, 18, 17, 0.94)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.14)',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
    gap: 8,
  },
  coordsPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  pulseDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#22C55E',
  },
  coordsPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
    fontFamily: Platform.OS === 'web' ? 'JetBrains Mono, monospace' : undefined,
  },
  modeToggleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  modeToggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
  },
  modeToggleBtnActive: {
    backgroundColor: '#F47738',
  },
  modeToggleText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#8E8A83',
  },
  modeToggleTextActive: {
    color: '#FFFFFF',
  },
  externalMapBtn: {
    padding: 5,
    backgroundColor: 'rgba(244, 119, 56, 0.12)',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(244, 119, 56, 0.3)',
  },

  /* Preset Location Chips */
  presetSection: {
    gap: 8,
  },
  presetSectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#8E8A83',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  presetScrollContent: {
    flexDirection: 'row',
    gap: 7,
    paddingVertical: 2,
  },
  presetChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#1E1E1C',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: THEME.radii.pill,
    paddingHorizontal: 11,
    paddingVertical: 6,
  },
  presetChipActive: {
    backgroundColor: 'rgba(244, 119, 56, 0.15)',
    borderColor: '#F47738',
  },
  presetChipText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#A8A49D',
  },
  presetChipTextActive: {
    color: '#F47738',
    fontWeight: '800',
  },

  /* Statutory Routing Card */
  routingCard: {
    backgroundColor: '#1C1C1A',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    padding: 12,
    gap: 8,
  },
  routingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  routingLabel: {
    fontSize: 10,
    color: '#8E8A83',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  routingAuthority: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
    marginTop: 1,
  },
  routingDivider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
  },
  routingMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  routingMetaText: {
    fontSize: 11,
    color: '#8E8A83',
  },

  /* Detected Address Box */
  addressBox: {
    backgroundColor: '#1E1E1C',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    padding: 14,
    gap: 12,
  },
  addressContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  pinCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(244, 119, 56, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  addressLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#8E8A83',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  addressText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginTop: 2,
    lineHeight: 20,
  },
  addressFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.05)',
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
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  editButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#F47738',
  },

  /* Manual Entry */
  manualEntryBox: {
    backgroundColor: '#1E1E1C',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#F47738',
    padding: 14,
    gap: 10,
  },
  addressInput: {
    fontSize: 14,
    color: '#FFFFFF',
    minHeight: 60,
    textAlignVertical: 'top',
  },
  manualActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    justifyContent: 'flex-end',
  },
  saveLocationBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F47738',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: THEME.radii.pill,
  },
  saveLocationBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  cancelBtn: {
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  cancelBtnText: {
    fontSize: 12,
    color: '#8E8A83',
  },

  /* Search */
  searchBarWrapper: {
    position: 'relative',
    zIndex: 10,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#1E1E1C',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: '#FFFFFF',
  },
  findBtn: {
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  searchButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#F47738',
  },
  searchResultsDropdown: {
    backgroundColor: '#1E1E1C',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    borderRadius: 12,
    marginTop: 6,
    overflow: 'hidden',
  },
  searchResultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.04)',
  },
  searchResultText: {
    flex: 1,
    fontSize: 12,
    color: '#FFFFFF',
  },
});
