import type { Cleaner, Booking, Review, Conversation } from './types';

const REVIEWS_DATA: Review[] = [
  { id: 1, authorName: 'Sarah K.', authorImageUrl: 'https://picsum.photos/id/40/100/100', rating: 5, date: '2 weeks ago', comment: "Maria was absolutely fantastic! My apartment has never been cleaner. She was professional, punctual, and so thorough. Highly recommend!" },
  { id: 2, authorName: 'Mike P.', authorImageUrl: 'https://picsum.photos/id/41/100/100', rating: 5, date: '1 month ago', comment: "Incredible attention to detail. I've had many cleaners before, but Maria's quality of work is on another level. Will definitely book again." },
  { id: 3, authorName: 'Chen W.', authorImageUrl: 'https://picsum.photos/id/42/100/100', rating: 4, date: '3 months ago', comment: "Very happy with the service. She missed a small spot in the kitchen, but overall, a great job and a very pleasant person." },
  { id: 4, authorName: 'David L.', authorImageUrl: 'https://picsum.photos/id/43/100/100', rating: 5, date: '3 days ago', comment: 'James is a lifesaver. He organized my chaotic office space and left it sparkling. Super efficient and professional.' },
  { id: 5, authorName: 'Jessica R.', authorImageUrl: 'https://picsum.photos/id/44/100/100', rating: 5, date: '1 week ago', comment: "Emily's commitment to eco-friendly products is why I chose her, and the results were amazing. My home smells fresh and clean, not like chemicals." },
];


