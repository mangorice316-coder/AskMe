import React, { useMemo, useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Keyboard,
  Animated,
  Easing,
  Platform,
} from 'react-native';
import { MapPin, Search, AlertCircle, Check, Compass, RefreshCw, Edit2, X, AlertTriangle } from 'lucide-react-native';
import * as Location from 'expo-location';

interface NominatimAddress {
  house_number?: string;
  house_name?: string;
  building?: string;
  road?: string;
  street?: string;
  pedestrian?: string;
  footway?: string;
  neighbourhood?: string;
  suburb?: string;
  city?: string;
  town?: string;
  village?: string;
  hamlet?: string;
  municipality?: string;
  subdistrict?: string;
  city_district?: string;
  district?: string;
  county?: string;
  state_district?: string;
  state?: string;
  postcode?: string;
  country?: string;
}

interface NominatimResult {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
  address: NominatimAddress;
}

export interface SelectedAddress {
  address: string;
  authorityName: string;
  authorityAddress: string;
  cityOrTown: string;
  district?: string;
  state: string;
  postcode: string;
  latitude?: number;
  longitude?: number;
  accuracy?: number;
}

interface AddressLookupProps {
  onAddressSelected: (data: SelectedAddress) => void;
}

interface PendingLocationState {
  authorityData: SelectedAddress;
  accuracy: number;
  latitude: number;
  longitude: number;
  address: string;
}

async function fetchWithTimeout(url: string, options: RequestInit = {}, timeoutMs = 8000): Promise<Response> {
  const controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
  const timeoutId = controller ? setTimeout(() => controller.abort(), timeoutMs) : null;
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller ? controller.signal : undefined,
    });
    return response;
  } finally {
    if (timeoutId) clearTimeout(timeoutId);
  }
}

/** Format a structured address from Nominatim components */
function formatStructuredAddress(parts: NominatimAddress = {}, fallbackDisplayName = ''): string {
  const lineItems: string[] = [];

  const building = parts.building || parts.house_number || parts.house_name;
  if (building) lineItems.push(building);

  const street = parts.road || parts.street || parts.pedestrian || parts.footway;
  if (street) lineItems.push(street);

  const hood = parts.neighbourhood;
  if (hood && hood !== street) lineItems.push(hood);

  const sub = parts.suburb || parts.city_district;
  if (sub && sub !== hood && sub !== street) lineItems.push(sub);

  const cityLike = parts.city || parts.town || parts.municipality || parts.village || parts.hamlet;
  if (cityLike && !lineItems.includes(cityLike)) {
    lineItems.push(cityLike.replace(/\s*Corporation\s*/gi, '').trim());
  }

  const dist = parts.district || parts.state_district;
  if (dist && dist !== cityLike && !lineItems.includes(dist)) {
    lineItems.push(dist.replace(/\s*(District|Taluk)\s*/gi, '').trim());
  } else if (!dist && parts.county && parts.county !== cityLike && !lineItems.includes(parts.county)) {
    lineItems.push(parts.county.replace(/\s*(District|Taluk)\s*/gi, '').trim());
  }

  if (parts.state && !lineItems.includes(parts.state)) lineItems.push(parts.state);
  if (parts.postcode && !lineItems.includes(parts.postcode)) lineItems.push(parts.postcode);
  if (parts.country && !lineItems.includes(parts.country)) lineItems.push(parts.country);

  const formatted = lineItems.filter(Boolean).join(', ');
  return formatted || fallbackDisplayName;
}

