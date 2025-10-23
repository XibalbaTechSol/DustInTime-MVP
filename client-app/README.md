# Dust in Time - Cleaner Booking Application

<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

"Dust in Time" is a full-stack web application designed to connect clients with cleaning professionals. It features a dynamic, map-based interface for finding cleaners, a comprehensive booking system, user authentication, and an AI-powered tool for generating custom cleaning checklists.



## Tech Stack

### Frontend

*   **Framework:** React (v18.2.0)
*   **Language:** TypeScript
*   **Build Tool:** Vite
*   **Styling:** Tailwind CSS
*   **Mapping:** Leaflet.js with Markercluster
*   **Routing:** Custom routing logic in `App.tsx`
*   **HTTP Client:** Fetch API

### Backend

*   **Framework:** Node.js with Express.js
*   **Language:** JavaScript
*   **Database:** `lowdb` (a simple JSON file-based database)
*   **Authentication:** JWT (JSON Web Tokens) with bcrypt for password hashing
*   **AI Integration:** Google Generative AI

## Features

### For Clients

*   **Interactive Map View:** Find cleaners visually on a map with marker clustering for performance.
*   **Advanced Filtering & Sorting:** Filter cleaners by services, price, rating, and availability. Sort results by proximity, price, or rating.
*   **Detailed Cleaner Profiles:** View comprehensive profiles with bios, services, reviews, and photo galleries.
*   **Seamless Booking:** Book a cleaner with an intuitive booking process.
*   **Dashboard:** Manage your bookings and view your upcoming appointments.
*   **Real-Time Job Tracking:** Clients can track their cleaner's arrival on a live map.
*   **AI-Powered Task Lists:** Generate custom cleaning checklists by describing a job in natural language.
*   **Secure Authentication:** User registration and login system using JWT.
*   **Light & Dark Modes:** The UI supports both light and dark themes.

### For Cleaners

*   **Dashboard:** View your upcoming jobs and manage your schedule.
*   **Turn-by-Turn Navigation:** Get turn-by-turn navigation to your client's location.
*   **Job Management:** Start and complete jobs, and update the job status.

## Project Structure

The project is organized into two main parts: the frontend and the backend.

```
/
├── backend/
│   ├── node_modules/
│   ├── .env
│   ├── db.js
│   ├── index.js
│   ├── package.json
│   └── package-lock.json
├── components/
│   ├── AdvancedFilters.tsx
│   ├── BadgeDisplay.tsx
│   ├── BookingModal.tsx
│   ├── BookingPage.tsx
│   ├── CleanerCard.tsx
│   ├── CleanerListRow.tsx
│   ├── CleanerNavigationMap.tsx
│   ├── CleanerNavigationPage.tsx
│   ├── CleanerProfilePage.tsx
│   ├── Dashboard.tsx
│   ├── Footer.tsx
│   ├── GenerateListModal.tsx
│   ├── Header.tsx
│   ├── HomePage.tsx
│   ├── InstantBookModal.tsx
│   ├── JobStatusTracker.tsx
│   ├── JobTrackingMap.tsx
│   ├── JobTrackingPage.tsx
│   ├── LocationPromptModal.tsx
│   ├── LoginPage.tsx
│   ├── Map.tsx
│   ├── MapCleanerCard.tsx
│   ├── MessagesPage.tsx
│   ├── README.md
│   ├── RegisterPage.tsx
│   ├── ServiceFilter.tsx
│   ├── Settings.tsx
│   ├── SplashScreen.tsx
│   ├── StarRating.tsx
│   ├── TaskLists.tsx
│   └── ThemeToggle.tsx
├── contexts/
│   ├── AuthContext.tsx
│   └── AuthProvider.tsx
├── public/
│   └── logo.png
├── .dockerignore
├── .gitignore
├── App.tsx
├── constants.ts
├── debug-frontend.sh
├── docker_deployment.log
├── Dockerfile
├── frontend.log
├── gemini-debug.txt
├── index.html
├── index.tsx
├── metadata.json
├── package.json
├── package-lock.json
├── README.md
├── tsconfig.json
├── types.ts
├── utils.ts
└── vite.config.ts
```