// Base cleaner data
const BASE_CLEANERS_DATA: Cleaner[] = [
  {
    id: 1,
    name: 'Maria Rodriguez',
    tagline: 'Meticulous cleaning with a personal touch.',
    hourlyRate: 25,
    rating: 4.9,
    reviewsCount: 124,
    bio: "With over 5 years of dedicated experience, I bring a meticulous attention to detail to every home I have the privilege of cleaning. My philosophy is simple: treat every space as if it were my own. I'm known for being reliable, friendly, and consistently going the extra mile to ensure my clients are delighted with the results. Your home's cleanliness and your satisfaction are my highest priorities.",
    services: ['Deep Cleaning', 'Residential', 'Move-in/out', 'Eco-Friendly'],
    specializedTasks: [
        { name: 'Deep Oven Cleaning', rate: 30, unit: 'per hour' },
        { name: 'Interior Refrigerator Cleaning', rate: 25, unit: 'per hour' },
    ],
    imageUrl: 'https://picsum.photos/id/1027/400/400',
    imageGallery: [
      'https://picsum.photos/id/10/800/600',
      'https://picsum.photos/id/11/800/600',
      'https://picsum.photos/id/12/800/600'
    ],
    reviews: REVIEWS_DATA.slice(0,3),
    location: { lat: 43.0389, lng: -87.9065 }, // Downtown Milwaukee
    startLocation: { lat: 43.0289, lng: -87.9165 }, // A bit south-west
    availability: {
      'Monday': ['9 AM - 12 PM', '2 PM - 5 PM'],
      'Tuesday': ['9 AM - 12 PM'],
      'Wednesday': ['9 AM - 5 PM'],
      'Thursday': [],
      'Friday': ['9 AM - 1 PM'],
      'Saturday': [],
      'Sunday': [],
    },
  },
  {
    id: 2,
    name: 'James Smith',
    tagline: 'Efficient, thorough, and professional.',
    hourlyRate: 22,
    rating: 4.8,
    reviewsCount: 89,
    bio: 'I specialize in transforming cluttered spaces into pristine, organized environments. Efficiency is key to my process, but I never compromise on thoroughness. I come fully equipped with my own high-quality, professional-grade cleaning supplies to tackle any job, big or small. Let me restore order and cleanliness to your home or office.',
    services: ['Standard Cleaning', 'Office', 'Organization', 'Window Cleaning'],
     specializedTasks: [
        { name: 'Interior Window Cleaning', rate: 25, unit: 'per hour' },
    ],
    imageUrl: 'https://picsum.photos/id/1005/400/400',
    imageGallery: [
      'https://picsum.photos/id/20/800/600',
      'https://picsum.photos/id/21/800/600',
      'https://picsum.photos/id/22/800/600'
    ],
    reviews: REVIEWS_DATA.slice(3,4),
    location: { lat: 42.7261, lng: -87.7828 }, // Racine
    startLocation: { lat: 42.7361, lng: -87.7928 }, // A bit north-west
    availability: {
      'Monday': ['10 AM - 6 PM'],
      'Tuesday': ['10 AM - 6 PM'],
      'Wednesday': ['10 AM - 6 PM'],
      'Thursday': ['10 AM - 6 PM'],
      'Friday': ['10 AM - 6 PM'],
      'Saturday': [],
      'Sunday': [],
    },
  },
  {
    id: 3,
    name: 'Emily Chen',
    tagline: 'Eco-friendly cleaning for a healthy home.',
    hourlyRate: 28,
    rating: 5.0,
    reviewsCount: 210,
    bio: 'I am deeply passionate about creating healthy and sustainable living environments. My cleaning method exclusively uses non-toxic, biodegradable, and eco-friendly products to ensure your home is not only sparkling clean but also completely safe for your family, pets, and the planet. Experience a different kind of clean—one that feels as good as it looks.',
    services: ['Eco-Friendly', 'Deep Cleaning', 'Apartment', 'Kitchen & Bath'],
    specializedTasks: [
        { name: 'Carpet Shampooing', rate: 50, unit: 'per hour' },
        { name: 'Upholstery Cleaning', rate: 45, unit: 'per hour' },
    ],
    imageUrl: 'https://picsum.photos/id/1011/400/400',
     imageGallery: [
      'https://picsum.photos/id/30/800/600',
      'https://picsum.photos/id/31/800/600',
      'https://picsum.photos/id/32/800/600'
    ],
    reviews: REVIEWS_DATA.slice(4,5),
    location: { lat: 43.0117, lng: -88.2315 }, // Waukesha
    startLocation: { lat: 43.0217, lng: -88.2415 }, // A bit north
    availability: {
      'Monday': [],
      'Tuesday': ['8 AM - 4 PM'],
      'Wednesday': ['8 AM - 4 PM'],
      'Thursday': ['8 AM - 4 PM'],
      'Friday': [],
      'Saturday': ['10 AM - 2 PM'],
      'Sunday': ['10 AM - 2 PM'],
    },
  },
  {
    id: 4,
    name: 'David Johnson',
    tagline: 'Hotel-quality cleaning for your home.',
    hourlyRate: 24,
    rating: 4.7,
    reviewsCount: 75,
    bio: 'As a former hotel housekeeper for a luxury chain, I bring a professional, systematic approach to residential cleaning. No corner is left untouched, and no detail is too small. My training means I work efficiently and to the highest standards of cleanliness and presentation. Your satisfaction is my personal guarantee.',
    services: ['Residential', 'Deep Cleaning', 'Laundry', 'Post-Construction'],
    specializedTasks: [
        { name: 'Lawn Work', rate: 40, unit: 'per hour' },
        { name: 'Pressure Washing', rate: 60, unit: 'per hour' }
    ],
    imageUrl: 'https://picsum.photos/id/1012/400/400',
    imageGallery: [],
    reviews: [],
    location: { lat: 42.5847, lng: -87.8212 }, // Kenosha
    startLocation: { lat: 42.5747, lng: -87.8112 }, // A bit south-east
    availability: {
      'Monday': ['9 AM - 5 PM'],
      'Tuesday': ['9 AM - 5 PM'],
      'Wednesday': ['9 AM - 5 PM'],
      'Thursday': ['9 AM - 5 PM'],
      'Friday': ['9 AM - 5 PM'],
      'Saturday': [],
      'Sunday': [],
    },
  },
  {
    id: 5,
    name: 'Sophia Williams',
    tagline: 'Luxury service for high-end homes.',
    hourlyRate: 30,
    rating: 4.9,
    reviewsCount: 150,
    bio: "I provide a discreet, premium cleaning service for luxury apartments and high-end homes. I am meticulous about details, from perfectly polished surfaces to flawlessly organized spaces. I understand the importance of trust and professionalism when working in a client's private residence. Let me maintain the beauty of your home.",
    services: ['Luxury Homes', 'Deep Cleaning', 'Organization', 'Eco-Friendly'],
    imageUrl: 'https://picsum.photos/id/1013/400/400',
    imageGallery: [],
    reviews: [],
    location: { lat: 43.0600, lng: -88.1079 }, // Brookfield
    startLocation: { lat: 43.0700, lng: -88.1179 }, // Further out
    availability: {
      'Monday': ['10 AM - 3 PM'],
      'Tuesday': [],
      'Wednesday': ['10 AM - 3 PM'],
      'Thursday': [],
      'Friday': ['10 AM - 3 PM'],
      'Saturday': [],
      'Sunday': [],
    },
  },
  {
    id: 6,
    name: 'Michael Brown',
    tagline: 'Dependable cleaning, flexible schedule.',
    hourlyRate: 20,
    rating: 4.6,
    reviewsCount: 62,
    bio: 'Looking for consistent, reliable cleaning? I am a hardworking and dependable cleaner, perfect for regular maintenance cleaning to keep your home fresh week after week. I offer flexible scheduling to fit your busy life and am committed to being a trustworthy presence in your home.',
    services: ['Standard Cleaning', 'Weekly Service', 'Small Offices', 'Apartment'],
    imageUrl: 'https://picsum.photos/id/1014/400/400',
    imageGallery: [],
    reviews: [],
    location: { lat: 42.8856, lng: -87.8642 }, // Oak Creek
    startLocation: { lat: 42.8756, lng: -87.8542 }, // Further south
    availability: {
      'Monday': [],
      'Tuesday': ['9 AM - 5 PM'],
      'Wednesday': ['9 AM - 5 PM'],
      'Thursday': ['9 AM - 5 PM'],
      'Friday': ['9 AM - 12 PM'],
      'Saturday': ['10 AM - 4 PM'],
      'Sunday': [],
    },
  },
];

