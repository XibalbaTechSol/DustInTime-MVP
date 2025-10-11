export const CLEANERS_DATA = [
  {
    id: 1,
    name: 'Jane Doe',
    rating: 4.8,
    reviews: 120,
    imageUrl: 'https://i.pravatar.cc/150?img=1',
    specialties: ['Deep Cleaning', 'Window Washing'],
    availability: ['Monday', 'Wednesday', 'Friday'],
    bio: 'Experienced cleaner with a passion for making homes sparkle. I specialize in deep cleaning and have a keen eye for detail.',
    startLocation: { lat: 43.0731, lng: -89.4012 },
    distance: 5,
  },
  {
    id: 2,
    name: 'John Smith',
    rating: 4.9,
    reviews: 95,
    imageUrl: 'https://i.pravatar.cc/150?img=2',
    specialties: ['Eco-Friendly Cleaning', 'Carpet Cleaning'],
    availability: ['Tuesday', 'Thursday', 'Saturday'],
    bio: 'I use only the best eco-friendly products to ensure your home is not only clean but also safe for your family and pets.',
    startLocation: { lat: 43.0731, lng: -89.4012 },
    distance: 10,
  },
];

export const CONVERSATIONS_DATA = [
    {
        id: 'client-cleaner-1',
        participants: ['client-alex-doe', 1],
        messages: [
            { sender: 'client-alex-doe', text: 'Hi Jane, looking forward to the cleaning on Friday!', timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() },
            { sender: 1, text: "Hi Alex! I'm all set. See you then!", timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + 5 * 60 * 1000).toISOString() },
            { sender: 'client-alex-doe', text: 'Can you make sure to pay extra attention to the kitchen?', timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString() },
        ]
    },
    {
        id: 'client-cleaner-2',
        participants: ['client-alex-doe', 2],
        messages: [
            { sender: 'client-alex-doe', text: 'Hey John, just confirming our booking for tomorrow.', timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString() },
            { sender: 2, text: 'Confirmed! I will be there at 10 AM sharp.', timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000 + 10 * 60 * 1000).toISOString() },
        ]
    }
];