function buildAuthorityData(
  address: string,
  parts: NominatimAddress = {},
  coords?: { latitude: number; longitude: number; accuracy?: number }
): SelectedAddress {
  let primaryName = parts.city || parts.town || parts.municipality || parts.village || parts.hamlet;
  let authorityType = 'Corporation';

  if (parts.city) {
    authorityType = 'Corporation';
  } else if (parts.municipality || parts.town) {
    authorityType = 'Municipality';
  } else if (parts.village || parts.hamlet) {
    authorityType = 'Village Panchayat';
  } else if (parts.district || parts.state_district || parts.county) {
    primaryName = parts.district || parts.state_district || parts.county;
    authorityType = 'District Administration';
  }

  const cleanPrimary = (primaryName || parts.county || parts.suburb || 'Local Area')
    .replace(/\s*(Corporation|Municipality|Taluk|District|Panchayat)\s*/gi, '')
    .trim() || 'Local Area';

  const cleanDistrict = (parts.district || parts.state_district || cleanPrimary)
    .replace(/\s*(District|Taluk)\s*/gi, '')
    .trim() || cleanPrimary;

  const state = parts.state || '';
  const postcode = parts.postcode || '';
  const statePart = state ? `, ${state}` : '';
  const pinPart = postcode ? `, PIN: ${postcode}` : '';

  let authorityName = `${cleanPrimary} Municipal Corporation`;
  if (authorityType === 'Municipality') {
    authorityName = `${cleanPrimary} Municipality`;
  } else if (authorityType === 'Village Panchayat') {
    authorityName = `${cleanPrimary} Village Panchayat Office`;
  } else if (authorityType === 'District Administration') {
    authorityName = `${cleanDistrict} District Collectorate & Public Works`;
  }

  const authorityAddress = `${cleanPrimary} Corporation / Municipal Office, Department of Public Works, ${cleanDistrict} District${statePart}${pinPart}`;

  return {
    address,
    authorityName,
    authorityAddress,
    cityOrTown: cleanPrimary,
    district: cleanDistrict,
    state,
    postcode,
    latitude: coords?.latitude,
    longitude: coords?.longitude,
    accuracy: coords?.accuracy,
  };
}

/**
 * Obtain the device's real GPS coordinates using multi-sample navigator.geolocation on Web
 * or Expo Location on Native.
 */
const requestFreshDeviceCoordinates = (timeoutMs = 12000): Promise<{
  latitude: number;
  longitude: number;
  accuracy: number;
}> => {
  return new Promise((resolve, reject) => {
    // 1. Web Platform (HTML5 Geolocation) with multi-sample stabilization
    if (Platform.OS === 'web') {
      if (typeof navigator === 'undefined' || !navigator.geolocation) {
        reject({
          code: 'UNSUPPORTED',
          message: 'Current location is not supported by this browser. Please enter the address manually.',
        });
        return;
      }

      const positions: GeolocationPosition[] = [];
      let watchId: number | null = null;

      const finishTimeout = setTimeout(() => {
        if (watchId !== null) navigator.geolocation.clearWatch(watchId);
        if (positions.length > 0) {
          // Sort by accuracy (smallest radius in meters = highest precision)
          positions.sort((a, b) => a.coords.accuracy - b.coords.accuracy);
          const best = positions[0];
          resolve({
            latitude: best.coords.latitude,
            longitude: best.coords.longitude,
            accuracy: best.coords.accuracy,
          });
        } else {
          // Single-shot fallback
          navigator.geolocation.getCurrentPosition(
            (pos) => {
              resolve({
                latitude: pos.coords.latitude,
                longitude: pos.coords.longitude,
                accuracy: pos.coords.accuracy,
              });
            },
            (error) => {
              if (error.code === 1) {
                reject({
                  code: 'PERMISSION_DENIED',
                  message:
                    'Location permission was denied. Please allow location access in your browser settings or enter the address manually.',
                });
              } else {
                reject({
                  code: 'UNAVAILABLE',
                  message:
                    'Unable to access your current location. Please allow location permission or enter the address manually.',
                });
              }
            },
            { enableHighAccuracy: true, timeout: 6000, maximumAge: 0 }
          );
        }
      }, 2500);

      try {
        watchId = navigator.geolocation.watchPosition(
          (pos) => {
            positions.push(pos);
            // If we got sub-25m GPS precision, resolve immediately
            if (pos.coords.accuracy <= 25) {
              clearTimeout(finishTimeout);
              if (watchId !== null) navigator.geolocation.clearWatch(watchId);
              resolve({
                latitude: pos.coords.latitude,
                longitude: pos.coords.longitude,
                accuracy: pos.coords.accuracy,
              });
            }
          },
          () => {},
          { enableHighAccuracy: true, maximumAge: 0 }
        );
      } catch {
        // Handled by finishTimeout fallback
      }
      return;
    }

    // 2. Native Mobile Platform (Expo Location)
    Location.requestForegroundPermissionsAsync()
      .then(({ status }) => {
        if (status !== 'granted') {
          reject({
            code: 'PERMISSION_DENIED',
            message:
              'Location permission was denied. Please allow location access in your device settings or enter the address manually.',
          });
          return;
        }
        return Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Highest,
        });
      })
      .then((loc) => {
        if (loc && loc.coords) {
          resolve({
            latitude: loc.coords.latitude,
            longitude: loc.coords.longitude,
            accuracy: loc.coords.accuracy || 10,
          });
        } else {
          return Location.getLastKnownPositionAsync({});
        }
      })
      .then((lastLoc) => {
        if (lastLoc && lastLoc.coords) {
          resolve({
            latitude: lastLoc.coords.latitude,
            longitude: lastLoc.coords.longitude,
            accuracy: lastLoc.coords.accuracy || 50,
          });
        } else {
          reject({
            code: 'POSITION_UNAVAILABLE',
            message: 'Your device could not determine its current location. Please try again.',
          });
        }
      })
      .catch((err) => {
        reject({
          code: 'UNKNOWN',
          message:
            err?.message ||
            'Unable to access your current location. Please allow location permission or enter the address manually.',
        });
      });
  });
};