// --- Data Generation for additional cleaners ---

const firstNames = ['Olivia', 'Liam', 'Emma', 'Noah', 'Amelia', 'Oliver', 'Ava', 'Elijah', 'Sophia', 'Mateo', 'Isabella', 'Lucas', 'Mia', 'Levi', 'Charlotte', 'Asher', 'Luna', 'James', 'Gianna', 'Leo', 'Aurora', 'Grayson', 'Violet', 'Ezra', 'Scarlett'];
const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin'];
const taglines = ['Bringing sparkle to your space.','Your home, spotlessly clean.','Quality cleaning you can trust.','Life is busy. Let us clean.','A fresh take on clean.','Expert cleaning services for you.','The clean you expect. The service you deserve.',];
const bios = ["Dedicated to providing a top-notch cleaning service, I pride myself on reliability and attention to detail. I'm passionate about creating clean and healthy environments for my clients.","With years of experience in the cleaning industry, I offer a comprehensive and efficient service. My goal is to exceed your expectations and leave your space immaculate.","I believe a clean home is a happy home. I use effective techniques and products to ensure a deep and lasting clean. Your satisfaction is my top priority.",];
const allServices = ['Deep Cleaning', 'Residential', 'Move-in/out', 'Eco-Friendly', 'Office', 'Organization', 'Window Cleaning', 'Kitchen & Bath', 'Laundry', 'Post-Construction'];
const latRange = { min: 42.5, max: 43.2 }; // Bounding box for Southeast Wisconsin
const lngRange = { min: -88.4, max: -87.8 };
const generatedCleaners: Cleaner[] = [];

