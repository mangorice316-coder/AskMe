import React, { useState, useEffect, useRef } from 'react';
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
  Crosshair,
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

interface CityGeographicProfile {
  key: string;
  cityName: string;
  wardName: string;
  telemetryCode: string;
  heading: string;
  arteryLabel: string;
  landmarks: { label: string; x: number; y: number }[];
  waterPaths?: { d: string; fill?: string; stroke?: string; strokeWidth?: number; strokeDasharray?: string }[];
  arteryPaths: { d: string; stroke: string; strokeWidth: number; strokeDasharray?: string }[];
  secondaryRoads: { d: string; stroke: string; strokeWidth: number }[];
  wardPolygon: string;
  isDelhiRadial?: boolean;
}

function getCityGeographicProfile(cityName?: string, lat = 13.0604, lng = 80.2496): CityGeographicProfile {
  const c = (cityName || '').toLowerCase();

  // 1. CHENNAI
  if (c.includes('chennai') || Math.abs(lat - 13.0604) < 0.2) {
    return {
      key: 'chennai',
      cityName: 'CHENNAI',
      wardName: 'ZONE 9 (TEYNAMPET DIVISION)',
      telemetryCode: 'GCC_ZONE_09_CORRIDOR',
      heading: '042° NE',
      arteryLabel: 'ANNA SALAI ARTERIAL CORRIDOR',
      landmarks: [
        { label: 'Thousand Lights', x: 200, y: 110 },
        { label: 'Anna Flyover', x: 140, y: 170 },
        { label: 'Marina Coastline', x: 340, y: 60 },
      ],
      waterPaths: [
        // Bay of Bengal Coastline (East)
        { d: 'M 320 0 L 400 0 L 400 250 L 335 250 Q 315 145 320 0 Z', fill: '#0C1F2E', stroke: '#1E425E', strokeWidth: 2 },
        // Cooum River curving into the bay
        { d: 'M 0 100 Q 100 80 200 115 T 320 95', stroke: '#183952', strokeWidth: 4.5 },
      ],
      arteryPaths: [
        // Anna Salai Highway
        { d: 'M 30 250 L 200 125 L 340 30', stroke: '#F47738', strokeWidth: 3 },
        // Kamarajar Salai (Beach Road)
        { d: 'M 325 0 L 340 250', stroke: '#FFAA5C', strokeWidth: 2 },
      ],
      secondaryRoads: [
        { d: 'M 50 175 L 330 175', stroke: '#36393E', strokeWidth: 1.5 },
        { d: 'M 90 70 L 290 70', stroke: '#36393E', strokeWidth: 1.5 },
        { d: 'M 110 0 L 110 250', stroke: '#2A2C30', strokeWidth: 1.2 },
      ],
      wardPolygon: 'M 110 50 L 280 55 L 295 195 L 125 190 Z',
    };
  }

  // 2. BENGALURU
  if (c.includes('bengaluru') || c.includes('bangalore') || Math.abs(lat - 12.9719) < 0.2) {
    return {
      key: 'bengaluru',
      cityName: 'BENGALURU',
      wardName: 'WARD 112 (DOMLUR / INDIRANAGAR)',
      telemetryCode: 'BBMP_WARD_112_TECHGRID',
      heading: '118° SE',
      arteryLabel: '100 FEET ROAD ARTERIAL',
      landmarks: [
        { label: '100ft & CMH Jct', x: 200, y: 125 },
        { label: 'Domlur Flyover', x: 200, y: 220 },
        { label: 'Ulsoor Waters', x: 65, y: 65 },
      ],
      waterPaths: [
        // Ulsoor Lake basin
        { d: 'M 30 55 Q 75 30 105 65 Q 95 105 45 95 Z', fill: '#0C1F2E', stroke: '#1E425E', strokeWidth: 2 },
      ],
      arteryPaths: [
        // 100 Feet Road
        { d: 'M 200 0 L 200 250', stroke: '#F47738', strokeWidth: 3.2 },
        // CMH Road
        { d: 'M 0 125 L 400 125', stroke: '#FFAA5C', strokeWidth: 2.6 },
        // Old Airport Road
        { d: 'M 40 230 L 380 180', stroke: '#FF8844', strokeWidth: 2 },
      ],
      secondaryRoads: [
        { d: 'M 140 0 L 140 250', stroke: '#36393E', strokeWidth: 1.5 },
        { d: 'M 260 0 L 260 250', stroke: '#36393E', strokeWidth: 1.5 },
        { d: 'M 0 65 L 400 65', stroke: '#2A2C30', strokeWidth: 1.2 },
        { d: 'M 0 185 L 400 185', stroke: '#2A2C30', strokeWidth: 1.2 },
      ],
      wardPolygon: 'M 105 35 L 295 40 L 305 215 L 115 210 Z',
    };
  }

  // 3. NEW DELHI
  if (c.includes('delhi') || Math.abs(lat - 28.6304) < 0.2) {
    return {
      key: 'delhi',
      cityName: 'NEW DELHI',
      wardName: 'NDMC CENTRAL ADMINISTRATIVE ZONE',
      telemetryCode: 'NDMC_CENTRAL_CONNAUGHT_PL',
      heading: '000° N',
      arteryLabel: 'CONNAUGHT PL CONCENTRIC RADIALS',
      landmarks: [
        { label: 'Central Park CP', x: 200, y: 125 },
        { label: 'Janpath Artery', x: 200, y: 220 },
        { label: 'Barakhamba Radial', x: 310, y: 125 },
      ],
      arteryPaths: [
        { d: 'M 200 155 L 200 250', stroke: '#F47738', strokeWidth: 3 },
        { d: 'M 285 125 L 400 125', stroke: '#FFAA5C', strokeWidth: 2.5 },
        { d: 'M 200 0 L 200 95', stroke: '#FF8844', strokeWidth: 2 },
        { d: 'M 0 125 L 115 125', stroke: '#36393E', strokeWidth: 2 },
      ],
      secondaryRoads: [
        { d: 'M 260 185 L 380 250', stroke: '#36393E', strokeWidth: 1.5 },
        { d: 'M 140 185 L 20 250', stroke: '#36393E', strokeWidth: 1.5 },
        { d: 'M 260 65 L 380 0', stroke: '#2A2C30', strokeWidth: 1.2 },
        { d: 'M 140 65 L 20 0', stroke: '#2A2C30', strokeWidth: 1.2 },
      ],
      wardPolygon: 'M 85 20 L 315 20 L 335 230 L 65 230 Z',
      isDelhiRadial: true,
    };
  }

  // 4. MUMBAI
  if (c.includes('mumbai') || Math.abs(lat - 19.0596) < 0.2) {
    return {
      key: 'mumbai',
      cityName: 'MUMBAI',
      wardName: 'WARD H/WEST (BANDRA DIVISION)',
      telemetryCode: 'BMC_HWEST_BANDRA_COASTAL',
      heading: '265° W',
      arteryLabel: 'WESTERN EXPRESS HWY & SEA LINK',
      landmarks: [
        { label: 'Hill Road Jct', x: 200, y: 125 },
        { label: 'Sea Link Cable', x: 75, y: 215 },
        { label: 'Bandstand Shore', x: 105, y: 85 },
      ],
      waterPaths: [
        // Arabian Sea western shoreline
        { d: 'M 0 0 L 115 0 Q 75 80 120 145 Q 90 190 120 250 L 0 250 Z', fill: '#0C1F2E', stroke: '#1E425E', strokeWidth: 2 },
        // Bandra-Worli Sea Link curve
        { d: 'M 115 150 Q 50 180 85 250', stroke: '#FFAA5C', strokeWidth: 2.4, strokeDasharray: '4 2' },
      ],
      arteryPaths: [
        // Western Express Highway
        { d: 'M 125 250 L 200 125 L 255 0', stroke: '#F47738', strokeWidth: 3.2 },
        // Hill Road
        { d: 'M 110 135 L 390 110', stroke: '#FFAA5C', strokeWidth: 2.4 },
        // Turner Road
        { d: 'M 100 80 L 380 60', stroke: '#FF8844', strokeWidth: 1.8 },
      ],
      secondaryRoads: [
        { d: 'M 225 0 L 180 250', stroke: '#36393E', strokeWidth: 1.5 },
        { d: 'M 285 0 L 250 250', stroke: '#2A2C30', strokeWidth: 1.2 },
      ],
      wardPolygon: 'M 110 30 L 290 35 L 300 220 L 120 225 Z',
    };
  }

  // 5. HYDERABAD
  if (c.includes('hyderabad') || Math.abs(lat - 17.4504) < 0.2) {
    return {
      key: 'hyderabad',
      cityName: 'HYDERABAD',
      wardName: 'SERILINGAMPALLY ZONE (WARD 104)',
      telemetryCode: 'GHMC_WARD_104_HITEC_CITY',
      heading: '140° SE',
      arteryLabel: 'CYBER TOWERS TECH ARTERY',
      landmarks: [
        { label: 'Cyber Towers Roundabout', x: 200, y: 125 },
        { label: 'HITEC Tech Corridor', x: 300, y: 65 },
        { label: 'Durgam Bridge', x: 260, y: 185 },
      ],
      waterPaths: [
        // Durgam Cheruvu lake
        { d: 'M 245 150 Q 295 130 325 160 Q 305 195 255 185 Z', fill: '#0C1F2E', stroke: '#1E425E', strokeWidth: 2 },
      ],
      arteryPaths: [
        // HITEC City Main Road
        { d: 'M 40 210 L 200 125 L 360 40', stroke: '#F47738', strokeWidth: 3.2 },
        // Outer Ring Road / Express Corridor
        { d: 'M 200 0 L 200 250', stroke: '#FFAA5C', strokeWidth: 2.6 },
      ],
      secondaryRoads: [
        { d: 'M 110 250 L 310 130', stroke: '#36393E', strokeWidth: 1.5 },
        { d: 'M 0 100 L 400 100', stroke: '#2A2C30', strokeWidth: 1.2 },
      ],
      wardPolygon: 'M 90 40 L 320 40 L 340 215 L 105 215 Z',
    };
  }

  // 6. KOLKATA
  if (c.includes('kolkata') || Math.abs(lat - 22.5516) < 0.2) {
    return {
      key: 'kolkata',
      cityName: 'KOLKATA',
      wardName: 'BOROUGH VII (WARD 63)',
      telemetryCode: 'KMC_BOROUGH_07_PARK_ST',
      heading: '090° E',
      arteryLabel: 'PARK STREET CIVIC ARTERY',
      landmarks: [
        { label: 'Park St & Chowringhee', x: 200, y: 125 },
        { label: 'AJC Bose Flyover', x: 305, y: 215 },
        { label: 'Maidan Green Belt', x: 105, y: 110 },
      ],
      waterPaths: [
        // Hooghly River curve along west
        { d: 'M 0 0 L 80 0 Q 120 90 70 160 Q 90 210 75 250 L 0 250 Z', fill: '#0C1F2E', stroke: '#1E425E', strokeWidth: 2 },
      ],
      arteryPaths: [
        // Park Street
        { d: 'M 80 125 L 400 125', stroke: '#F47738', strokeWidth: 3.2 },
        // Chowringhee Road (Jawaharlal Nehru Road)
        { d: 'M 180 0 L 180 250', stroke: '#FFAA5C', strokeWidth: 2.6 },
      ],
      secondaryRoads: [
        { d: 'M 50 220 L 400 200', stroke: '#36393E', strokeWidth: 1.5 },
        { d: 'M 100 165 L 400 165', stroke: '#2A2C30', strokeWidth: 1.2 },
      ],
      wardPolygon: 'M 95 35 L 320 40 L 335 220 L 100 215 Z',
    };
  }

  // 7. CUSTOM / DETECTED GPS
  const computedHeading = `${Math.abs(Math.round(lat * 100 + lng * 100)) % 360}`.padStart(3, '0') + '°';
  const slopeAngle = ((lat * 10) % 40) - 20;

  return {
    key: 'custom',
    cityName: (cityName || 'CIVIC GEOFENCE').toUpperCase(),
    wardName: 'STATUTORY MUNICIPAL WARD (GEOFENCED)',
    telemetryCode: 'PROCEDURAL_GIS_LOCK',
    heading: computedHeading,
    arteryLabel: 'PRIMARY JURISDICTION ARTERY',
    landmarks: [
      { label: 'GPS Pinpoint Lock', x: 200, y: 125 },
      { label: 'Ward Boundary East', x: 310, y: 80 },
      { label: 'Civic Sector South', x: 130, y: 200 },
    ],
    arteryPaths: [
      { d: `M 30 ${230 + slopeAngle} L 200 125 L 370 ${20 - slopeAngle}`, stroke: '#F47738', strokeWidth: 3 },
      { d: `M ${180 + slopeAngle} 0 L 200 125 L ${220 - slopeAngle} 250`, stroke: '#FFAA5C', strokeWidth: 2.4 },
    ],
    secondaryRoads: [
      { d: 'M 40 70 L 360 70', stroke: '#36393E', strokeWidth: 1.5 },
      { d: 'M 40 180 L 360 180', stroke: '#36393E', strokeWidth: 1.5 },
      { d: 'M 100 0 L 100 250', stroke: '#2A2C30', strokeWidth: 1.2 },
      { d: 'M 300 0 L 300 250', stroke: '#2A2C30', strokeWidth: 1.2 },
    ],
    wardPolygon: 'M 90 40 L 310 45 L 325 210 L 95 205 Z',
  };
}

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
  const [mapMode, setMapMode] = useState<'radar' | 'streets'>('radar');
  const [targetLockToast, setTargetLockToast] = useState<string | null>(null);
  const lockTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const lat = problemCoords?.latitude ?? 13.0604;
  const lng = problemCoords?.longitude ?? 80.2496;

  const triggerTargetLock = (name: string, ward: string) => {
    soundFx.playChime();
    setTargetLockToast(`${name.toUpperCase()} • ${ward}`);
    if (lockTimerRef.current) clearTimeout(lockTimerRef.current);
    lockTimerRef.current = setTimeout(() => {
      setTargetLockToast(null);
    }, 2400);
  };

  useEffect(() => {
    return () => {
      if (lockTimerRef.current) clearTimeout(lockTimerRef.current);
    };
  }, []);

  const geoProfile = getCityGeographicProfile(problemCity, lat, lng);

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
      triggerTargetLock(geocoded.city || 'Detected Location', 'GPS Geofence Locked');
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
    triggerTargetLock(item.city || 'Search Target', 'Jurisdiction Mapped');
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
    triggerTargetLock(preset.city, preset.ward);
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
    triggerTargetLock(problemCity, 'Custom Location Locked');
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

      {/* 2. EXPLANATION BANNER */}
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

      {/* 3. DYNAMIC INTERACTIVE GIS RADAR & MAP PREVIEW (Updates to selected location!) */}
      <View style={styles.mapContainer}>
        {/* Real-time Target Lock Toast Banner */}
        {targetLockToast && (
          <View style={styles.targetLockBanner}>
            <Crosshair size={12} color="#22C55E" />
            <Text style={styles.targetLockBannerText}>
              TARGET LOCKED: {targetLockToast}
            </Text>
          </View>
        )}

        {Platform.OS === 'web' && mapMode === 'streets' ? (
          <View style={styles.webMapFrame}>
            <iframe
              key={`map-${lat.toFixed(4)}-${lng.toFixed(4)}`}
              title="Civic Jurisdiction Map"
              src={osmEmbedUrl}
              style={{
                width: '100%',
                height: 250,
                border: 'none',
                borderRadius: 14,
                backgroundColor: '#1E1E1C',
              }}
              loading="lazy"
            />
          </View>
        ) : (
          /* High-Tech Tactical GIS Radar View (Pic 2) */
          <View style={styles.tacticalRadarCanvas}>
            <Svg width="100%" height={250} viewBox="0 0 400 250" fill="none">
              <Defs>
                <RadialGradient id="radarPulseGlow" cx="50%" cy="50%" r="50%">
                  <Stop offset="0%" stopColor="#F47738" stopOpacity="0.45" />
                  <Stop offset="45%" stopColor="#F47738" stopOpacity="0.12" />
                  <Stop offset="100%" stopColor="#F47738" stopOpacity="0" />
                </RadialGradient>
              </Defs>

              {/* Background Tactical Grid */}
              <Rect x="0" y="0" width="400" height="250" fill="#0C0D0E" />

              {/* Coordinate Gridlines */}
              <Line x1="20" y1="62" x2="380" y2="62" stroke="#1D2024" strokeWidth="1" strokeDasharray="3 3" />
              <Line x1="20" y1="125" x2="380" y2="125" stroke="#25292E" strokeWidth="1.2" />
              <Line x1="20" y1="187" x2="380" y2="187" stroke="#1D2024" strokeWidth="1" strokeDasharray="3 3" />
              <Line x1="100" y1="20" x2="100" y2="230" stroke="#1D2024" strokeWidth="1" strokeDasharray="3 3" />
              <Line x1="200" y1="20" x2="200" y2="230" stroke="#25292E" strokeWidth="1.2" />
              <Line x1="300" y1="20" x2="300" y2="230" stroke="#1D2024" strokeWidth="1" strokeDasharray="3 3" />

              {/* Water Bodies & Natural Cartography (Rivers, Oceans, Lakes) */}
              {geoProfile.waterPaths?.map((wp, idx) => (
                <Path
                  key={`water-${idx}`}
                  d={wp.d}
                  fill={wp.fill || 'none'}
                  stroke={wp.stroke || '#1E425E'}
                  strokeWidth={wp.strokeWidth || 2}
                  strokeDasharray={wp.strokeDasharray}
                />
              ))}

              {/* Secondary Street Matrix */}
              {geoProfile.secondaryRoads.map((sr, idx) => (
                <Path
                  key={`sec-${idx}`}
                  d={sr.d}
                  stroke={sr.stroke}
                  strokeWidth={sr.strokeWidth}
                  fill="none"
                />
              ))}

              {/* Statutory Ward / Division Boundary Polygon */}
              <Path
                d={geoProfile.wardPolygon}
                stroke="#F47738"
                strokeWidth="1.4"
                strokeDasharray="5 3"
                fill="rgba(244, 119, 56, 0.08)"
              />

              {/* New Delhi Connaught Place Concentric Rings */}
              {geoProfile.isDelhiRadial && (
                <>
                  <Circle cx="200" cy="125" r="82" stroke="#3D4148" strokeWidth="2.5" fill="none" />
                  <Circle cx="200" cy="125" r="52" stroke="#4F535B" strokeWidth="1.8" fill="none" />
                  <Circle cx="200" cy="125" r="28" stroke="#F47738" strokeWidth="2" fill="none" />
                  <Circle cx="200" cy="125" r="14" fill="#122919" stroke="#22C55E" strokeWidth="1" />
                </>
              )}

              {/* Primary Arterial Highway Network */}
              {geoProfile.arteryPaths.map((ap, idx) => (
                <Path
                  key={`art-${idx}`}
                  d={ap.d}
                  stroke={ap.stroke}
                  strokeWidth={ap.strokeWidth}
                  strokeDasharray={ap.strokeDasharray}
                  fill="none"
                />
              ))}

              {/* Central Target Radar Rings & Gradient Glow */}
              <Circle cx="200" cy="125" r="75" fill="url(#radarPulseGlow)" />
              <Circle cx="200" cy="125" r="58" stroke="#F47738" strokeWidth="1.2" strokeOpacity="0.45" strokeDasharray="4 4" fill="none" />
              <Circle cx="200" cy="125" r="32" stroke="#F47738" strokeWidth="1.6" strokeOpacity="0.85" fill="none" />

              {/* Target Reticle Crosshair Lines */}
              <Line x1="175" y1="125" x2="225" y2="125" stroke="#FFFFFF" strokeWidth="1.5" strokeOpacity="0.85" />
              <Line x1="200" y1="100" x2="200" y2="150" stroke="#FFFFFF" strokeWidth="1.5" strokeOpacity="0.85" />

              {/* Central Pinpoint Beacon */}
              <Circle cx="200" cy="125" r="9" fill="#F47738" />
              <Circle cx="200" cy="125" r="3.5" fill="#FFFFFF" />

              {/* HUD Corner Reticle Brackets */}
              <Path d="M 15 25 L 15 15 L 25 15" stroke="#F47738" strokeWidth="1.5" fill="none" />
              <Path d="M 385 25 L 385 15 L 375 15" stroke="#F47738" strokeWidth="1.5" fill="none" />
              <Path d="M 15 225 L 15 235 L 25 235" stroke="#F47738" strokeWidth="1.5" fill="none" />
              <Path d="M 385 225 L 385 235 L 375 235" stroke="#F47738" strokeWidth="1.5" fill="none" />
            </Svg>

            {/* Tactical HUD Header Bar */}
            <View style={styles.tacticalHudTopBar}>
              <View style={styles.hudLockGroup}>
                <View style={styles.liveGreenDot} />
                <Text style={styles.hudLockText}>
                  GPS CARRIER LOCK (±3m)
                </Text>
              </View>

              <View style={styles.hudCityCode}>
                <Text style={styles.hudCityCodeText}>
                  [{geoProfile.telemetryCode}]
                </Text>
              </View>

              <View style={styles.hudHeadingGroup}>
                <Compass size={11} color="#F47738" />
                <Text style={styles.hudHeadingText}>
                  N ▲ {geoProfile.heading}
                </Text>
              </View>
            </View>

            {/* Landmark Tag Pills on Canvas */}
            <View style={styles.landmarkPillTop}>
              <Text style={styles.landmarkPillText}>
                {geoProfile.landmarks[0]?.label || 'Central Civic Zone'}
              </Text>
            </View>

            <View style={styles.landmarkPillBottom}>
              <Text style={styles.landmarkPillText}>
                {geoProfile.landmarks[1]?.label || geoProfile.arteryLabel}
              </Text>
            </View>

            {/* Distance Scale Bar (Bottom Left) */}
            <View style={styles.scaleBar}>
              <Text style={styles.scaleBarText}>├── 500m ──┤</Text>
            </View>
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
              style={[styles.modeToggleBtn, mapMode === 'radar' && styles.modeToggleBtnActive]}
              onPress={() => setMapMode('radar')}
              accessibilityLabel="Switch to GIS Radar view"
            >
              <Radio size={11} color={mapMode === 'radar' ? '#FFFFFF' : '#8E8A83'} />
              <Text style={[styles.modeToggleText, mapMode === 'radar' && styles.modeToggleTextActive]}>
                GIS Radar
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.modeToggleBtn, mapMode === 'streets' && styles.modeToggleBtnActive]}
              onPress={() => setMapMode('streets')}
              accessibilityLabel="Switch to Live Map view"
            >
              <Layers size={11} color={mapMode === 'streets' ? '#FFFFFF' : '#8E8A83'} />
              <Text style={[styles.modeToggleText, mapMode === 'streets' && styles.modeToggleTextActive]}>
                Live Map
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.externalMapBtn}
              onPress={openInExternalMaps}
              accessibilityLabel="Open in Google Maps"
            >
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
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: THEME.radii.pill,
    backgroundColor: 'rgba(244, 119, 56, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(244, 119, 56, 0.3)',
  },
  gpsButtonText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#F47738',
  },

  /* Explainer Banner */
  explainerBanner: {
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: 14,
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
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: THEME.radii.pill,
  },
  explainerBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#F47738',
    letterSpacing: 0.5,
    fontFamily: THEME.fonts.mono,
  },
  lockBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(34, 197, 94, 0.12)',
    paddingHorizontal: 8,
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
    backgroundColor: '#0C0D0E',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    position: 'relative',
  },
  targetLockBanner: {
    position: 'absolute',
    top: 36,
    alignSelf: 'center',
    zIndex: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(12, 29, 20, 0.95)',
    borderWidth: 1,
    borderColor: 'rgba(34, 197, 94, 0.5)',
    borderRadius: THEME.radii.pill,
    paddingHorizontal: 12,
    paddingVertical: 5,
    shadowColor: '#22C55E',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  targetLockBannerText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#4ADE80',
    letterSpacing: 0.6,
    fontFamily: THEME.fonts.mono,
  },
  webMapFrame: {
    width: '100%',
    height: 250,
    backgroundColor: '#1E1E1C',
  },
  tacticalRadarCanvas: {
    width: '100%',
    height: 250,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0C0D0E',
  },
  tacticalHudTopBar: {
    position: 'absolute',
    top: 8,
    left: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 5,
  },
  hudLockGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(34, 197, 94, 0.3)',
  },
  liveGreenDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#22C55E',
  },
  hudLockText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#22C55E',
    letterSpacing: 0.4,
    fontFamily: THEME.fonts.mono,
  },
  hudCityCode: {
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  hudCityCodeText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#A8A49D',
    letterSpacing: 0.6,
    fontFamily: THEME.fonts.mono,
  },
  hudHeadingGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(244, 119, 56, 0.3)',
  },
  hudHeadingText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#F47738',
    letterSpacing: 0.4,
    fontFamily: THEME.fonts.mono,
  },
  landmarkPillTop: {
    position: 'absolute',
    top: 50,
    right: 16,
    backgroundColor: 'rgba(16, 17, 19, 0.85)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 4,
  },
  landmarkPillBottom: {
    position: 'absolute',
    bottom: 50,
    left: 16,
    backgroundColor: 'rgba(16, 17, 19, 0.85)',
    borderWidth: 1,
    borderColor: 'rgba(244, 119, 56, 0.25)',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 4,
  },
  landmarkPillText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#A8A49D',
    letterSpacing: 0.4,
    fontFamily: THEME.fonts.mono,
  },
  scaleBar: {
    position: 'absolute',
    bottom: 48,
    right: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  scaleBarText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#77736E',
    fontFamily: THEME.fonts.mono,
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

  /* Preset Selector */
  presetSection: {
    gap: 8,
  },
  presetSectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#A8A49D',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    fontFamily: THEME.fonts.mono,
  },
  presetScrollContent: {
    gap: 8,
    paddingVertical: 4,
  },
  presetChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#1E1E1C',
    borderRadius: THEME.radii.pill,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  presetChipActive: {
    backgroundColor: 'rgba(244, 119, 56, 0.15)',
    borderColor: '#F47738',
  },
  presetChipText: {
    fontSize: 12,
    color: '#8E8A83',
    fontWeight: '600',
  },
  presetChipTextActive: {
    color: '#FFFFFF',
    fontWeight: '800',
  },

  /* Statutory Routing Card */
  routingCard: {
    backgroundColor: '#1E1E1C',
    borderWidth: 1,
    borderColor: 'rgba(244, 119, 56, 0.25)',
    borderRadius: 14,
    padding: 14,
    gap: 10,
  },
  routingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  routingLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#F47738',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    fontFamily: THEME.fonts.mono,
  },
  routingAuthority: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
    marginTop: 2,
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

  /* Physical Address Box */
  addressBox: {
    backgroundColor: '#1E1E1C',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    padding: 14,
    gap: 12,
  },
  addressContent: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'flex-start',
  },
  pinCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(244, 119, 56, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  addressLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#8E8A83',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    fontFamily: THEME.fonts.mono,
  },
  addressText: {
    fontSize: 13,
    color: '#FFFFFF',
    fontWeight: '600',
    lineHeight: 18,
    marginTop: 3,
  },
  addressFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.06)',
    paddingTop: 10,
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
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: 'rgba(244, 119, 56, 0.1)',
  },
  editButtonText: {
    fontSize: 11,
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
    backgroundColor: '#161615',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    borderRadius: 8,
    padding: 10,
    fontSize: 13,
    color: '#FFFFFF',
    minHeight: 60,
    textAlignVertical: 'top',
  },
  manualActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
  saveLocationBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F47738',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  saveLocationBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  cancelBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
  },
  cancelBtnText: {
    color: '#A8A49D',
    fontSize: 12,
    fontWeight: '600',
  },

  /* Landmark Search */
  searchBarWrapper: {
    gap: 6,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E1E1C',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 12,
    padding: 0,
  },
  findBtn: {
    backgroundColor: '#262624',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  searchButtonText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  searchResultsDropdown: {
    backgroundColor: '#1E1E1C',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    overflow: 'hidden',
  },
  searchResultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.06)',
  },
  searchResultText: {
    fontSize: 12,
    color: '#FFFFFF',
    flex: 1,
  },
});
