import { describe, it, expect } from 'vitest';
import { MockTomTomClient } from '../integrations/tomtom/tomtom.mock.js';
import { TomTomClient } from '../integrations/tomtom/tomtom.client.js';

describe('TomTom Routing & Risk Engine', () => {
  const mockClient = new MockTomTomClient();
  const tomtomClient = new TomTomClient();

  it('Calculates valid route between Dehradun and Rishikesh coordinates', async () => {
    const origin = { latitude: 30.3450, longitude: 78.0550 };
    const destination = { latitude: 30.1350, longitude: 78.3220 };

    const result = await mockClient.calculateRoute({ origin, destination });

    expect(result.distanceKm).toBeGreaterThan(10);
    expect(result.durationMinutes).toBeGreaterThan(15);
    expect(result.geometryGeoJson.type).toBe('LineString');
    expect(result.geometryGeoJson.coordinates.length).toBeGreaterThanOrEqual(2);
  });

  it('TomTom client gracefully falls back when mock key is provided', async () => {
    const origin = { latitude: 30.3450, longitude: 78.0550 };
    const destination = { latitude: 30.1350, longitude: 78.3220 };

    const result = await tomtomClient.calculateRoute({ origin, destination });

    expect(result).toBeDefined();
    expect(result.distanceKm).toBeGreaterThan(0);
    expect(result.durationMinutes).toBeGreaterThan(0);
  });
});
