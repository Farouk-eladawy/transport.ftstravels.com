import { Injectable, Logger } from '@nestjs/common';
import { SettingsService } from '../settings/settings.service.js';

export interface PlaceResult {
  placeId: string;
  name: string;
  formattedAddress: string;
  lat: number;
  lng: number;
}

type GeocodingProvider = 'nominatim' | 'google';

@Injectable()
export class GeocodingService {
  private readonly logger = new Logger(GeocodingService.name);
  private lastNominatimAt = 0;

  constructor(private readonly settings: SettingsService) {}

  private provider(): GeocodingProvider {
    const raw = String(process.env.GEOCODING_PROVIDER || 'nominatim').trim().toLowerCase();
    return raw === 'google' ? 'google' : 'nominatim';
  }

  private nominatimUserAgent(): string {
    return (
      process.env.NOMINATIM_USER_AGENT?.trim() ||
      'FTS-Transport/1.0 (transport.ftstravels.com; geocoding@ftstravels.com)'
    );
  }

  private async throttleNominatim(): Promise<void> {
    const minGapMs = 1100;
    const now = Date.now();
    const wait = Math.max(0, minGapMs - (now - this.lastNominatimAt));
    if (wait > 0) {
      await new Promise((resolve) => setTimeout(resolve, wait));
    }
    this.lastNominatimAt = Date.now();
  }

  private buildNominatimQuery(query: string, type?: string): string {
    const q = query.trim();
    if (!type) return q;
    if (type === 'airport') return `${q} airport Egypt`;
    if (type === 'hotel') return `${q} hotel Egypt`;
    if (type === 'city') return `${q} city Egypt`;
    if (type === 'zone') return `${q} Egypt`;
    if (type === 'country') return q;
    return q;
  }

  private nominatimFeatureType(type?: string): string | undefined {
    if (type === 'city') return 'city';
    return undefined;
  }

  private mapNominatimResult(item: any): PlaceResult | null {
    const lat = parseFloat(String(item?.lat ?? ''));
    const lng = parseFloat(String(item?.lon ?? ''));
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;

    const osmType = String(item?.osm_type || 'place');
    const osmId = String(item?.osm_id || item?.place_id || '');
    const displayName = String(item?.display_name || '').trim();
    const shortName =
      String(item?.name || '').trim() ||
      String(item?.address?.hotel || item?.address?.city || item?.address?.town || '').trim() ||
      displayName.split(',')[0]?.trim() ||
      displayName;

    return {
      placeId: osmId ? `${osmType}:${osmId}` : String(item?.place_id || displayName),
      name: shortName,
      formattedAddress: displayName,
      lat,
      lng,
    };
  }

  private async searchNominatim(query: string, type?: string): Promise<PlaceResult[]> {
    await this.throttleNominatim();

    const params = new URLSearchParams({
      q: this.buildNominatimQuery(query, type),
      format: 'json',
      addressdetails: '1',
      limit: '10',
      countrycodes: 'eg',
    });
    const featureType = this.nominatimFeatureType(type);
    if (featureType) params.set('featuretype', featureType);

    const response = await fetch(`https://nominatim.openstreetmap.org/search?${params.toString()}`, {
      headers: {
        'User-Agent': this.nominatimUserAgent(),
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      this.logger.warn(`Nominatim search error: ${response.status}`);
      return [];
    }

    const data = await response.json();
    if (!Array.isArray(data)) return [];

    return data
      .map((item) => this.mapNominatimResult(item))
      .filter((item): item is PlaceResult => !!item);
  }

  private async getGoogleApiKey(): Promise<string | null> {
    try {
      const s = await this.settings.getSystemSettings();
      const key = String((s as any).googleMapsApiKey || '').trim();
      return key || null;
    } catch {
      return null;
    }
  }

  private async searchGoogle(query: string, type?: string): Promise<PlaceResult[]> {
    const apiKey = await this.getGoogleApiKey();
    if (!apiKey) {
      this.logger.warn('Google geocoding requested but no API key configured');
      return [];
    }

    const typeMap: Record<string, string> = {
      airport: 'airport',
      city: 'locality',
      hotel: 'lodging',
    };

    const body: Record<string, unknown> = { textQuery: query };
    if (type && typeMap[type]) {
      body.includedType = typeMap[type];
    }

    const response = await fetch('https://places.googleapis.com/v1/places:searchText', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': apiKey,
        'X-Goog-FieldMask':
          'places.id,places.displayName,places.formattedAddress,places.location',
      },
      body: JSON.stringify(body),
    });
    const data = await response.json();

    if (!response.ok) {
      this.logger.warn(
        `Google Places API error: ${response.status} - ${data?.error?.message || ''}`,
      );
      return [];
    }

    return (data.places || []).slice(0, 10).map((r: any) => ({
      placeId: r.id,
      name: r.displayName?.text || r.formattedAddress || '',
      formattedAddress: r.formattedAddress || '',
      lat: r.location?.latitude,
      lng: r.location?.longitude,
    }));
  }

  async searchPlaces(query: string, type?: string): Promise<PlaceResult[]> {
    const provider = this.provider();
    if (provider === 'google') {
      return this.searchGoogle(query, type);
    }

    const results = await this.searchNominatim(query, type);
    if (results.length > 0) return results;

    // Optional fallback when a legacy Google key still exists in settings.
    const googleKey = await this.getGoogleApiKey();
    if (googleKey) {
      this.logger.debug('Nominatim returned no results; falling back to Google Places');
      return this.searchGoogle(query, type);
    }
    return [];
  }

  async geocodeAddress(query: string): Promise<PlaceResult[]> {
    return this.searchPlaces(query);
  }
}