export default function AddressLookup({ onAddressSelected }: AddressLookupProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<NominatimResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const [accuracyWarning, setAccuracyWarning] = useState('');
  const [pendingLocation, setPendingLocation] = useState<PendingLocationState | null>(null);
  const [isFocused, setIsFocused] = useState(false);

  const inputRef = useRef<TextInput>(null);
  const resultsAnim = useRef(new Animated.Value(0)).current;
  const focusAnim = useRef(new Animated.Value(0)).current;

  const trimmedQuery = query.trim();
  const canUseTypedAddress = useMemo(() => trimmedQuery.length >= 6, [trimmedQuery]);

  const handleFocus = () => {
    setIsFocused(true);
    Animated.timing(focusAnim, {
      toValue: 1,
      duration: 200,
      useNativeDriver: false,
    }).start();
  };

  const handleBlur = () => {
    setIsFocused(false);
    Animated.timing(focusAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  };

  const animateResultsIn = () => {
    resultsAnim.setValue(0);
    Animated.timing(resultsAnim, {
      toValue: 1,
      duration: 250,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  };

  const handleLocateMe = async () => {
    setLoading(true);
    setError('');
    setStatusMessage('📍 Getting your current location…');
    setAccuracyWarning('');
    setPendingLocation(null);
    Keyboard.dismiss();

    try {
      // 1. Request fresh device coordinates via Geolocation API
      const coords = await requestFreshDeviceCoordinates(12000);
      const { latitude, longitude, accuracy } = coords;

      let data: any = null;

      // 2. On native mobile, try native reverse geocoding first
      if (Platform.OS !== 'web') {
        try {
          const nativeAddrs = await Location.reverseGeocodeAsync({ latitude, longitude });
          if (nativeAddrs && nativeAddrs.length > 0) {
            const na = nativeAddrs[0];
            data = {
              display_name: [na.name, na.street, na.district, na.city, na.region, na.postalCode, na.country]
                .filter(Boolean)
                .join(', '),
              lat: String(latitude),
              lon: String(longitude),
              address: {
                road: na.street || na.name,
                suburb: na.district || na.subregion,
                city: na.city,
                state_district: na.district,
                state: na.region,
                postcode: na.postalCode,
                country: na.country,
              },
            };
          }
        } catch (nativeErr) {
          console.warn('Native reverseGeocodeAsync fallback to HTTP:', nativeErr);
        }
      }

      // 3. HTTP Reverse Geocode via OpenStreetMap Nominatim
      if (!data || !data.address) {
        const headers: Record<string, string> = {};
        if (Platform.OS !== 'web') {
          headers['User-Agent'] = 'AskMeCivicApp/1.0 (contact@askme.civic)';
        }
        const nomUrl = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1&zoom=18`;
        const res = await fetchWithTimeout(nomUrl, { headers }, 8000);

        if (res.ok) {
          data = await res.json();
        }
      }

      // Secondary fallback reverse geocoder if Nominatim failed
      if (!data || !data.address) {
        try {
          const bdcUrl = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`;
          const bdcRes = await fetchWithTimeout(bdcUrl, {}, 5000);
          if (bdcRes.ok) {
            const bdcData = await bdcRes.json();
            data = {
              display_name: [bdcData.locality, bdcData.city, bdcData.principalSubdivision, bdcData.countryName]
                .filter(Boolean)
                .join(', '),
              lat: String(latitude),
              lon: String(longitude),
              address: {
                road: bdcData.locality,
                suburb: bdcData.locality,
                city: bdcData.city,
                district: bdcData.localityInfo?.administrative?.find((a: any) => a.order === 5)?.name || bdcData.city,
                state: bdcData.principalSubdivision,
                postcode: bdcData.postcode,
                country: bdcData.countryName,
              },
            };
          }
        } catch (bdcErr) {
          console.warn('Secondary reverse geocode error:', bdcErr);
        }
      }

      if (!data || !data.address) {
        throw new Error(
          `Unable to resolve an address from your GPS coordinates (${latitude.toFixed(5)}, ${longitude.toFixed(5)}). Please enter your address manually.`
        );
      }

      // Verify returned coordinates are within reasonable regional boundary
      if (data.lat && data.lon) {
        const retLat = parseFloat(data.lat);
        const retLon = parseFloat(data.lon);
        if (Math.abs(retLat - latitude) > 0.5 || Math.abs(retLon - longitude) > 0.5) {
          console.warn('Reverse geocoder returned centroid far from device coordinates.');
        }
      }

      const resolvedAddress = formatStructuredAddress(data.address, data.display_name);

      const authorityData = buildAuthorityData(resolvedAddress, data.address, {
        latitude,
        longitude,
        accuracy,
      });

      // Accuracy Check & Verification Handling
      let accWarn = '';
      if (accuracy > 200) {
        accWarn = `Location accuracy is coarse (±${Math.round(accuracy)}m). Please verify the address below and edit if necessary.`;
      }

      setPendingLocation({
        authorityData,
        accuracy,
        latitude,
        longitude,
        address: resolvedAddress,
      });

      setStatusMessage('✓ Current location detected');
      setAccuracyWarning(accWarn);

      // Bind location and update search box
      onAddressSelected(authorityData);
      setQuery(resolvedAddress);
      setResults([]);
    } catch (err: any) {
      console.warn('Location detection error:', err);
      setStatusMessage('');
      setPendingLocation(null);
      setError(
        err?.message ||
          'Unable to access your current location. Please allow location permission or enter the address manually.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmLocation = () => {
    if (pendingLocation) {
      onAddressSelected(pendingLocation.authorityData);
      setPendingLocation(null);
    }
  };

  const handleEditDetectedAddress = () => {
    if (pendingLocation) {
      setQuery(pendingLocation.address);
      setPendingLocation(null);
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  };

  const searchAddress = async () => {
    if (trimmedQuery.length < 3) {
      setError('Type at least 3 characters to search for a location.');
      setResults([]);
      return;
    }

    setLoading(true);
    setError('');
    setStatusMessage('');
    setAccuracyWarning('');
    setPendingLocation(null);
    Keyboard.dismiss();

    try {
      const encodedQuery = encodeURIComponent(trimmedQuery);
      const url = `https://nominatim.openstreetmap.org/search?q=${encodedQuery}&format=json&addressdetails=1&limit=5`;

      const headers: Record<string, string> = {};
      if (Platform.OS !== 'web') {
        headers['User-Agent'] = 'OorKuraliCivicComplaintApp/1.0 (contact@oorkurali.civic)';
      }

      const response = await fetchWithTimeout(url, { headers }, 7000);

      if (!response.ok) {
        throw new Error('Failed to fetch locations from OpenStreetMap.');
      }

      const data = await response.json();
      if (!Array.isArray(data)) {
        throw new Error('Location service returned an unexpected response.');
      }

      setResults(data);
      if (data.length > 0) {
        animateResultsIn();
      }
      if (data.length === 0) {
        setError('No locations found. You can use the typed address instead.');
      }
    } catch (err: any) {
      setResults([]);
      setError(err.message || 'Something went wrong while searching.');
    } finally {
      setLoading(false);
    }
  };

  const selectAddress = (item: NominatimResult) => {
    const structuredAddr = formatStructuredAddress(item.address, item.display_name);
    const lat = item.lat ? parseFloat(item.lat) : undefined;
    const lon = item.lon ? parseFloat(item.lon) : undefined;

    const authData = buildAuthorityData(
      structuredAddr,
      item.address,
      lat !== undefined && lon !== undefined ? { latitude: lat, longitude: lon } : undefined
    );

    onAddressSelected(authData);
    setQuery(structuredAddr);
    setResults([]);
    setError('');
    setStatusMessage(`✓ Location selected: ${structuredAddr}`);
    setPendingLocation(null);
  };

  const useTypedAddress = () => {
    if (!canUseTypedAddress) {
      setError('Enter a more specific address before using it.');
      return;
    }

    onAddressSelected(buildAuthorityData(trimmedQuery));
    setQuery(trimmedQuery);
    setResults([]);
    setError('');
    setStatusMessage(`✓ Using address: ${trimmedQuery}`);
    setPendingLocation(null);
    Keyboard.dismiss();
  };

  const searchBoxBorderColor = focusAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['#3f3f46', '#0d9488'],
  });

  const resultsOpacity = resultsAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  const resultsTranslateY = resultsAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-8, 0],
  });

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Search or Enter Issue Location</Text>
      
      {/* Search Input Box */}
      <Animated.View style={[styles.searchBox, { borderColor: searchBoxBorderColor }]}>
        <TextInput
          ref={inputRef}
          style={styles.input}
          placeholder="e.g. 10 Main Road, Anna Nagar, Chennai"
          placeholderTextColor="#71717a"
          value={query}
          onChangeText={(text) => {
            setQuery(text);
            if (error) setError('');
            if (statusMessage) setStatusMessage('');
            if (pendingLocation) setPendingLocation(null);
          }}
          onSubmitEditing={searchAddress}
          onFocus={handleFocus}
          onBlur={handleBlur}
          returnKeyType="search"
          accessibilityLabel="Search for issue location"
          accessibilityHint="Type an address and press search"
        />
        <TouchableOpacity
          style={styles.searchButton}
          onPress={searchAddress}
          disabled={loading}
          accessibilityRole="button"
          accessibilityLabel="Search address"
        >
          {loading ? (
            <ActivityIndicator size="small" color="#ffffff" />
          ) : (
            <Search size={20} color="#ffffff" />
          )}
        </TouchableOpacity>
      </Animated.View>

      {/* Action Row: Use Current Location & Use Typed Address */}
      <View style={styles.actionRow}>
        <TouchableOpacity
          style={styles.locateBtn}
          onPress={handleLocateMe}
          disabled={loading}
          accessibilityRole="button"
          accessibilityLabel="Use current device GPS location"
        >
          {loading ? (
            <ActivityIndicator size="small" color="#f59e0b" />
          ) : (
            <Compass size={16} color="#f59e0b" />
          )}
          <Text style={styles.locateBtnText}>
            {loading ? 'Getting GPS Location…' : '📍 Use Current Location'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.useTypedButton, !canUseTypedAddress && styles.useTypedButtonDisabled]}
          onPress={useTypedAddress}
          disabled={!canUseTypedAddress}
          accessibilityRole="button"
          accessibilityLabel="Use the typed address as-is"
        >
          <Check size={16} color={canUseTypedAddress ? '#2dd4bf' : '#71717a'} />
          <Text style={[styles.useTypedText, !canUseTypedAddress && styles.useTypedTextDisabled]}>
            Use typed address
          </Text>
        </TouchableOpacity>
      </View>

      {/* Detected Location Card & Confirmation Dialog */}
      {pendingLocation && (
        <View style={styles.detectedCard}>
          <View style={styles.detectedHeaderRow}>
            <View style={styles.detectedBadge}>
              <Check size={14} color="#10b981" />
              <Text style={styles.detectedBadgeText}>Current Location Detected</Text>
            </View>
            <TouchableOpacity
              style={styles.refreshBtn}
              onPress={handleLocateMe}
              disabled={loading}
              accessibilityRole="button"
              accessibilityLabel="Refresh current location"
            >
              <RefreshCw size={13} color="#f59e0b" />
              <Text style={styles.refreshBtnText}>Refresh</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.detectedAddressText}>{pendingLocation.address}</Text>

          <View style={styles.accuracyRow}>
            <Text style={styles.accuracyText}>
              Accuracy: approximately {Math.round(pendingLocation.accuracy)} m
            </Text>
            <Text style={styles.coordsText}>
              ({pendingLocation.latitude.toFixed(4)}, {pendingLocation.longitude.toFixed(4)})
            </Text>
          </View>

          {accuracyWarning ? (
            <View style={styles.accuracyWarningBox}>
              <AlertTriangle size={14} color="#f59e0b" />
              <Text style={styles.accuracyWarningText}>{accuracyWarning}</Text>
            </View>
          ) : null}

          {/* Location Verification Prompt */}
          <View style={styles.confirmPromptBox}>
            <Text style={styles.confirmPromptText}>Is this location correct?</Text>
            <View style={styles.confirmActionsRow}>
              <TouchableOpacity
                style={styles.confirmYesBtn}
                onPress={handleConfirmLocation}
                accessibilityRole="button"
                accessibilityLabel="Confirm detected location"
              >
                <Check size={14} color="#ffffff" />
                <Text style={styles.confirmYesBtnText}>Yes, use this location</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.confirmEditBtn}
                onPress={handleEditDetectedAddress}
                accessibilityRole="button"
                accessibilityLabel="Edit detected address"
              >
                <Edit2 size={13} color="#2dd4bf" />
                <Text style={styles.confirmEditBtnText}>Edit address</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

      {/* Status Notice Message */}
      {statusMessage && !pendingLocation ? (
        <View style={styles.statusBox}>
          <Text style={styles.statusText}>{statusMessage}</Text>
        </View>
      ) : null}

      {/* Error Message */}
      {error ? (
        <View style={styles.errorContainer}>
          <AlertCircle size={16} color="#ef4444" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity onPress={() => setError('')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <X size={14} color="#ef4444" />
          </TouchableOpacity>
        </View>
      ) : null}

      {/* Search Dropdown Results */}
      {results.length > 0 && (
        <Animated.View
          style={[
            styles.resultsWrapper,
            {
              opacity: resultsOpacity,
              transform: [{ translateY: resultsTranslateY }],
            },
          ]}
        >
          <FlatList
            data={results}
            keyExtractor={(item) => item.place_id.toString()}
            keyboardShouldPersistTaps="handled"
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.resultItem}
                onPress={() => selectAddress(item)}
                accessibilityRole="button"
                accessibilityLabel={`Select location: ${item.display_name}`}
              >
                <View style={styles.pinIconContainer}>
                  <MapPin size={16} color="#0d9488" />
                </View>
                <View style={styles.resultTextContainer}>
                  <Text style={styles.resultMain} numberOfLines={1}>
                    {item.address.road || item.address.suburb || item.address.city || 'Selected Location'}
                  </Text>
                  <Text style={styles.resultSub} numberOfLines={2}>
                    {item.display_name}
                  </Text>
                </View>
              </TouchableOpacity>
            )}
          />
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    color: '#e4e4e7',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  searchBox: {
    flexDirection: 'row',
    backgroundColor: '#27272a',
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#3f3f46',
    overflow: 'hidden',
  },
  input: {
    flex: 1,
    height: 48,
    paddingHorizontal: 14,
    color: '#ffffff',
    fontSize: 15,
  },
  searchButton: {
    width: 50,
    backgroundColor: '#0d9488',
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionRow: {
    flexDirection: 'row',
    marginTop: 10,
    gap: 8,
  },
  locateBtn: {
    flex: 1.2,
    minHeight: 42,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.4)',
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  locateBtnText: {
    color: '#f59e0b',
    fontSize: 12,
    fontWeight: '700',
    marginLeft: 6,
  },
  useTypedButton: {
    flex: 1,
    minHeight: 42,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(13, 148, 136, 0.4)',
    backgroundColor: 'rgba(13, 148, 136, 0.1)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  useTypedButtonDisabled: {
    borderColor: '#27272a',
    backgroundColor: '#18181b',
  },
  useTypedText: {
    color: '#2dd4bf',
    fontSize: 12,
    fontWeight: '700',
    marginLeft: 6,
  },
  useTypedTextDisabled: {
    color: '#71717a',
  },
  detectedCard: {
    marginTop: 12,
    backgroundColor: '#1f1f23',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
    padding: 14,
  },
  detectedHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  detectedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 5,
  },
  detectedBadgeText: {
    color: '#10b981',
    fontSize: 12,
    fontWeight: '700',
  },
  refreshBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.4)',
    backgroundColor: 'rgba(245, 158, 11, 0.08)',
    gap: 4,
  },
  refreshBtnText: {
    color: '#f59e0b',
    fontSize: 11,
    fontWeight: '600',
  },
  detectedAddressText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 20,
    marginBottom: 8,
  },
  accuracyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: '#2d2d34',
    marginBottom: 8,
  },
  accuracyText: {
    color: '#a1a1aa',
    fontSize: 12,
  },
  coordsText: {
    color: '#71717a',
    fontSize: 11,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  accuracyWarningBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(245, 158, 11, 0.12)',
    padding: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.3)',
    gap: 6,
    marginBottom: 10,
  },
  accuracyWarningText: {
    color: '#f59e0b',
    fontSize: 11,
    flex: 1,
    lineHeight: 15,
  },
  confirmPromptBox: {
    marginTop: 6,
    backgroundColor: '#18181b',
    borderRadius: 8,
    padding: 10,
    borderWidth: 1,
    borderColor: '#2d2d34',
  },
  confirmPromptText: {
    color: '#e4e4e7',
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 8,
  },
  confirmActionsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  confirmYesBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0d9488',
    paddingVertical: 8,
    borderRadius: 6,
    gap: 5,
  },
  confirmYesBtnText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
  },
  confirmEditBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#3f3f46',
    paddingVertical: 8,
    borderRadius: 6,
    gap: 5,
  },
  confirmEditBtnText: {
    color: '#2dd4bf',
    fontSize: 12,
    fontWeight: '600',
  },
  statusBox: {
    marginTop: 10,
    backgroundColor: 'rgba(13, 148, 136, 0.12)',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(45, 212, 191, 0.3)',
  },
  statusText: {
    color: '#2dd4bf',
    fontSize: 12,
    fontWeight: '500',
    lineHeight: 16,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.25)',
    gap: 8,
  },
  errorText: {
    color: '#f87171',
    fontSize: 12,
    flex: 1,
    lineHeight: 16,
  },
  resultsWrapper: {
    marginTop: 10,
    backgroundColor: '#1a1a1e',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#27272a',
    maxHeight: 220,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
    overflow: 'hidden',
  },
  resultItem: {
    flexDirection: 'row',
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#222226',
    alignItems: 'center',
  },
  pinIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: 'rgba(13, 148, 136, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  resultTextContainer: {
    flex: 1,
  },
  resultMain: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  resultSub: {
    color: '#a1a1aa',
    fontSize: 12,
    lineHeight: 16,
  },
});
