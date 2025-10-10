import type { Cleaner, Badge, Booking } from './types';

/**
 * Determines the most appropriate badge for a cleaner based on their stats.
 * The order of the checks determines the priority of the badge.
 *
 * @param {Cleaner} cleaner The cleaner object to evaluate.
 * @returns {Badge | null} The most relevant badge for the cleaner, or null if none apply.
 */
export const getCleanerBadge = (cleaner: Cleaner): Badge | null => {
  const { rating, reviewsCount, hourlyRate } = cleaner;

  if (rating >= 4.9 && reviewsCount > 100) {
    return 'Top Rated';
  }
  if (hourlyRate <= 22 && rating >= 4.6) {
    return 'Great Value';
  }
  if (rating >= 4.7 && reviewsCount > 10 && reviewsCount <= 50) {
    return 'Rising Star';
  }
  if (reviewsCount < 10) {
    return 'New to Platform';
  }
  
  return null;
};


/**
 * Calculates the available time slots for a cleaner on a specific date by checking
 * their general availability against their existing bookings.
 *
 * @param {Date} date The date to check for availability.
 * @param {Cleaner} cleaner The cleaner whose schedule is being checked.
 * @param {Booking[]} existingBookings An array of all existing bookings to check for conflicts.
 * @param {number} [duration=3] The duration of the desired cleaning session in hours.
 * @returns {string[]} An array of available start times, formatted as strings (e.g., "10:00 AM").
 */
export const calculateAvailableSlots = (
    date: Date,
    cleaner: Cleaner,
    existingBookings: Booking[],
    duration: number = 3
): string[] => {
    // Helper to parse time strings like "9 AM - 5 PM" into [9, 17]
    const parseTimeRange = (timeRange: string): [number, number] => {
        const [start, end] = timeRange.split(' - ');
        const parseTime = (time: string): number => {
            const [hourStr, period] = time.split(' ');
            let hour = parseInt(hourStr, 10);
            if (period === 'PM' && hour !== 12) hour += 12;
            if (period === 'AM' && hour === 12) hour = 0; // Midnight case
            return hour;
        };
        return [parseTime(start), parseTime(end)];
    };
    
    // 1. Get cleaner's general availability for the selected day of the week
    const dayOfWeek = date.toLocaleDateString('en-US', { weekday: 'long' }); // e.g., "Monday"
    const generalAvailability = cleaner.availability[dayOfWeek] || [];
    if (generalAvailability.length === 0) {
        return []; // Cleaner is not available on this day
    }

    // 2. Get all bookings for this cleaner on the selected date
    const bookingsOnDate = existingBookings.filter(b => {
        return b.cleaner.id === cleaner.id &&
               new Date(b.date).toDateString() === date.toDateString();
    });

    // 3. Generate all potential 1-hour start slots from the cleaner's general availability
    let potentialSlots: number[] = [];
    generalAvailability.forEach(range => {
        const [startHour, endHour] = parseTimeRange(range);
        // The latest a job can start is `duration` hours before the end of the availability window.
        for (let h = startHour; h <= endHour - duration; h++) {
            potentialSlots.push(h);
        }
    });

    // 4. Filter out slots that conflict with existing bookings
    const availableSlots = potentialSlots.filter(slotStartHour => {
        const slotEndHour = slotStartHour + duration;

        // Check for overlap with any existing booking on this day
        return !bookingsOnDate.some(booking => {
            const bookingStartHour = new Date(booking.date).getHours();
            const bookingEndHour = bookingStartHour + booking.hours;

            // Overlap condition: (SlotStart < BookingEnd) and (SlotEnd > BookingStart)
            return slotStartHour < bookingEndHour && slotEndHour > bookingStartHour;
        });
    });

    // 5. Format the available slots into a user-friendly time string (e.g., "10:00 AM")
    return availableSlots.map(hour => {
        const d = new Date();
        d.setHours(hour, 0, 0, 0);
        return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    });
};