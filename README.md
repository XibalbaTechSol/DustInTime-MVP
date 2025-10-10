<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Dust in Time - Cleaner Booking Application

"Dust in Time" is a full-stack web application designed to connect clients with cleaning professionals. It features a dynamic, map-based interface for finding cleaners, a comprehensive booking system, user authentication, and an AI-powered tool for generating custom cleaning checklists.

View your app in AI Studio: https://ai.studio/apps/drive/14diFqwGnN5NLDJyPD_x8WTOgPy1Sj_eP

## Tech Stack

-   **Frontend:** React, TypeScript, Vite, Tailwind CSS, Leaflet.js
-   **Backend:** Node.js, Express.js
-   **Database:** `lowdb` (a simple JSON file-based database)
-   **Authentication:** JWT (JSON Web Tokens)
-   **AI Integration:** Google Generative AI (Gemini)

## Project Structure

The project is organized into two main parts:

-   **Root Directory (Frontend):** The main application is a React single-page application (SPA). All frontend-related files, including components, types, and utilities, are located in the root directory and its subdirectories (`components/`, `contexts/`, etc.).
-   **`backend/` Directory:** This directory contains a self-contained Node.js and Express server that provides the RESTful API for the frontend. It handles data, authentication, and communication with the Google AI service.

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
# Now, open the .env file and add your GEMINI_API_KEY and a JWT_SECRET

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

## Key Features

-   **Interactive Map View:** Find cleaners visually on a map with marker clustering for performance.
-   **Advanced Filtering & Sorting:** Filter cleaners by services, price, rating, and availability. Sort results by proximity, price, or rating.
-   **Detailed Cleaner Profiles:** View comprehensive profiles with bios, services, reviews, and photo galleries.
-   **Role-Based Dashboards:** Separate dashboard views for clients (manage bookings) and cleaners (view jobs).
-   **Real-Time Job Tracking:** Clients can track their cleaner's arrival on a live map.
-   **AI-Powered Task Lists:** Generate custom cleaning checklists by describing a job in natural language.
-   **Secure Authentication:** User registration and login system using JWT.
-   **Light & Dark Modes:** The UI supports both light and dark themes.