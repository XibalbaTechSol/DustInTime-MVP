/**
 * Represents a single review left by a user for a cleaner.
 * @interface Review
 */
export interface Review {
  /** The unique identifier for the review. */
  id: number;
  /** The name of the user who wrote the review. */
  authorName: string;
  /** The URL for the reviewer's profile picture. */
  authorImageUrl: string;
  /** The star rating given (e.g., 1-5). */
  rating: number;
  /** The text content of the review. */
  comment: string;
  /** The date the review was posted. */
  date: string;
}

/**
 * Represents a specialized, add-on service offered by a cleaner.
 * @interface SpecializedTask
 */
export interface SpecializedTask {
  /** The name of the specialized task (e.g., "Oven Cleaning"). */
  name: string;
  /** The additional cost for this task. */
  rate: number;
  /** The unit of measurement for the rate. */
  unit: 'per hour';
}

/**
 * Defines the possible badges that can be assigned to a cleaner.
 * @type Badge
 */
export type Badge = 'Top Rated' | 'Great Value' | 'Rising Star' | 'New to Platform';

/**
 * Represents a cleaner's full profile and data.
 * @interface Cleaner
 */
export interface Cleaner {
  /** The unique identifier for the cleaner. */
  id: number;
  /** The cleaner's full name. */
  name: string;
  /** A short, catchy tagline for the cleaner. */
  tagline: string;
  /** The cleaner's hourly rate in USD. */
  hourlyRate: number;
  /** The cleaner's average star rating. */
  rating: number;
  /** The total number of reviews the cleaner has received. */
  reviewsCount: number;
  /** A detailed biography or description of the cleaner. */
  bio: string;
  /** A list of standard services the cleaner offers. */
  services: string[];
  /** An optional list of specialized, add-on tasks. */
  specializedTasks?: SpecializedTask[];
  /** The URL for the cleaner's primary profile image. */
  imageUrl: string;
  /** An array of URLs for the cleaner's photo gallery. */
  imageGallery: string[];
  /** An array of review objects associated with the cleaner. */
  reviews: Review[];
  /** The cleaner's geographical location. */
  location: Point;
  /** The starting location for a job, used in the tracking simulation. */
  startLocation: Point;
  /** An object mapping days of the week to available time slots. */
  availability: {
    [day: string]: string[];
  };
  /** The calculated distance from the user to the cleaner, in miles. */
  distance?: number;
  /** The badge assigned to the cleaner based on their stats. */
  badge?: Badge | null;
}

/**
 * Represents the profile data specific to a 'client' user.
 * @interface ClientProfile
 */
export interface ClientProfile {
  /** The client's primary address. */
  address: string;
  /** The type of property to be cleaned. */
  propertyType: 'Apartment' | 'House' | 'Townhouse' | 'Other';
  /** The number of bedrooms at the property. */
  bedrooms: number;
  /** The number of bathrooms at the property. */
  bathrooms: number;
  /** The client's geographical location, used for job tracking. */
  location: Point;
}

/**
 * Represents the profile data specific to a 'cleaner' user.
 * @interface CleanerProfile
 */
export interface CleanerProfile {
  /** The cleaner's hourly rate in USD. */
  hourlyRate: number;
  /** A detailed biography or description of the cleaner. */
  bio: string;
  /** A list of services the cleaner offers. */
  services: string[];
  /** The primary area where the cleaner operates (e.g., zip code or city). */
  serviceArea: string;
}

/**
 * Represents a user of the application, who can be either a client or a cleaner.
 * @interface User
 */
export interface User {
  /** The unique identifier for the user. */
  id: number | string;
  /** The user's full name. */
  name: string;
  /** The user's email address. */
  email: string;
  /** The URL for the user's profile picture. */
  picture: string;
  /** The role of the user within the application. */
  role?: 'client' | 'cleaner';
  onboardingComplete?: number;
  /** A role-specific profile object containing additional data. */
  profile?: ClientProfile | CleanerProfile;
}

/**
 * Represents a single task within a TaskList.
 * @interface Task
 */
export interface Task {
  /** The unique identifier for the task. */
  id: string;
  /** The text content of the task. */
  text: string;
  /** Whether the task has been completed. */
  completed: boolean;
  /** An optional due date for the task, in ISO format. */
  dueDate?: string;
  /** A flag to indicate if a reminder notification has been sent for this task. */
  reminderSent?: boolean;
}

/**
 * Represents a list of tasks.
 * @interface TaskList
 */
export interface TaskList {
  /** The unique identifier for the list. */
  id:string;
  /** The name of the task list. */
  name: string;
  /** An array of Task objects belonging to this list. */
  tasks: Task[];
}

/**
 * Represents a detailed breakdown of the costs for a booking.
 * @interface CostDetails
 */
export interface CostDetails {
  /** The base cost calculated from the hourly rate and duration. */
  subtotal: number;
  /** The total cost of any selected specialized tasks. */
  specializedTasksTotal: number;
  /** The fee charged by the platform. */
  platformFee: number;
  /** The final total cost for the booking. */
  total: number;
}


/**
 * Represents a geographical point with latitude and longitude.
 * @interface Point
 */
export interface Point {
    /** The latitude of the point. */
    lat: number;
    /** The longitude of the point. */
    lng: number;
}

export interface Maneuver {
    instruction: string;
    type: number;
    time: number;
    length: number;
    cost: number;
    begin_shape_index: number;
    end_shape_index: number;
    verbal_pre_transition_instruction?: string;
    verbal_post_transition_instruction?: string;
    street_names?: string[];
}

export interface RouteResponse {
    route: Point[];
    maneuvers: Maneuver[];
}


export interface Booking {
  /** The unique identifier for the booking. */
  id: string;
  /** The cleaner object associated with the booking. */
  cleaner: Cleaner;
  /** The name of the client who made the booking. */
  clientName: string;
  /** The geographical location of the client for the job. */
  clientLocation: Point;
  /** The address of the client for the job. */
  clientAddress: string;
  /** The scheduled date and time of the booking in ISO format. */
  date: string;
  /** The current status of the booking. */
  status: 'upcoming' | 'active' | 'completed';
  /** A description of the service being provided. */
  service: string;
  /** The duration of the booking in hours. */
  hours: number;
  /** An object containing the detailed cost breakdown. */
  costDetails: CostDetails;
  /** An optional list of specialized tasks included in the booking. */
  specializedTasks?: SpecializedTask[];
}

// --- Messaging Types ---

/**
 * Represents a single message within a conversation.
 * @interface Message
 */
export interface Message {
  /** The unique identifier for the message. */
  id: string;
  /** The ID of the sender ('client' for the user, or the cleaner's ID). */
  senderId: 'client' | number;
  /** The text content of the message. */
  text: string;
  /** The timestamp of when the message was sent, in ISO format. */
  timestamp: string;
}

/**
 * Represents a conversation between a client and a cleaner.
 * @interface Conversation
 */
export interface Conversation {
  /** The unique identifier for the conversation (e.g., 'client-1'). */
  id: string;
  /** The cleaner object involved in the conversation. */
  cleaner: Cleaner;
  /** An array of all messages in the conversation. */
  messages: Message[];
  /** A preview of the last message, for display in the conversation list. */
  lastMessagePreview?: string;
  /** The timestamp of the last message, for sorting the conversation list. */
  lastMessageTimestamp?: string;
}