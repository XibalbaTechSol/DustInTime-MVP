<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Dust in Time - Cleaning Service Marketplace

**Dust in Time** is a modern, full-stack web application that simulates a booking platform for cleaning services. It connects clients with professional cleaners, providing a seamless experience from searching and booking to job tracking and communication. The application is built with a React/TypeScript frontend and a Node.js/Express backend, and it features an AI-powered task list generator using the Google Gemini API.

## ✨ Key Features

- **Interactive Map & List Views**: Discover cleaners using an interactive map with marker clustering or a filterable list view.
- **Advanced Search & Filtering**: Filter cleaners by services offered, price range, rating, availability, and favorites. Sort results by distance, rating, or price.
- **Detailed Cleaner Profiles**: View comprehensive profiles for each cleaner, including their bio, services, availability, photo gallery, and customer reviews.
- **Seamless Booking System**: Clients can book cleaners through a multi-step booking page or a "Quick Book" modal for standard services.
- **Real-Time Job Tracking**: Clients can track their cleaner's location in real-time as they travel to the job site.
- **Live Status Updates**: Both clients and cleaners see live updates on the job status, from "En Route" to "In Progress" and "Completed".
- **In-App Messaging**: A built-in messaging system allows clients and cleaners to communicate directly.
- **AI-Powered Task Lists**: Users can generate customized cleaning checklists by providing a natural language prompt (e.g., "post-party cleanup").
- **Role-Based Dashboards**: Separate dashboard views for clients and cleaners to manage their bookings and jobs.
- **Light/Dark Mode**: A theme toggle allows users to switch between light and dark modes for comfortable viewing.

## 🛠️ Tech Stack

- **Frontend**: React, TypeScript, Vite, Tailwind CSS, Leaflet.js
- **Backend**: Node.js, Express.js
- **Database**: LowDB (a simple JSON file-based database for demonstration)
- **AI**: Google Gemini API for task list generation
- **Authentication**: JWT (JSON Web Tokens) with bcrypt for password hashing

## 🚀 Getting Started

Follow these instructions to get the project running on your local machine.

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or later recommended)
- [npm](https://www.npmjs.com/)

### 1. Clone the Repository

```bash
git clone <repository-url>
cd <repository-directory>
```

### 2. Backend Setup

The backend server handles API requests, authentication, and communication with the database and the Gemini API.

```bash
# Navigate to the backend directory
cd backend

# Install backend dependencies
npm install

# Create a .env file from the example
cp .env.example .env
```

Now, open the newly created `.env` file and add your credentials:
- `GEMINI_API_KEY`: Your API key from [Google AI Studio](https://ai.google.dev/).
- `JWT_SECRET`: A long, random, and secret string for signing authentication tokens (e.g., you can generate one [here](https://www.grc.com/passwords.htm)).

### 3. Frontend Setup

The frontend is a single-page application built with React and Vite.

```bash
# Navigate back to the project's root directory
cd ..

# Install frontend dependencies
npm install
```

### 4. Running the Application

You need to run both the backend and frontend servers simultaneously in separate terminal windows.

**Terminal 1: Start the Backend**
From the project's **root directory**:
```bash
npm run backend
# The backend server will start on http://localhost:3001
```

**Terminal 2: Start the Frontend**
From the project's **root directory**:
```bash
npm run dev
# The frontend development server will start, typically on http://localhost:5173
```

Open your web browser and navigate to the address provided by Vite (e.g., `http://localhost:5173`).

## 📖 How to Use

- **Login/Register**: Use the login or register pages to simulate user authentication. A mock user is also created by default in `App.tsx` for immediate access.
- **Find a Cleaner**: On the homepage, use the map or list view to browse cleaners. Use the search bar and filters to narrow down your options.
- **Book a Service**: Click "View Profile" on a cleaner card, then click "Book Now" to go through the detailed booking process. Alternatively, use the "Quick Book" option from the list view for a faster experience.
- **Track Your Job**: Once a job is active, you can track the cleaner's progress from the client dashboard.
- **Generate a Checklist**: In the client dashboard, find the "Task Lists" section and use the "Generate with AI" button to create a new cleaning checklist.