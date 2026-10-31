import { Platform } from 'react-native';
import * as Location from 'expo-location';

export interface LocationCoordinates {
  latitude: number;
  longitude: number;
  accuracy?: number;
}

export interface GeocodedAddress {
  formattedAddress: string;
  road?: string;
  suburb?: string;
  neighbourhood?: string;
  city?: string;
  district?: string;
  state?: string;
  postcode?: string;
  country?: string;
  coordinates?: LocationCoordinates;
  isFromExif?: boolean;
}

/**
 * Robust binary EXIF parser to extract GPS coordinates from JPEG files
 * Reads binary array buffer to locate APP1 marker (0xFFE1) and EXIF GPS IFD.
 */
export function extractExifGps(arrayBuffer: ArrayBuffer): LocationCoordinates | null {
  try {
    const dataView = new DataView(arrayBuffer);
    if (dataView.getUint16(0) !== 0xffd8) {
      // Not a JPEG
      return null;
    }

    let offset = 2;
    const length = dataView.byteLength;

    while (offset < length) {
      if (dataView.getUint8(offset) !== 0xff) return null;
      const marker = dataView.getUint8(offset + 1);

      // APP1 marker is 0xFFE1
      if (marker === 0xe1) {
        return parseExifApp1(dataView, offset + 4);
      } else {
        // Move to next marker
        const segmentLength = dataView.getUint16(offset + 2);
        offset += 2 + segmentLength;
      }
    }
  } catch (err) {
    // If malformed EXIF, safely return null without throwing
    return null;
  }
  return null;
}

function parseExifApp1(view: DataView, offset: number): LocationCoordinates | null {
  // Check Exif header: "Exif\0\0"
  if (
    view.getUint8(offset) !== 0x45 ||
    view.getUint8(offset + 1) !== 0x78 ||
    view.getUint8(offset + 2) !== 0x69 ||
    view.getUint8(offset + 3) !== 0x66
  ) {
    return null;
  }

  const tiffStart = offset + 6;
  const littleEndian = view.getUint16(tiffStart) === 0x4949; // "II" vs "MM"

  // First IFD offset
  const firstIfdOffset = view.getUint32(tiffStart + 4, littleEndian);
  let ifdOffset = tiffStart + firstIfdOffset;

  const entriesCount = view.getUint16(ifdOffset, littleEndian);
  let gpsOffset: number | null = null;

  for (let i = 0; i < entriesCount; i++) {
    const entryOffset = ifdOffset + 2 + i * 12;
    const tag = view.getUint16(entryOffset, littleEndian);

    // Tag 0x8825 is GPSInfo
    if (tag === 0x8825) {
      gpsOffset = tiffStart + view.getUint32(entryOffset + 8, littleEndian);
      break;
    }
  }

  if (!gpsOffset) return null;

  const gpsEntries = view.getUint16(gpsOffset, littleEndian);
  let latRef: string | null = null;
  let lonRef: string | null = null;
  let latVal: number[] | null = null;
  let lonVal: number[] | null = null;

  for (let i = 0; i < gpsEntries; i++) {
    const entryOffset = gpsOffset + 2 + i * 12;
    const tag = view.getUint16(entryOffset, littleEndian);

    if (tag === 0x0001) {
      // GPSLatitudeRef
      latRef = String.fromCharCode(view.getUint8(entryOffset + 8));
    } else if (tag === 0x0002) {
      // GPSLatitude (3 rationals)
      const valOffset = tiffStart + view.getUint32(entryOffset + 8, littleEndian);
      latVal = readRationals(view, valOffset, 3, littleEndian);
    } else if (tag === 0x0003) {
      // GPSLongitudeRef
      lonRef = String.fromCharCode(view.getUint8(entryOffset + 8));
    } else if (tag === 0x0004) {
      // GPSLongitude (3 rationals)
      const valOffset = tiffStart + view.getUint32(entryOffset + 8, littleEndian);
      lonVal = readRationals(view, valOffset, 3, littleEndian);
    }
  }

  if (latVal && lonVal) {
    let lat = latVal[0] + latVal[1] / 60 + latVal[2] / 3600;
    let lon = lonVal[0] + lonVal[1] / 60 + lonVal[2] / 3600;

    if (latRef === 'S') lat = -lat;
    if (lonRef === 'W') lon = -lon;

    if (!isNaN(lat) && !isNaN(lon) && lat >= -90 && lat <= 90 && lon >= -180 && lon <= 180) {
      return { latitude: lat, longitude: lon, accuracy: 15 };
    }
  }

  return null;
}

