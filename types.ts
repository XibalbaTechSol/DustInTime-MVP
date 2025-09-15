export interface Review {
  id: number;
  authorName: string;
  authorImageUrl: string;
  rating: number;
  comment: string;
  date: string;
}

export interface SpecializedTask {
  name: string;
  rate: number;
  unit: 'per hour';
}

export type Badge = 'Top Rated' | 'Great Value' | 'Rising Star' | 'New to Platform';

export interface Cleaner {
  id: number;
  name: string;
  tagline: string;
  hourlyRate: number;
  rating: number;
  reviewsCount: number;
  bio: string;
  services: string[];
  specializedTasks?: SpecializedTask[];
  imageUrl: string;
  imageGallery: string[];
  reviews: Review[];
  location: {
    lat: number;
    lng: number;
  };
  startLocation: { // For tracking simulation
    lat: number;
    lng: number;
  };
  availability: {
    [day: string]: string[];
  };
  distance?: number;
  badge?: Badge | null;
}

// Client-specific profile data
export interface ClientProfile {
  address: string;
  propertyType: 'Apartment' | 'House' | 'Townhouse' | 'Other';
  bedrooms: number;
  bathrooms: number;
  location: { // For tracking simulation
    lat: number;
    lng: number;
  };
}

// Cleaner-specific profile data
export interface CleanerProfile {
  hourlyRate: number;
  bio: string;
  services: string[];
  serviceArea: string; // e.g., zip code
}

// Updated User interface
export interface User {
  id: number | string;
  name: string;
  email: string;
  picture: string;
  role?: 'client' | 'cleaner';
  profile?: ClientProfile | CleanerProfile;
}

export interface Task {
  id: string;
  text: string;
  completed: boolean;
  dueDate?: string;
  reminderSent?: boolean;
}

export interface TaskList {
  id:string;
  name: string;
  tasks: Task[];
}

export interface CostDetails {
  subtotal: number;
  specializedTasksTotal: number;
  platformFee: number;
  total: number;
}

export interface Booking {
  id: string;
  cleaner: Cleaner;
  clientName: string;
  clientLocation: {
    lat: number;
    lng: number;
  };
  clientAddress: string;
  date: string; // e.g., "2024-08-15T10:00:00Z"
  status: 'upcoming' | 'active' | 'completed';
  service: string;
  hours: number;
  costDetails: CostDetails;
  specializedTasks?: SpecializedTask[];
}

// --- Messaging Types ---

export interface Message {
  id: string;
  senderId: 'client' | number; // 'client' for the user, cleaner's ID for the cleaner
  text: string;
  timestamp: string;
}

export interface Conversation {
  id: string; // e.g., 'client-1' for conversation between client and cleaner 1
  cleaner: Cleaner;
  messages: Message[];
  lastMessagePreview?: string;
  lastMessageTimestamp?: string;
}