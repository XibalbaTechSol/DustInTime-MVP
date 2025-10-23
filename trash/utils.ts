// Original location: /home/xibalbasolutions/Desktop/DustInTime-MVP/utils.ts
import { Point, Cleaner, Booking, Badge, RouteResponse } from './types';
import polyline from '@mapbox/polyline';

const VALHALLA_API_URL = 'https://valhalla1.openstreetmap.de/route';

/**
 * Fetches a route from the Valhalla API.
 *
 * @param start The starting geographical point.
 * @param end The ending geographical point.
 * @returns An array of points representing the route.
 */
export const getRoute = async (start: Point, end: Point): Promise<RouteResponse> => {
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
      const leg = data.trip.legs[0];
      const shape = leg.shape;
      const maneuvers = leg.maneuvers;
      // The polyline library expects [lat, lon] pairs, but Valhalla returns an encoded polyline with 6 decimal places of precision.
      // The mapbox/polyline library decodes to [lat, lon] pairs, which is what we need.
      const decoded = polyline.decode(shape, 6);
      const route = decoded.map(([lat, lng]) => ({ lat, lng }));
      return { route, maneuvers };
    } else {
      console.error('No route found in Valhalla response:', data);
      return { route: [], maneuvers: [] };
    }
  } catch (error) {
    console.error('Error fetching route from Valhalla:', error);
    return { route: [], maneuvers: [] };
  }
};

/**
 * Determines the appropriate badge for a cleaner based on their stats.
 * @param cleaner The cleaner object.
 * @returns The badge to be displayed.
 */
export const getCleanerBadge = (cleaner: Cleaner): Badge | null => {
    if (cleaner.rating >= 4.9 && cleaner.reviewsCount >= 50) {
        return 'Top Rated';
    }
    if (cleaner.hourlyRate <= 20 && cleaner.rating >= 4.7) {
        return 'Great Value';
    }
    if (cleaner.reviewsCount >= 10 && cleaner.reviewsCount < 50) {
        return 'Rising Star';
    }
    if (cleaner.reviewsCount < 10) {
        return 'New to Platform';
    }
    return null;
};

/**
 * Calculates available time slots for a cleaner on a given date.
 * @param date The selected date.
 * @param cleaner The cleaner for whom to calculate slots.
 * @param existingBookings An array of all existing bookings.
 * @param duration The duration of the new booking in hours.
 * @returns An array of strings representing available time slots.
 */
export const calculateAvailableSlots = (date: Date, cleaner: Cleaner, existingBookings: Booking[], duration: number): string[] => {
    const dayOfWeek = date.toLocaleDateString('en-US', { weekday: 'long' });
    const cleanerAvailability = cleaner.availability[dayOfWeek] || [];
    if (cleanerAvailability.length === 0) {
        return [];
    }

    const bookedSlots = existingBookings
        .filter(booking =>
            booking.cleaner.id === cleaner.id &&
            new Date(booking.date).toDateString() === date.toDateString()
        )
        .map(booking => {
            const bookingDate = new Date(booking.date);
            return {
                start: bookingDate.getHours(),
                end: bookingDate.getHours() + booking.hours,
            };
        });

    const availableSlots: string[] = [];
    cleanerAvailability.forEach(slot => {
        const [start, end] = slot.split(' - ').map(time => {
            const [hour, minute] = time.replace('am', '').replace('pm', '').split(':').map(Number);
            let h = hour;
            if (time.includes('pm') && h < 12) {
                h += 12;
            }
            if (time.includes('am') && h === 12) {
                h = 0;
            }
            return h;
        });

        for (let i = start; i <= end - duration; i++) {
            const slotStart = i;
            const slotEnd = i + duration;
            const isBooked = bookedSlots.some(bookedSlot =>
                (slotStart < bookedSlot.end && slotEnd > bookedSlot.start)
            );

            if (!isBooked) {
                const time = i > 12 ? `${i - 12}:00 PM` : (i === 12 ? '12:00 PM' : `${i}:00 AM`);
                availableSlots.push(time);
            }
        }
    });

    return availableSlots;
};