function readRationals(view: DataView, offset: number, count: number, littleEndian: boolean): number[] {
  const result: number[] = [];
  for (let i = 0; i < count; i++) {
    const num = view.getUint32(offset + i * 8, littleEndian);
    const den = view.getUint32(offset + i * 8 + 4, littleEndian);
    result.push(den === 0 ? 0 : num / den);
  }
  return result;
}

/**
 * Reverse Geocode via OpenStreetMap Nominatim with explicit timeout & User-Agent
 */
export async function reverseGeocodeCoords(coords: LocationCoordinates): Promise<GeocodedAddress> {
  const { latitude, longitude } = coords;
  const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1&zoom=18`;

  const controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
  const timeoutId = controller ? setTimeout(() => controller.abort(), 7000) : null;

  try {
    const res = await fetch(url, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'AskMeCivicAssistant/1.0',
      },
      signal: controller ? controller.signal : undefined,
    });

    if (!res.ok) {
      throw new Error(`Geocoding server responded with ${res.status}`);
    }

    const data = await res.json();
    const addr = data.address || {};

    const parts: string[] = [];
    if (addr.building || addr.house_number) parts.push(addr.building || addr.house_number);
    if (addr.road || addr.street) parts.push(addr.road || addr.street);
    if (addr.neighbourhood || addr.suburb) parts.push(addr.neighbourhood || addr.suburb);
    if (addr.city || addr.town || addr.village) parts.push(addr.city || addr.town || addr.village);
    if (addr.state_district || addr.district) parts.push(addr.state_district || addr.district);
    if (addr.state) parts.push(addr.state);
    if (addr.postcode) parts.push(addr.postcode);

    const formatted = parts.length > 0 ? parts.join(', ') : data.display_name || `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`;

    return {
      formattedAddress: formatted,
      road: addr.road || addr.street,
      suburb: addr.suburb || addr.neighbourhood,
      city: addr.city || addr.town || addr.village || addr.municipality,
      district: addr.district || addr.state_district || addr.county,
      state: addr.state,
      postcode: addr.postcode,
      country: addr.country,
      coordinates: coords,
    };
  } catch (err) {
    return {
      formattedAddress: `Coordinates: ${latitude.toFixed(5)}, ${longitude.toFixed(5)}`,
      coordinates: coords,
    };
  } finally {
    if (timeoutId) clearTimeout(timeoutId);
  }
}

/**
 * Get device current location with explicit user permission check
 */
export async function getCurrentDeviceLocation(): Promise<LocationCoordinates> {
  if (Platform.OS === 'web' && typeof navigator !== 'undefined' && navigator.geolocation) {
    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          resolve({
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
            accuracy: pos.coords.accuracy,
          });
        },
        (err) => {
          if (err.code === 1) {
            reject(new Error('Location permission denied. Please allow location access or type the address manually.'));
          } else {
            reject(new Error('Device location is currently unavailable. Please enter address manually.'));
          }
        },
        { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 }
      );
    });
  }

  // Mobile fallback via expo-location
  const { status } = await Location.requestForegroundPermissionsAsync();
  if (status !== 'granted') {
    throw new Error('Location permission denied on device.');
  }

  const loc = await Location.getCurrentPositionAsync({
    accuracy: Location.Accuracy.High,
  });

  return {
    latitude: loc.coords.latitude,
    longitude: loc.coords.longitude,
    accuracy: loc.coords.accuracy || 10,
  };
}

/**
 * Forward Geocoding Search
 */
export async function searchLocationQuery(query: string): Promise<GeocodedAddress[]> {
  if (!query || query.trim().length < 3) return [];
  const encoded = encodeURIComponent(query.trim());
  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encoded}&addressdetails=1&limit=5`;

  try {
    const res = await fetch(url, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'AskMeCivicAssistant/1.0',
      },
    });

    if (!res.ok) return [];
    const results = await res.json();
    if (!Array.isArray(results)) return [];

    return results.map((item) => {
      const addr = item.address || {};
      return {
        formattedAddress: item.display_name,
        road: addr.road || addr.street,
        suburb: addr.suburb || addr.neighbourhood,
        city: addr.city || addr.town || addr.village,
        district: addr.district || addr.state_district,
        state: addr.state,
        postcode: addr.postcode,
        country: addr.country,
        coordinates: {
          latitude: parseFloat(item.lat),
          longitude: parseFloat(item.lon),
        },
      };
    });
  } catch {
    return [];
  }
}