### Frontend

The frontend code is located in the root directory.

*   **`App.tsx`:** The main component that handles routing, authentication, and data fetching.
*   **`components/`:** Contains all the React components.
*   **`contexts/`:** Contains the React contexts for authentication.
*   **`public/`:** Contains the public assets.
*   **`types.ts`:** Contains all the TypeScript types.
*   **`utils.ts`:** Contains utility functions.
*   **`vite.config.ts`:** The Vite configuration file.

### Backend

The backend code is located in the `backend/` directory.

*   **`index.js`:** The main entry point for the backend server.
*   **`db.js`:** The `lowdb` database setup.
*   **`.env`:** The environment variables file.

## Getting Started

To run the full application locally, you will need to run both the frontend and backend servers.

**Prerequisites:** Node.js

### 1. Backend Setup

First, set up and run the backend server.

```bash
# 1. Navigate to the backend directory
cd backend

# 2. Install backend dependencies
npm install

# 3. Create a .env file and add your keys
cp .env.example .env
# Now, open the .env file and add your API_KEY and a JWT_SECRET

# 4. Start the backend server
npm start
```

The backend will be running on `http://localhost:3001`.

### 2. Frontend Setup

Next, in a separate terminal, set up and run the frontend development server.

```bash
# From the root directory of the project

# 1. Install frontend dependencies
npm install

# 2. Run the frontend development server
npm run dev
```

The frontend will be running on `http://localhost:5173` (or another port if 5173 is in use). You can now access the application in your browser.

## API Endpoints

The backend provides the following API endpoints:

### Authentication

*   **`POST /api/auth/register`:** Register a new user.
*   **`POST /api/auth/login`:** Login a user and get a JWT token.
*   **`GET /api/auth/me`:** Get the current user's profile.

### Cleaners

*   **`GET /api/cleaners`:** Get a list of all cleaners.
*   **`GET /api/cleaners/:id`:** Get a single cleaner by ID.

### Bookings

*   **`GET /api/bookings`:** Get a list of all bookings.
*   **`POST /api/bookings`:** Create a new booking.
*   **`PUT /api/bookings/:id`:** Update a booking.

### AI

*   **`POST /api/generate`:** Generate a cleaning checklist.

## Components

### `App.tsx`

The main component of the application. It handles:

*   **Routing:** It uses a custom routing logic to render the correct page based on the `page` state.
*   **Authentication:** It manages the user's authentication state and handles login and logout.
*   **Data Fetching:** It fetches the initial data (cleaners and bookings) from the backend.

### `HomePage.tsx`

The main page of the application. It features:

*   **Map View:** A Leaflet map with markers for each cleaner.
*   **List View:** A list of cleaners with their details.
*   **Filtering and Sorting:** Advanced filtering and sorting options for the cleaners.
*   **Location Services:** It uses the browser's geolocation API to find the user's location and show the nearest cleaners.

### `CleanerNavigationPage.tsx`

This page is for cleaners to navigate to their client's location. It features:

*   **Map View:** A Leaflet map with the route from the cleaner's location to the client's location.
*   **Turn-by-Turn Instructions:** A list of turn-by-turn instructions for the route.

### `BookingPage.tsx`

This page allows clients to book a cleaner. It shows the cleaner's availability and allows the client to select a date and time for the cleaning.

### `Dashboard.tsx`

The user's dashboard. It shows a list of upcoming and past bookings for clients, and a list of upcoming jobs for cleaners.

## Future Improvements

*   **Real-time chat:** Implement a real-time chat feature for clients and cleaners to communicate.
*   **Payment integration:** Integrate a payment gateway to handle payments for the cleaning services.
*   **Admin panel:** Create an admin panel to manage users, cleaners, and bookings.
*   **Push notifications:** Implement push notifications to notify users about their bookings.
*   **Tests:** Add unit and integration tests to the codebase.