for (let i = 0; i < 194; i++) {
  const id = i + 7;
  const randomFirstName = firstNames[Math.floor(Math.random() * firstNames.length)];
  const randomLastName = lastNames[Math.floor(Math.random() * lastNames.length)];
  const numServices = Math.floor(Math.random() * 3) + 2;
  const services = [...allServices].sort(() => 0.5 - Math.random()).slice(0, numServices);
  const lat = Math.random() * (latRange.max - latRange.min) + latRange.min;
  const lng = Math.random() * (lngRange.max - lngRange.min) + lngRange.min;
  
  generatedCleaners.push({
    id,
    name: `${randomFirstName} ${randomLastName}`,
    tagline: taglines[Math.floor(Math.random() * taglines.length)],
    hourlyRate: Math.floor(Math.random() * 21) + 20,
    rating: parseFloat((Math.random() * (5.0 - 4.2) + 4.2).toFixed(1)),
    reviewsCount: Math.floor(Math.random() * 250) + 20,
    bio: bios[Math.floor(Math.random() * bios.length)],
    services: services,
    imageUrl: `https://picsum.photos/id/${110 + i}/400/400`,
    imageGallery: [],
    reviews: [],
    location: { lat, lng },
    startLocation: { lat: lat + (Math.random() - 0.5) * 0.1, lng: lng + (Math.random() - 0.5) * 0.1 },
    availability: { 'Monday': ['9 AM - 5 PM'],'Tuesday': ['9 AM - 5 PM'],'Wednesday': ['9 AM - 5 PM'],'Thursday': ['9 AM - 5 PM'],'Friday': ['9 AM - 5 PM'],'Saturday': [],'Sunday': [],},
  });
}

export const CLEANERS_DATA: Cleaner[] = BASE_CLEANERS_DATA.concat(generatedCleaners);


const now = new Date();
const getFutureDate = (minutes: number) => new Date(now.getTime() + minutes * 60000).toISOString();
const getPastDate = (days: number) => new Date(now.getTime() - days * 24 * 60 * 60 * 1000).toISOString();
const getFutureDateFromTime = (days: number, hour: number) => {
    const future = new Date();
    future.setDate(future.getDate() + days);
    future.setHours(hour, 0, 0, 0);
    return future.toISOString();
};


export const BOOKINGS_DATA: Booking[] = [
  {
    id: 'job1',
    cleaner: CLEANERS_DATA[0],
    clientName: 'Alex Doe',
    clientAddress: '123 Main St, Milwaukee, WI',
    clientLocation: { lat: 43.05, lng: -87.95 },
    date: getFutureDate(5), // 5 minutes from now
    status: 'active',
    service: 'Full House Deep Clean',
    hours: 4,
    costDetails: { subtotal: 100, specializedTasksTotal: 0, platformFee: 5, total: 105 },
  },
  {
    id: 'job2',
    cleaner: CLEANERS_DATA[2],
    clientName: 'Alex Doe',
    clientAddress: '123 Main St, Milwaukee, WI',
    clientLocation: { lat: 43.05, lng: -87.95 },
    date: getFutureDate(2 * 24 * 60), // 2 days from now
    status: 'upcoming',
    service: 'Eco-Friendly Apartment Clean',
    hours: 3,
    specializedTasks: [{ name: 'Carpet Shampooing', rate: 50, unit: 'per hour' }],
    costDetails: { subtotal: 84, specializedTasksTotal: 150, platformFee: 11.7, total: 245.7 },
  },
  {
    id: 'job3',
    cleaner: CLEANERS_DATA[1],
    clientName: 'Alex Doe',
    clientAddress: '123 Main St, Milwaukee,WI',
    clientLocation: { lat: 43.05, lng: -87.95 },
    date: getPastDate(14), // 2 weeks ago
    status: 'completed',
    service: 'Office Organization',
    hours: 5,
    costDetails: { subtotal: 110, specializedTasksTotal: 0, platformFee: 5.5, total: 115.5 },
  },
  {
    id: 'job4',
    cleaner: CLEANERS_DATA[3],
    clientName: 'Alex Doe',
    clientAddress: '123 Main St, Milwaukee, WI',
    clientLocation: { lat: 43.05, lng: -87.95 },
    date: getPastDate(40), // 40 days ago
    status: 'completed',
    service: 'Luxury Condo Cleaning',
    hours: 4,
    specializedTasks: [
        { name: 'Lawn Work', rate: 40, unit: 'per hour' },
        { name: 'Pressure Washing', rate: 60, unit: 'per hour' }
    ],
    costDetails: { subtotal: 96, specializedTasksTotal: 400, platformFee: 24.8, total: 520.8 },
  },
  // --- New bookings for availability testing ---
  {
    id: 'job5-maria-future',
    cleaner: CLEANERS_DATA[0], // Maria Rodriguez
    clientName: 'Jane Smith',
    clientAddress: '456 Oak Ave, Milwaukee, WI',
    clientLocation: { lat: 43.06, lng: -87.96 },
    date: getFutureDateFromTime(5, 9), // 5 days from now at 9 AM
    status: 'upcoming',
    service: 'Standard Clean',
    hours: 3, // This books her from 9 AM to 12 PM
    costDetails: { subtotal: 75, specializedTasksTotal: 0, platformFee: 3.75, total: 78.75 },
  },
  {
    id: 'job6-maria-future-2',
    cleaner: CLEANERS_DATA[0], // Maria Rodriguez
    clientName: 'Bob Johnson',
    clientAddress: '789 Pine Ln, Milwaukee, WI',
    clientLocation: { lat: 43.07, lng: -87.97 },
    date: getFutureDateFromTime(5, 14), // 5 days from now at 2 PM
    status: 'upcoming',
    service: 'Deep Cleaning',
    hours: 2, // This books her from 2 PM to 4 PM
    costDetails: { subtotal: 50, specializedTasksTotal: 0, platformFee: 2.5, total: 52.5 },
  },
  {
    id: 'job7-emily-future',
    cleaner: CLEANERS_DATA[2], // Emily Chen
    clientName: 'Chris Lee',
    clientAddress: '101 Maple Rd, Waukesha, WI',
    clientLocation: { lat: 43.01, lng: -88.23 },
    date: getFutureDateFromTime(3, 10), // 3 days from now at 10 AM
    status: 'upcoming',
    service: 'Eco-Friendly Kitchen & Bath',
    hours: 4, // Books her from 10 AM to 2 PM
    costDetails: { subtotal: 112, specializedTasksTotal: 0, platformFee: 5.6, total: 117.6 },
  },
];


