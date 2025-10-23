# DustInTime - Microservices Architecture

This repository contains the microservices-based backend and frontend applications for the DustInTime application.

## Features

### Client Application (`client-app`)

- **User Authentication:** Secure user registration and login.
- **Client Onboarding:** New clients can set up their profile with their address and property details.
- **Search:** Find cleaners using a powerful search engine.
- **Cleaner Profiles:** View detailed cleaner profiles, including their services, ratings, and reviews.
- **Booking:** Book a cleaner for a specific date and time.
- **Dashboard:** View and manage your bookings.
- **Real-time Job Tracking:** Track your cleaner's location in real-time.
- **Reviews:** Submit and view reviews for cleaners.
- **Advanced Filtering & Sorting:** Filter and sort cleaners by various criteria.
- **Favorites:** Mark cleaners as favorites for easy access.
- **AI-Powered Task Lists:** Generate custom cleaning checklists using AI.

### Cleaner Application (`cleaner-app`)

- **User Authentication:** Secure user registration and login.
- **Cleaner Onboarding:** New cleaners can set up their profile and services.
- **Dashboard:** View and manage your job schedule.
- **Job Management:** View upcoming jobs and update their status.
- **Navigation:** Get turn-by-turn navigation to a client's location.

### Backend Microservices

- **API Gateway:** The single entry point for all client applications, handling request routing, authentication, and WebSocket proxying.
- **Search Service:** An Elasticsearch-based service for searching and filtering cleaners.
- **Cleaner Service:** Manages cleaner profiles, authentication, and onboarding.
- **Booking Service:** Manages the lifecycle of bookings.
- **Booking Processing Service:** Asynchronously processes booking requests from a Kafka queue, finds available cleaners, and sends notifications. Uses a distributed lock to prevent double-booking.
- **Cleaner Location Service:** Tracks cleaner locations in real-time using geohashing and emits location updates via WebSockets.
- **Notification Service:** Sends real-time notifications to users via WebSockets.
- **Ranking Analyzer Service:** Ranks cleaners based on a combination of ratings, job completion history, and other performance metrics.
- **Review Service:** Manages reviews for cleaners.
- **WebSocket Service:** Handles real-time communication with clients for features like notifications and location tracking.

## Architecture

The architecture is based on a set of independent microservices that communicate with each other through a combination of synchronous (REST APIs) and asynchronous (Kafka) communication.

The main components of the architecture are:

*   **API Gateway:** The single entry point for all client applications.
*   **Search & Booking:** Services for finding and booking cleaners.
*   **Booking Management:** Services for managing the lifecycle of cleaning jobs.
*   **Cleaner & Location Services:** Services for managing cleaner profiles and tracking their locations.

## Services

*   `api-gateway`: The API Gateway that routes requests to the other services.
*   `search-service`: The service for searching for cleaners.
*   `cleaner-service`: The service for managing cleaner profiles.
*   `booking-service`: The service for creating and managing bookings.
*   `booking-processing-service`: The service that processes booking requests from the Kafka queue.
*   `cleaner-location-service`: The service for tracking cleaner locations.
*   `notification-service`: The service for sending notifications to users.
*   `ranking-analyzer-service`: The service for ranking cleaners.
*   `review-service`: The service for managing reviews for cleaners.
*   `websocket-service`: The service that handles real-time communication with clients.

## Infrastructure

*   **PostgreSQL:** The main database for the application.
*   **Elasticsearch:** The search engine for finding cleaners.
*   **Kafka:** The message broker for asynchronous communication between services.
*   **Zookeeper:** A required dependency for Kafka.
*   **Redis:** Used for distributed locking.

## Getting Started

To run the application, you will need to have Docker and Docker Compose installed.

1.  Clone this repository.
2.  Run `docker-compose up` to start the services.

The API Gateway will be available at `http://localhost:3000`.
