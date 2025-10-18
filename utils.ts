import { Point } from './types';
import polyline from '@mapbox/polyline';

const VALHALLA_API_URL = 'https://valhalla1.openstreetmap.de/route';

/**
 * Fetches a route from the Valhalla API.
 *
 * @param start The starting geographical point.
 * @param end The ending geographical point.
 * @returns An array of points representing the route.
 */
export const getRoute = async (start: Point, end: Point): Promise<Point[]> => {
  const request = {
    locations: [
      { lat: start.lat, lon: start.lng },
      { lat: end.lat, lon: end.lng },
    ],
    costing: 'auto',
  };

  try {
    const response = await fetch(`${VALHALLA_API_URL}?json=${JSON.stringify(request)}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();

    if (data.trip && data.trip.legs && data.trip.legs.length > 0) {
      const shape = data.trip.legs[0].shape;
      // The polyline library expects [lat, lon] pairs, but Valhalla returns an encoded polyline with 6 decimal places of precision.
      // The mapbox/polyline library decodes to [lat, lon] pairs, which is what we need.
      const decoded = polyline.decode(shape, 6);
      return decoded.map(([lat, lng]) => ({ lat, lng }));
    } else {
      console.error('No route found in Valhalla response:', data);
      return [];
    }
  } catch (error) {
    console.error('Error fetching route from Valhalla:', error);
    return [];
  }
};