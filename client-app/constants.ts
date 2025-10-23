import type { Cleaner } from './types';

export const BASE_URL = window.location.hostname === 'localhost'
  ? 'http://localhost:3000'
  : import.meta.env.VITE_API_BASE_URL;

export const CLEANERS_DATA: Cleaner[] = [
  {
    id: '1',
    name: 'Jane Doe',
    tagline: 'Experienced and reliable cleaner.',
    hourlyRate: 25,
    rating: 4.8,
    reviewsCount: 120,
    bio: 'I have been a professional cleaner for over 5 years. I am passionate about my work and always strive to provide the best service possible. I am reliable, trustworthy, and detail-oriented. I am confident that you will be satisfied with my work.',
    services: ['Standard Cleaning', 'Deep Cleaning', 'Move-in/out Cleaning'],
    specializedTasks: [
      { name: 'Oven Cleaning', rate: 20, unit: 'per hour' },
      { name: 'Window Cleaning', rate: 25, unit: 'per hour' },
    ],
    imageUrl: 'https://i.pravatar.cc/150?img=1',
    imageGallery: [
        'https://i.pravatar.cc/400?img=2',
        'https://i.pravatar.cc/400?img=3',
        'https://i.pravatar.cc/400?img=4',
    ],
    reviews: [
      {
        id: '1',
        cleanerId: '1',
        clientId: 'mock-client-id',
        bookingId: 'mock-booking-id',
        authorName: 'John Smith',
        authorImageUrl: 'https://i.pravatar.cc/100?img=5',
        rating: 5,
        comment: 'Jane is the best cleaner I have ever had. She is always on time, and my apartment is always sparkling clean after she leaves.',
        date: '2023-10-26',
        created_at: '2023-10-26T10:00:00Z',
      },
    ],
    location: { lat: 34.052235, lng: -118.243683 },
    startLocation: { lat: 34.052235, lng: -118.243683 },
    availability: {
      Monday: ['9am - 12pm', '2pm - 5pm'],
      Wednesday: ['10am - 1pm'],
      Friday: ['9am - 5pm'],
    },
  },
];