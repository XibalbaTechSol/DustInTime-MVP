/**
 * Represents a review provided by a client for a cleaner.
 */
export interface Review {
  id: number;
  authorName: string;
  authorImageUrl: string;
  rating: number;
  comment: string;
  date: string;
}

/**
 * Represents a specialized task that a cleaner can perform at an additional cost.
 */
export interface SpecializedTask {
  name: string;
  rate: number;
  unit: 'per hour';
}

/**
 * Represents the possible badges a cleaner can have.
 */
export type Badge = 'Top Rated' | 'Great Value' | 'Rising Star' | 'New to Platform';

/**
 * Represents a cleaner available on the platform.
 */
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

/**
 * Represents the profile of a client user.
 */
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

/**
 * Represents the profile of a cleaner user.
 */
export interface CleanerProfile {
  hourlyRate: number;
  bio: string;
  services: string[];
  serviceArea: string; // e.g., zip code
}

/**
 * Represents a user of the application, who can be a client or a cleaner.
 */
export interface User {
  id: number | string;
  name: string;
  email: string;
  picture: string;
  role?: 'client' | 'cleaner';
  profile?: ClientProfile | CleanerProfile;
}

/**
 * Represents a single task in a task list.
 */
export interface Task {
  id: string;
  text: string;
  completed: boolean;
  dueDate?: string;
  reminderSent?: boolean;
}

/**
 * Represents a list of tasks.
 */
export interface TaskList {
  id:string;
  name: string;
  tasks: Task[];
}

/**
 * Represents the detailed breakdown of the cost of a booking.
 */
export interface CostDetails {
  subtotal: number;
  specializedTasksTotal: number;
  platformFee: number;
  total: number;
}

/**
 * Represents a booking of a cleaner by a client.
 */
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

/**
 * Represents a single message in a conversation.
 */
export interface Message {
  id: string;
  senderId: 'client' | number; // 'client' for the user, cleaner's ID for the cleaner
  text: string;
  timestamp: string;
}

/**
 * Represents a conversation between a client and a cleaner.
 */
export interface Conversation {
  id: string; // e.g., 'client-1' for conversation between client and cleaner 1
  cleaner: Cleaner;
  messages: Message[];
  lastMessagePreview?: string;
  lastMessageTimestamp?: string;
}