// --- Messaging Data ---
const getMessageDate = (minutesAgo: number): string => new Date(Date.now() - minutesAgo * 60000).toISOString();

export const CONVERSATIONS_DATA: Conversation[] = [
  {
    id: `client-${CLEANERS_DATA[0].id}`,
    cleaner: CLEANERS_DATA[0],
    messages: [
      { id: 'msg1', senderId: 'client', text: 'Hi Maria, just wanted to confirm our booking for this Wednesday. Is 10 AM still good for you?', timestamp: getMessageDate(60) },
      { id: 'msg2', senderId: 1, text: 'Hi Alex! Yes, 10 AM is perfect. I look forward to it!', timestamp: getMessageDate(58) },
      { id: 'msg3', senderId: 'client', text: 'Great! Also, I have a friendly golden retriever. I can keep him in a separate room if you prefer.', timestamp: getMessageDate(30) },
      { id: 'msg4', senderId: 1, text: "Oh, that's no problem at all! I love dogs. See you on Wednesday!", timestamp: getMessageDate(25) },
    ],
  },
  {
    id: `client-${CLEANERS_DATA[2].id}`,
    cleaner: CLEANERS_DATA[2],
    messages: [
      { id: 'msg5', senderId: 'client', text: "Hi Emily, I'm so excited for my first eco-friendly cleaning! Do I need to provide anything?", timestamp: getMessageDate(120) },
      { id: 'msg6', senderId: 3, text: "Hi! Not at all, I bring all my own certified eco-friendly supplies. You don't need to worry about a thing.", timestamp: getMessageDate(115) },
    ],
  },
    {
    id: `client-${CLEANERS_DATA[1].id}`,
    cleaner: CLEANERS_DATA[1],
    messages: [
      { id: 'msg7', senderId: 2, text: 'Hi Alex, just a reminder about our office organization session tomorrow afternoon.', timestamp: getMessageDate(24 * 60 + 30) },
      { id: 'msg8', senderId: 'client', text: 'Thanks, James! Looking forward to tackling the chaos.', timestamp: getMessageDate(24 * 60) },
    ],
  },
];