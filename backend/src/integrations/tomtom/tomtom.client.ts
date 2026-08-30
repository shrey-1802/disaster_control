import { env } from '../../config/env.js';
import type { TomTomRouteRequest, TomTomRouteResult } from './tomtom.types.js';
import { MockTomTomClient } from './tomtom.mock.js';

export class TomTomClient {
  private readonly apiKey: string;
  private readonly baseUrl: string;
  private readonly timeoutMs: number;
  private readonly mockFallback: MockTomTomClient;

  constructor() {
    this.apiKey = env.TOMTOM_API_KEY;
    this.baseUrl = env.TOMTOM_BASE_URL;
    this.timeoutMs = env.TOMTOM_TIMEOUT_MS;
    this.mockFallback = new MockTomTomClient();
  }

  public async calculateRoute(request: TomTomRouteRequest): Promise<TomTomRouteResult> {
    // If mock key or test mode, use deterministic mock immediately
    if (this.apiKey === 'mock_tomtom_key_for_dev_mode' || env.NODE_ENV === 'test') {
      return this.mockFallback.calculateRoute(request);
    }

    const { origin, destination } = request;
    const locations = `${origin.latitude},${origin.longitude}:${destination.latitude},${destination.longitude}`;
    const url = `${this.baseUrl}/routing/1/calculateRoute/${locations}/json?key=${this.apiKey}&traffic=true&travelMode=truck`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        console.warn(`TomTom API responded with status ${response.status}. Falling back to resilient routing engine.`);
        return this.mockFallback.calculateRoute(request);
      }

      const data = await response.json() as {
        routes?: Array<{
          summary: { lengthInMeters: number; travelTimeInSeconds: number; trafficDelayInSeconds: number; departureTime: string; arrivalTime: string };
          legs?: Array<{ points: Array<{ latitude: number; longitude: number }> }>;
        }>;
      };

      if (!data.routes || data.routes.length === 0) {
        return this.mockFallback.calculateRoute(request);
      }

      const primaryRoute = data.routes[0];
      const distanceKm = Math.round((primaryRoute.summary.lengthInMeters / 1000) * 10) / 10;
      const durationMinutes = Math.round(primaryRoute.summary.travelTimeInSeconds / 60);
      const trafficDelayMinutes = Math.round((primaryRoute.summary.trafficDelayInSeconds || 0) / 60);

      const coordinates: Array<[number, number]> = [];
      if (primaryRoute.legs) {
        for (const leg of primaryRoute.legs) {
          for (const pt of leg.points) {
            coordinates.push([pt.longitude, pt.latitude]);
          }
        }
      }

      return {
        provider: 'TOMTOM',
        distanceKm,
        durationMinutes,
        trafficDelayMinutes,
        geometryGeoJson: {
          type: 'LineString',
          coordinates: coordinates.length > 0 ? coordinates : [
            [origin.longitude, origin.latitude],
            [destination.longitude, destination.latitude]
          ]
        },
        summary: {
          departureTime: primaryRoute.summary.departureTime || new Date().toISOString(),
          arrivalTime: primaryRoute.summary.arrivalTime || new Date(Date.now() + durationMinutes * 60000).toISOString()
        }
      };
    } catch (err) {
      clearTimeout(timeoutId);
      console.warn('TomTom routing call timed out or failed. Utilizing internal routing engine:', err);
      return this.mockFallback.calculateRoute(request);
    }
  }
}

export const tomtomClient = new TomTomClient();
