import type { TomTomRouteRequest, TomTomRouteResult } from './tomtom.types.js';

export class MockTomTomClient {
  public async calculateRoute(request: TomTomRouteRequest): Promise<TomTomRouteResult> {
    const { origin, destination } = request;

    // Calculate approximate Great Circle distance in km
    const dLat = (destination.latitude - origin.latitude) * (Math.PI / 180);
    const dLon = (destination.longitude - origin.longitude) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(origin.latitude * (Math.PI / 180)) *
        Math.cos(destination.latitude * (Math.PI / 180)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const rawDistanceKm = Math.round(6371 * c * 10) / 10;
    const distanceKm = Math.max(5.0, rawDistanceKm * 1.35); // Factoring mountain passes & road winding
    const durationMinutes = Math.round((distanceKm / 42) * 60); // Average speed 42 km/h in hill terrain

    // Intermediate waypoint interpolation
    const midLat = (origin.latitude + destination.latitude) / 2 + 0.02;
    const midLng = (origin.longitude + destination.longitude) / 2 - 0.01;

    const coordinates: Array<[number, number]> = [
      [origin.longitude, origin.latitude],
      [midLng, midLat],
      [destination.longitude, destination.latitude]
    ];

    return {
      provider: 'MOCK_ENGINE',
      distanceKm,
      durationMinutes,
      trafficDelayMinutes: 5,
      geometryGeoJson: {
        type: 'LineString',
        coordinates
      },
      summary: {
        departureTime: new Date().toISOString(),
        arrivalTime: new Date(Date.now() + durationMinutes * 60000).toISOString()
      }
    };
  }
}
