export interface Coordinate {
  latitude: number;
  longitude: number;
}

export interface TomTomRouteRequest {
  origin: Coordinate;
  destination: Coordinate;
  waypoints?: Coordinate[];
  avoidHazards?: Coordinate[];
  departAt?: string;
  vehicleMaxSpeed?: number;
}

export interface TomTomRouteSummary {
  lengthInMeters: number;
  travelTimeInSeconds: number;
  trafficDelayInSeconds: number;
  departureTime: string;
  arrivalTime: string;
}

export interface TomTomRouteLeg {
  summary: TomTomRouteSummary;
  points: Array<{ latitude: number; longitude: number }>;
}

export interface TomTomRouteResult {
  provider: 'TOMTOM' | 'MOCK_ENGINE';
  distanceKm: number;
  durationMinutes: number;
  trafficDelayMinutes: number;
  geometryGeoJson: {
    type: 'LineString';
    coordinates: Array<[number, number]>; // [lng, lat]
  };
  summary: {
    departureTime: string;
    arrivalTime: string;
  };
}
